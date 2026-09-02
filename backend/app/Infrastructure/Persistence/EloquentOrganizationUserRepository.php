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
    public function paginate(Organization $organization, int $perPage = 50): LengthAwarePaginator
    {
        return $organization->users()->orderBy('name')->paginate($perPage);
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

    public function update(Organization $organization, User $user, array $attributes): User
    {
        DB::transaction(function () use ($organization, $user, $attributes): void {
            $user->update(array_filter(['name' => $attributes['name'] ?? null, 'email' => $attributes['email'] ?? null, 'password' => $attributes['password'] ?? null], fn (mixed $value) => $value !== null));
            if (isset($attributes['role'])) {
                $organization->users()->updateExistingPivot($user->id, ['role' => $attributes['role']]);
            }
        });

        return $this->findMember($organization, $user->fresh());
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
