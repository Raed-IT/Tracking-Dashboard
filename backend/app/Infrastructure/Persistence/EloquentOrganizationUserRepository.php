<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Access\Contracts\OrganizationUserRepository;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

final class EloquentOrganizationUserRepository implements OrganizationUserRepository
{
    public function paginate(int $perPage = 25, ?string $search = null, ?string $role = null, string $sort = 'name', string $direction = 'asc'): LengthAwarePaginator
    {
        return User::query()
            ->when($search, fn ($query) => $query->where(fn ($members) => $members
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")))
            ->when($role, fn ($query) => $query->where('role', $role))
            ->when($sort === 'role', fn ($query) => $query->orderBy('role', $direction))
            ->when($sort !== 'role', fn ($query) => $query->orderBy($sort, $direction))
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findMember(User $user): User
    {
        return $user->exists ? $user : User::query()->findOrFail($user->getKey());
    }

    public function create(array $attributes): User
    {
        return DB::transaction(function () use ($attributes): User {
            return User::create(['name' => $attributes['name'], 'email' => $attributes['email'], 'password' => $attributes['password'], 'role' => $attributes['role']]);
        });
    }

 public function update(
    User $user,
    array $attributes
): User {
    return DB::transaction(function () use ($user, $attributes): User {
        $member = $user;

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

            $member->role = $role;
            $member->save();
        }

        return $member->fresh();
    });
}
    public function remove(User $user): void
    {
        DB::transaction(function () use ($user): void {
            $user->delete();
        });
    }
}
