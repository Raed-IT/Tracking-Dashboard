<?php

declare(strict_types=1);

namespace App\Domain\Access\Contracts;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrganizationUserRepository
{
    public function paginate(Organization $organization, int $perPage = 50): LengthAwarePaginator;

    public function findMember(Organization $organization, User $user): User;

    public function create(Organization $organization, array $attributes): User;

    public function update(Organization $organization, User $user, array $attributes): User;

    public function remove(Organization $organization, User $user): void;

    public function administratorCount(Organization $organization): int;
}
