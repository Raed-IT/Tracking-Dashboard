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
        abort(422, 'Custom roles are disabled. Only Super admin, Operator, and Viewer are supported.');
    }

    public function update(Request $request, string $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:80'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'permissions' => ['sometimes', 'required', 'array'],
            'permissions.*' => ['string', 'in:'.implode(',', Permission::values())],
        ]);

        if (OrganizationRole::tryFrom($role) === null) {
            abort(422, 'Custom roles are disabled. Only Super admin, Operator, and Viewer are supported.');
        }

        $rolePermissions = RolePermission::query()
            ->whereIn('role', array_values(array_unique([$role, OrganizationRole::canonical($role)])))
            ->pluck('permission')
            ->all();

        $this->syncPermissions($role, $validated['permissions'] ?? $rolePermissions);

        return response()->json(['data' => $this->definitions()]);
    }

    public function destroy(string $role): JsonResponse
    {
        abort(422, 'Custom roles are disabled. Only Super admin, Operator, and Viewer are supported.');
    }

    private function syncPermissions(string $role, array $permissions): void
    {
        $canonicalRole = OrganizationRole::canonical($role);

        DB::transaction(function () use ($canonicalRole, $permissions): void {
            RolePermission::query()->where('role', $canonicalRole)->delete();
            $unique = array_values(array_unique($permissions));

            if ($unique !== []) {
                RolePermission::query()->insert(array_map(
                    static fn (string $permission): array => ['role' => $canonicalRole, 'permission' => $permission],
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
        return array_map(
            fn (OrganizationRole $role): array => [
                'value' => $role->value,
                'label' => $role->label(),
                'permissions' => $this->permissionsForRole($role->value),
                'description' => sprintf('%s default role.', $role->label()),
                'is_system' => true,
            ],
            OrganizationRole::cases(),
        );
    }

    private function slugifyRoleName(string $name): string
    {
        return (string) Str::of($name)->trim()->slug('-');
    }
}
