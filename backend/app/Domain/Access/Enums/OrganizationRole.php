<?php

declare(strict_types=1);

namespace App\Domain\Access\Enums;

enum OrganizationRole: string
{
    case Administrator = 'administrator';
    case Supervisor = 'supervisor';
    case Operator = 'operator';
    case Viewer = 'viewer';

    /** @return list<array{value: string, label: string, permissions: list<string>}> */
    public static function definitions(): array
    {
        return array_map(
            static fn (self $role): array => [
                'value' => $role->value,
                'label' => $role->label(),
                'permissions' => $role->permissions(),
            ],
            self::cases(),
        );
    }

    public function label(): string
    {
        return ucfirst($this->value);
    }

    /** @return list<string> */
    public function permissions(): array
    {
        return match ($this) {
            self::Administrator => Permission::values(),
            self::Supervisor => [
                Permission::TracksView->value,
                Permission::SourcesView->value,
                Permission::AlertsView->value,
                Permission::AlertsManage->value,
                Permission::GeofencesView->value,
                Permission::GeofencesManage->value,
                Permission::DashboardView->value,
                Permission::DashboardManage->value,
            ],
            self::Operator => [
                Permission::TracksView->value,
                Permission::SourcesView->value,
                Permission::AlertsView->value,
                Permission::AlertsManage->value,
                Permission::GeofencesView->value,
                Permission::DashboardView->value,
            ],
            self::Viewer => [
                Permission::TracksView->value,
                Permission::SourcesView->value,
                Permission::AlertsView->value,
                Permission::GeofencesView->value,
                Permission::DashboardView->value,
            ],
        };
    }
}
