<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Alerts\Models\Alert;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

final class OperatorAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_operator_sees_and_acknowledges_organization_alert(): void
    {
        [$operator,$organization] = $this->member('operator');
        $alert = Alert::create(['organization_id' => $organization->id, 'severity' => 'high', 'state' => 'active', 'title' => 'Boundary intrusion']);
        Sanctum::actingAs($operator);
        $this->getJson('/api/v1/alerts')->assertOk()->assertJsonPath('data.0.id', $alert->uuid);
        $this->postJson("/api/v1/alerts/{$alert->uuid}/acknowledge")->assertOk()->assertJsonPath('data.state', 'acknowledged')->assertJsonPath('data.acknowledged_by.id', $operator->uuid);
    }

    public function test_alerts_from_another_organization_are_not_visible(): void
    {
        [$operator] = $this->member('operator');
        [, $other] = $this->member('operator', 'other');
        Alert::create(['organization_id' => $other->id, 'severity' => 'low', 'state' => 'active', 'title' => 'Other alert']);
        Sanctum::actingAs($operator);
        $this->getJson('/api/v1/alerts')->assertOk()->assertJsonCount(0, 'data');
    }

    private function member(string $role, string $suffix = 'main'): array
    {
        $organization = Organization::create(['name' => "Operations $suffix", 'slug' => "operations-$suffix"]);
        $user = User::factory()->create(['email' => "$role-$suffix@example.com"]);
        $user->organizations()->attach($organization, ['role' => $role]);
        $user->load('organizations');

        return [$user, $organization];
    }
}
