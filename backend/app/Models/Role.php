<?php

declare(strict_types=1);

namespace App\Models;

use App\Domain\Access\Enums\OrganizationRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_system',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    /** @return list<string> */
    public static function allowedValues(): array
    {
        $values = array_map(
            static fn (OrganizationRole $role): string => $role->value,
            OrganizationRole::cases(),
        );

        return array_values(array_unique(array_merge(
            $values,
            self::query()->pluck('slug')->all(),
        )));
    }

    public function permissions()
    {
        return $this->hasMany(RolePermission::class, 'role', 'slug');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'role', 'slug');
    }
}
