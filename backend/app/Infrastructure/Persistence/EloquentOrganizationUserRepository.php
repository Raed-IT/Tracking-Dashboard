<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Access\Contracts\OrganizationUserRepository;
use App\Domain\Access\Enums\OrganizationRole;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

final class EloquentOrganizationUserRepository implements OrganizationUserRepository
{
    public function paginate(Organization $organization, int $perPage = 25, ?string $search = null, ?string $role = null): LengthAwarePaginator
    {
        return $organization->users()
            ->when($search, fn ($query) => $query->where(fn ($members) => $members
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")))
            ->when($role, fn ($query) => $query->wherePivot('role', $role))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findMember(Organization $organization, User $user): User
    {
        return $organization->users()->whereKey($user->id)->firstOrFail();
    }

    public function create(Organization $organization, array $attributes): User
    {
        return DB::transaction(function () use ($organization, $attributes): User {
            $user = User::create(['name' => $attributes['name'], 'email' => $attributes['email'], 'password' => $attributes['password']]);
            $organization->users()->attach($user, ['role' => $attributes['role']]);

            return $this->findMember($organization, $user);
        });
    }

 public function update(
    Organization $organization,
    User $user,
    array $attributes
): User {
    return DB::transaction(function () use ($organization, $user, $attributes): User {

        // تأكد أن المستخدم عضو فعلاً في المنظمة
        $member = $organization->users()
            ->whereKey($user->id)
            ->firstOrFail();

        $userData = [];

        if (array_key_exists('name', $attributes)) {
            $userData['name'] = $attributes['name'];
        }

        if (array_key_exists('email', $attributes)) {
            $userData['email'] = $attributes['email'];
        }

        if (!empty($attributes['password'])) {
            $userData['password'] = bcrypt($attributes['password']);
        }

        if ($userData !== []) {
            $member->update($userData);
        }

        if (array_key_exists('role', $attributes)) {
            $role = $attributes['role'];

            if ($role instanceof OrganizationRole) {
                $role = $role->value;
            }

            $organization->users()->updateExistingPivot(
                $member->id,
                ['role' => $role]
            );
        }

        return $member->fresh();
    });
}
    public function remove(Organization $organization, User $user): void
    {
        DB::transaction(function () use ($organization, $user): void {
            $organization->users()->detach($user);
            if (! $user->organizations()->exists()) {
                $user->delete();
            }
        });
    }

    public function administratorCount(Organization $organization): int
    {
        return $organization->users()->wherePivot('role', OrganizationRole::Administrator->value)->count();
    }
}
