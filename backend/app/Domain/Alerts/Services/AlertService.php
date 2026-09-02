<?php

declare(strict_types=1);

namespace App\Domain\Alerts\Services;

use App\Domain\Alerts\Contracts\AlertRepository;
use App\Domain\Alerts\Models\Alert;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final readonly class AlertService
{
    public function __construct(private AlertRepository $alerts) {}

    public function paginate(Organization $organization, ?string $state = 'active', int $perPage = 50): LengthAwarePaginator
    {
        return $this->alerts->paginateForOrganization($organization, $state, $perPage);
    }

    public function acknowledge(Organization $organization, Alert $alert, User $operator): Alert
    {
        $alert = $this->alerts->findForOrganization($organization, $alert);
        if ($alert->state === 'resolved') {
            abort(422, 'Resolved alerts cannot be acknowledged.');
        }
        $alert->fill(['state' => 'acknowledged', 'acknowledged_at' => now(), 'acknowledged_by' => $operator->id]);

        return $this->alerts->save($alert);
    }
}
