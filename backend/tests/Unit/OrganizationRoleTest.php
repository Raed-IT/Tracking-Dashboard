<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Domain\Access\Enums\OrganizationRole;
use App\Domain\Access\Enums\Permission;
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

    public function test_permission_definitions_explain_each_capability(): void
    {
        $definitions = Permission::definitions();

        $this->assertCount(count(Permission::cases()), $definitions);
        $this->assertSame('Manage users', $definitions[array_search('users.manage', array_column($definitions, 'value'), true)]['label']);
        $this->assertNotSame('', $definitions[0]['description']);
    }
}
