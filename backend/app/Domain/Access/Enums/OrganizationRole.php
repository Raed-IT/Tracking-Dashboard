<?php

declare(strict_types=1);

namespace App\Domain\Access\Enums;

enum OrganizationRole: string
{
    case Administrator = 'administrator';
    case Supervisor = 'supervisor';
    case Operator = 'operator';
    case Viewer = 'viewer';

    /** @return list<string> */
    public function permissions(): array
    {
        return match ($this) {
            self::Administrator => ['tracks.view', 'sources.view', 'sources.manage', 'alerts.view', 'alerts.manage', 'geofences.view', 'geofences.manage', 'dashboard.view', 'dashboard.manage', 'users.manage'],
            self::Supervisor => ['tracks.view', 'sources.view', 'alerts.view', 'alerts.manage', 'geofences.view', 'geofences.manage', 'dashboard.view', 'dashboard.manage'],
            self::Operator => ['tracks.view', 'sources.view', 'alerts.view', 'alerts.manage', 'geofences.view', 'dashboard.view'],
            self::Viewer => ['tracks.view', 'sources.view', 'alerts.view', 'geofences.view', 'dashboard.view'],
        };
    }
}
