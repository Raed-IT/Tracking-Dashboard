<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Role;
use App\Models\RolePermission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

final class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_superadmin_can_delete_custom_roles(): void
    {
        $role = Role::query()->create([
            'name' => 'Custom operator',
            'slug' => 'custom-operator',
            'description' => 'Custom operator role.',
            'is_system' => false,
        ]);
        RolePermission::query()->create(['role' => $role->slug, 'permission' => 'users.manage']);

        $user = User::factory()->create(['role' => $role->slug]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/v1/auth/roles/{$role->slug}")
            ->assertForbidden();
        $this->assertDatabaseHas('roles', ['slug' => $role->slug]);
    }

    public function test_superadmin_can_delete_custom_roles(): void
    {
        $role = Role::query()->create([
            'name' => 'Temporary role',
            'slug' => 'temporary-role',
            'description' => 'Temporary role.',
            'is_system' => false,
        ]);
        $assignedUser = User::factory()->create(['role' => $role->slug]);
        $superadmin = User::factory()->create(['role' => 'superadmin']);
        Sanctum::actingAs($superadmin);

        $this->deleteJson("/api/v1/auth/roles/{$role->slug}")
            ->assertOk();

        $this->assertDatabaseMissing('roles', ['slug' => $role->slug]);
        $this->assertDatabaseHas('users', ['uuid' => $assignedUser->uuid, 'role' => 'viewer']);
    }
}
