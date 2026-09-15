<?php

declare(strict_types=1);

namespace App\Domain\Alerts\Contracts;

use App\Domain\Alerts\Models\Alert;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AlertRepository
{
    public function paginate(?string $state, int $perPage): LengthAwarePaginator;

    public function find(Alert $alert): Alert;

    public function save(Alert $alert): Alert;
}
