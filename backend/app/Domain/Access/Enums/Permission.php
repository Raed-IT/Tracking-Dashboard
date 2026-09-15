<?php

declare(strict_types=1);

namespace App\Domain\Access\Enums;

enum Permission: string
{
    case TracksView = 'tracks.view';
    case SourcesView = 'sources.view';
    case SourcesManage = 'sources.manage';
    case AlertsView = 'alerts.view';
    case AlertsManage = 'alerts.manage';
    case GeofencesView = 'geofences.view';
    case GeofencesManage = 'geofences.manage';
    case DashboardView = 'dashboard.view';
    case DashboardManage = 'dashboard.manage';
    case UsersManage = 'users.manage';

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(
            static fn (self $permission): string => $permission->value,
            self::cases(),
        );
    }
}
