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

    /** @return list<array{value: string, label: string, description: string, category: string}> */
    public static function definitions(): array
    {
        return array_map(
            static fn (self $permission): array => [
                'value' => $permission->value,
                'label' => $permission->label(),
                'description' => $permission->description(),
                'category' => $permission->category(),
            ],
            self::cases(),
        );
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(
            static fn (self $permission): string => $permission->value,
            self::cases(),
        );
    }

    public function label(): string
    {
        return match ($this) {
            self::TracksView => 'View tracks',
            self::SourcesView => 'View data sources',
            self::SourcesManage => 'Manage data sources',
            self::AlertsView => 'View alerts',
            self::AlertsManage => 'Manage alerts',
            self::GeofencesView => 'View geofences',
            self::GeofencesManage => 'Manage geofences',
            self::DashboardView => 'View dashboard',
            self::DashboardManage => 'Manage dashboard',
            self::UsersManage => 'Manage users',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::TracksView => 'Monitor live aircraft and inspect track history.',
            self::SourcesView => 'Inspect source health and ingestion activity.',
            self::SourcesManage => 'Create, enable, and configure data sources.',
            self::AlertsView => 'Review active operational alerts.',
            self::AlertsManage => 'Acknowledge and resolve operational alerts.',
            self::GeofencesView => 'Review configured geofences and boundaries.',
            self::GeofencesManage => 'Create and maintain geofences.',
            self::DashboardView => 'Open the operations dashboard.',
            self::DashboardManage => 'Customize dashboard layouts and widgets.',
            self::UsersManage => 'Create users and assign access roles.',
        };
    }

    public function category(): string
    {
        return match ($this) {
            self::TracksView, self::SourcesView, self::SourcesManage => 'Operations',
            self::AlertsView, self::AlertsManage, self::GeofencesView, self::GeofencesManage => 'Safety',
            self::DashboardView, self::DashboardManage => 'Workspace',
            self::UsersManage => 'Administration',
        };
    }
}
