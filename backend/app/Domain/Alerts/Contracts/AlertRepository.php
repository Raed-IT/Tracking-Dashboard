<?php

declare(strict_types=1);

namespace App\Domain\Alerts\Contracts;

use App\Domain\Alerts\Models\Alert;
use App\Models\Organization;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AlertRepository
{
    public function paginateForOrganization(Organization $organization, ?string $state, int $perPage): LengthAwarePaginator;

    public function findForOrganization(Organization $organization, Alert $alert): Alert;

    public function save(Alert $alert): Alert;
}
