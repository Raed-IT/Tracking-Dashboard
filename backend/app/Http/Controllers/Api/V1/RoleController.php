<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Access\Enums\OrganizationRole;
use App\Domain\Access\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RolePermission;
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
            'name' => ['required', 'string', 'min:2', 'max:80', Rule::unique('roles', 'name')],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', 'in:'.implode(',', Permission::values())],
        ]);

        $slug = $this->slugifyRoleName((string) $validated['name']);
        abort_if(OrganizationRole::tryFrom($slug) !== null || Role::query()->where('slug', $slug)->exists(), 422, 'Role already exists.');

        $role = DB::transaction(function () use ($validated, $slug): Role {
            return Role::query()->create([
                'name' => trim((string) $validated['name']),
                'slug' => $slug,
                'description' => $validated['description'] ?? null,
                'is_system' => false,
            ]);
        });

        $this->syncPermissions($role->slug, $validated['permissions']);

        return response()->json(['data' => $this->definitions()], 201);
    }

    public function update(Request $request, string $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:80'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'permissions' => ['sometimes', 'required', 'array'],
            'permissions.*' => ['string', 'in:'.implode(',', Permission::values())],
        ]);

        if (OrganizationRole::tryFrom($role) !== null) {
            $this->syncPermissions($role, $validated['permissions'] ?? RolePermission::query()->where('role', $role)->pluck('permission')->all());

            return response()->json(['data' => $this->definitions()]);
        }

        $record = Role::query()->where('slug', $role)->first();
        abort_unless($record, 404, 'Unknown role.');

        if (isset($validated['name'])) {
            $slug = $this->slugifyRoleName((string) $validated['name']);
            abort_if(($slug !== $record->slug && (OrganizationRole::tryFrom($slug) !== null || Role::query()->where('slug', $slug)->whereKeyNot($record->getKey())->exists())), 422, 'Role already exists.');
            $record->name = trim((string) $validated['name']);
            $record->slug = $slug;
        }

        if (array_key_exists('description', $validated)) {
            $record->description = $validated['description'];
        }

        $record->save();

        if (array_key_exists('permissions', $validated)) {
            $this->syncPermissions($record->slug, $validated['permissions']);
        }

        return response()->json(['data' => $this->definitions()]);
    }

    public function destroy(string $role): JsonResponse
    {
        $record = Role::query()->where('slug', $role)->first();
        abort_unless($record, 404, 'Unknown role.');
        abort_if($record->is_system, 422, 'System roles cannot be deleted.');

        DB::transaction(function () use ($record): void {
            RolePermission::query()->where('role', $record->slug)->delete();
            $record->delete();
        });

        return response()->json(['data' => $this->definitions()]);
    }

    private function syncPermissions(string $role, array $permissions): void
    {
        DB::transaction(function () use ($role, $permissions): void {
            RolePermission::query()->where('role', $role)->delete();
            $unique = array_values(array_unique($permissions));

            if ($unique !== []) {
                RolePermission::query()->insert(array_map(
                    static fn (string $permission): array => ['role' => $role, 'permission' => $permission],
                    $unique,
                ));
            }
        });
    }

    private function definitions(): array
    {
        $definitions = array_map(
            static fn (OrganizationRole $role): array => [
                'value' => $role->value,
                'label' => $role->label(),
                'permissions' => RolePermission::query()->where('role', $role->value)->pluck('permission')->values()->all(),
                'description' => sprintf('%s default organization role.', $role->label()),
                'is_system' => true,
            ],
            OrganizationRole::cases(),
        );

        $seen = array_map(static fn (array $role): string => $role['value'], $definitions);

        foreach (Role::query()->orderBy('name')->get() as $role) {
            if (in_array($role->slug, $seen, true)) {
                continue;
            }

            $definitions[] = [
                'id' => $role->getKey(),
                'value' => $role->slug,
                'label' => $role->name,
                'permissions' => RolePermission::query()->where('role', $role->slug)->pluck('permission')->values()->all(),
                'description' => $role->description,
                'is_system' => false,
            ];

            $seen[] = $role->slug;
        }

        return $definitions;
    }

    private function slugifyRoleName(string $name): string
    {
        return (string) Str::of($name)->trim()->slug('-');
    }
}
