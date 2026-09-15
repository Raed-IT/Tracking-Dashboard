<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Access\Enums\OrganizationRole;
use App\Domain\Access\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RolePermission;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

final class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->definitions(),
            'permission_definitions' => Permission::definitions(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:80'],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', Rule::in(Permission::values())],
        ]);

        $slug = $this->slugifyRoleName((string) $validated['name']);
        $canonicalSlug = OrganizationRole::canonical($slug);

        if ($slug === '' || $canonicalSlug !== $slug && OrganizationRole::tryFrom($canonicalSlug) !== null || Role::query()->where('slug', $slug)->exists() || Role::query()->where('slug', $canonicalSlug)->exists()) {
            abort(422, 'A role with that name already exists.');
        }

        $role = Role::query()->create([
            'name' => trim((string) $validated['name']),
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'is_system' => false,
        ]);

        $this->syncPermissions($role->slug, $validated['permissions']);

        return response()->json(['data' => $this->definitions()]);
    }

    public function update(Request $request, string $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:80'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'permissions' => ['sometimes', 'required', 'array'],
            'permissions.*' => ['string', Rule::in(Permission::values())],
        ]);

        $model = Role::query()->where('slug', $role)->first();
        $roleSlug = $model?->slug ?? OrganizationRole::canonical($role);

        if ($model !== null && $model->is_system === true) {
            $roleSlug = $model->slug;
        }

        if ($model === null && OrganizationRole::tryFrom($role) === null && OrganizationRole::tryFrom($roleSlug) === null) {
            abort(404, 'Role not found.');
        }

        if ($model !== null && ! $model->is_system) {
            if (array_key_exists('name', $validated)) {
                $nextSlug = $this->slugifyRoleName((string) $validated['name']);
                $canonicalNextSlug = OrganizationRole::canonical($nextSlug);
                if ($nextSlug !== '' && (($nextSlug !== $model->slug && Role::query()->where('slug', $nextSlug)->exists()) || ($canonicalNextSlug !== $nextSlug && OrganizationRole::tryFrom($canonicalNextSlug) !== null) || ($nextSlug !== $model->slug && Role::query()->where('slug', $canonicalNextSlug)->exists()))) {
                    abort(422, 'A role with that name already exists.');
                }
                $previousSlug = $model->slug;
                $model->name = trim((string) $validated['name']);
                $model->slug = $nextSlug;
                $model->save();
                if ($previousSlug !== $nextSlug) {
                    User::query()->where('role', $previousSlug)->update(['role' => $nextSlug]);
                    RolePermission::query()->where('role', $previousSlug)->delete();
                }
                $roleSlug = $model->slug;
            }

            if (array_key_exists('description', $validated)) {
                $model->description = $validated['description'];
                $model->save();
            }
        }

        $rolePermissions = RolePermission::query()
            ->whereIn('role', array_values(array_unique([$roleSlug, OrganizationRole::canonical($roleSlug)])))
            ->pluck('permission')
            ->all();

        $this->syncPermissions($roleSlug, $validated['permissions'] ?? $rolePermissions);

        return response()->json(['data' => $this->definitions()]);
    }

    public function destroy(Request $request, string $role): JsonResponse
    {
        abort_unless(
            OrganizationRole::canonical((string) $request->user()?->role) === OrganizationRole::Superadmin->value,
            403,
            'Only super admins can delete roles.',
        );

        $model = Role::query()->where('slug', $role)->first();

        if ($model === null) {
            abort(404, 'Role not found.');
        }

        if ($model->is_system) {
            abort(422, 'System roles cannot be deleted.');
        }

        DB::transaction(function () use ($model): void {
            User::query()->where('role', $model->slug)->update(['role' => OrganizationRole::Viewer->value]);
            RolePermission::query()->where('role', $model->slug)->delete();
            $model->delete();
        });

        return response()->json(['data' => $this->definitions()]);
    }

    private function syncPermissions(string $role, array $permissions): void
    {
        $canonicalRole = OrganizationRole::canonical($role);
        $rolesToClear = $role === $canonicalRole || OrganizationRole::tryFrom($role) !== null || Role::query()->where('slug', $role)->where('is_system', true)->exists()
            ? array_values(array_unique([$role, $canonicalRole]))
            : [$role];

        DB::transaction(function () use ($rolesToClear, $role, $permissions): void {
            foreach ($rolesToClear as $roleName) {
                RolePermission::query()->where('role', $roleName)->delete();
            }

            $unique = array_values(array_unique($permissions));

            if ($unique !== []) {
                RolePermission::query()->insert(array_map(
                    static fn (string $permission): array => ['role' => $role, 'permission' => $permission],
                    $unique,
                ));
            }
        });
    }

    private function permissionsForRole(string $role): array
    {
        $role = OrganizationRole::canonical($role);

        return RolePermission::query()->where('role', $role)->pluck('permission')->values()->all();
    }

    private function definitions(): array
    {
        $roles = Role::query()->orderBy('name')->get();
        $definitions = $roles->map(fn (Role $role): array => [
            'value' => $role->slug,
            'label' => $role->name,
            'permissions' => $this->permissionsForRole($role->slug),
            'description' => $role->description ?: sprintf('%s role.', $role->name),
            'is_system' => (bool) $role->is_system,
        ])->all();

        foreach (OrganizationRole::cases() as $role) {
            $slug = $role->value;
            if (! in_array($slug, array_map(static fn (array $entry): string => $entry['value'], $definitions), true)) {
                $definitions[] = [
                    'value' => $slug,
                    'label' => $role->label(),
                    'permissions' => $this->permissionsForRole($slug),
                    'description' => sprintf('%s default role.', $role->label()),
                    'is_system' => true,
                ];
            }
        }

        return $definitions;
    }

    private function slugifyRoleName(string $name): string
    {
        return (string) Str::of($name)->trim()->slug('-');
    }
}
