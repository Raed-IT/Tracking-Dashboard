<?php

declare(strict_types=1);

namespace App\Domain\Access\Services;

use App\Domain\Access\Contracts\OrganizationUserRepository;
use App\Domain\Access\Enums\OrganizationRole;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final readonly class OrganizationUserService
{
    public function __construct(private OrganizationUserRepository $users) {}

    public function paginate(Organization $organization): LengthAwarePaginator
    {
        return $this->users->paginate($organization);
    }

    public function create(Organization $organization, array $attributes): User
    {
        return $this->users->create($organization, $attributes);
    }

    public function update(Organization $organization, User $user, array $attributes): User
    {
        $this->users->findMember($organization, $user);
        $updated = $this->users->update($organization, $user, $attributes);
        $updated->tokens()->delete();

        return $updated;
    }

    public function remove(User $actor, Organization $organization, User $user): void
    {
        abort_if($actor->is($user), 422, 'You cannot delete your own account.');
        $member = $this->users->findMember($organization, $user);
        abort_if($member->pivot->role === OrganizationRole::Administrator->value && $this->users->administratorCount($organization) === 1, 422, 'The organization must retain an administrator.');
        $this->users->remove($organization,$user);
    }
}
