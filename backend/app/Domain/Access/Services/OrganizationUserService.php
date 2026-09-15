<?php

declare(strict_types=1);

namespace App\Domain\Access\Services;

use App\Domain\Access\Contracts\OrganizationUserRepository;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final readonly class OrganizationUserService
{
    public function __construct(private OrganizationUserRepository $users) {}

    public function paginate(int $perPage = 25, ?string $search = null, ?string $role = null, string $sort = 'name', string $direction = 'asc'): LengthAwarePaginator
    {
        return $this->users->paginate($perPage, $search, $role, $sort, $direction);
    }

    public function create(array $attributes): User
    {
        return $this->users->create($attributes);
    }

    public function update(User $user, array $attributes): User
    {
        $updated = $this->users->update($user, $attributes);
        $updated->tokens()->delete();

        return $updated;
    }

    public function remove(User $actor, User $user): void
    {
        abort_if($actor->is($user), 422, 'You cannot delete your own account.');
        $this->users->findMember($user);
        $this->users->remove($user);
    }
}
