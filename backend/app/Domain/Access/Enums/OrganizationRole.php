<?php

declare(strict_types=1);

namespace App\Domain\Access\Enums;

enum OrganizationRole: string
{
    case Superadmin = 'superadmin';
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

    public static function canonical(string $role): string
    {
        $normalized = strtolower(str_replace(['-', '_', ' '], '', trim($role)));

        return match ($normalized) {
            'admin', 'administrator', 'superadmin' => self::Superadmin->value,
            'supervisor' => self::Operator->value,
            default => $role,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Superadmin => 'Super admin',
            self::Operator => 'Operator',
            self::Viewer => 'Viewer',
        };
    }

    /** @return list<string> */
    public function permissions(): array
    {
        return match ($this) {
            self::Superadmin => Permission::values(),
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
