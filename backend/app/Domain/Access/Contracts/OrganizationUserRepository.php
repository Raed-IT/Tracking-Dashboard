<?php

declare(strict_types=1);

namespace App\Domain\Access\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrganizationUserRepository
{
    public function paginate(int $perPage = 25, ?string $search = null, ?string $role = null, string $sort = 'name', string $direction = 'asc'): LengthAwarePaginator;

    public function findMember(User $user): User;

    public function create(array $attributes): User;

    public function update(User $user, array $attributes): User;

    public function remove(User $user): void;
}
