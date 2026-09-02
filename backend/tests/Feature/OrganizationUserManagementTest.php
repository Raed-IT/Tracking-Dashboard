<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

final class OrganizationUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_update_list_and_delete_members(): void
    {
        [$administrator, $organization] = $this->member('administrator', 'admin@test.local');
        Sanctum::actingAs($administrator);

        $created = $this->postJson('/api/v1/organization/users', [
            'name' => 'Night Operator', 'email' => 'night@test.local', 'password' => 'temporary-secret', 'role' => 'operator',
        ])->assertCreated()->assertJsonPath('data.role', 'operator');

        $uuid = $created->json('data.id');
        $this->getJson('/api/v1/organization/users')->assertOk()->assertJsonFragment(['email' => 'night@test.local']);
        $this->putJson("/api/v1/organization/users/$uuid", ['name' => 'Night Supervisor', 'email' => 'night@test.local', 'role' => 'supervisor'])
            ->assertOk()->assertJsonPath('data.role', 'supervisor');
        $this->deleteJson("/api/v1/organization/users/$uuid")->assertNoContent();
        $this->assertDatabaseMissing('users', ['email' => 'night@test.local']);
    }

    public function test_viewer_cannot_manage_users(): void
    {
        [$viewer] = $this->member('viewer', 'viewer@test.local');
        Sanctum::actingAs($viewer);

        $this->getJson('/api/v1/organization/users')->assertForbidden();
    }

    public function test_administrator_cannot_delete_self(): void
    {
        [$administrator] = $this->member('administrator', 'admin@test.local');
        Sanctum::actingAs($administrator);

        $this->deleteJson("/api/v1/organization/users/{$administrator->uuid}")->assertUnprocessable();
    }

    /** @return array{User, Organization} */
    private function member(string $role, string $email): array
    {
        $organization = Organization::create(['name' => 'Test Operations', 'slug' => 'test-'.str_replace('@', '-', $email)]);
        $user = User::factory()->create(['email' => $email]);
        $user->organizations()->attach($organization, ['role' => $role]);
        $user->load('organizations');

        return [$user, $organization];
    }
}
