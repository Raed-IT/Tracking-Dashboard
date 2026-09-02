<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_read_identity_and_logout(): void
    {
        [$user] = $this->member('operator');

        $login = $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'secret-password']);

        $login->assertOk()
            ->assertJsonPath('user.id', $user->uuid)
            ->assertJsonPath('user.role', 'operator')
            ->assertJsonPath('user.permissions.0', 'tracks.view');

        $token = $login->json('token');
        $this->withToken($token)->getJson('/api/v1/auth/user')->assertOk()->assertJsonPath('data.email', $user->email);
        $this->withToken($token)->postJson('/api/v1/auth/logout')->assertNoContent();
        $this->withToken($token)->getJson('/api/v1/auth/user')->assertUnauthorized();
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        [$user] = $this->member('viewer');

        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_protected_routes_require_authentication(): void
    {
        $this->getJson('/api/v1/tracks')->assertUnauthorized();
        $this->getJson('/api/v1/sources')->assertUnauthorized();
    }

    /** @return array{User, Organization} */
    private function member(string $role): array
    {
        $organization = Organization::create(['name' => 'Test Operations', 'slug' => 'test-operations']);
        $user = User::factory()->create(['password' => 'secret-password']);
        $user->organizations()->attach($organization, ['role' => $role]);

        return [$user, $organization];
    }
}
