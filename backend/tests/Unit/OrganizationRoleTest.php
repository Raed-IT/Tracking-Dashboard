<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Domain\Access\Enums\OrganizationRole;
use PHPUnit\Framework\TestCase;

final class OrganizationRoleTest extends TestCase
{
    public function test_roles_receive_only_their_expected_management_permissions(): void
    {
        $this->assertContains('users.manage', OrganizationRole::Administrator->permissions());
        $this->assertContains('alerts.manage', OrganizationRole::Operator->permissions());
        $this->assertNotContains('sources.manage', OrganizationRole::Viewer->permissions());
        $this->assertContains('tracks.view', OrganizationRole::Viewer->permissions());
    }
}
