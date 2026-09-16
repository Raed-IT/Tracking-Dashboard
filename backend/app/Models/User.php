<?php

namespace App\Models;

use App\Domain\Access\Enums\OrganizationRole;
use App\Domain\Alerts\Events\AlertCreated;
use App\Domain\Alerts\Models\Alert;
use App\Models\RolePermission;
use Database\Factories\UserFactory;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;
class User extends Authenticatable
{    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable;
      

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'name',
        'email',
        'password',
        'role',
    ];
 
    public function uniqueIds(): array
    {
        return ['uuid'];
    }
protected static function booted(): void
{
    static::created(static function ($user): void {
        $alert = Alert::create([
            'uuid' => (string) Str::uuid(),
            'severity' => 'info',
            'state' => 'new',
            'title' => 'New User Created',
            'message' => 'A new user has been created',
        ]);

        event(new AlertCreated($alert));
    });
}
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /** @return list<string> */
    public function permissions(): array
    {
        $role = (string) $this->role;
        $normalized = OrganizationRole::canonical($role);

        return RolePermission::query()
            ->whereIn('role', array_values(array_unique([$role, $normalized])))
            ->pluck('permission')
            ->unique()
            ->values()
            ->all();
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions(), true);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
