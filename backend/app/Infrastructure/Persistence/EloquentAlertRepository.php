<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Alerts\Contracts\AlertRepository;
use App\Domain\Alerts\Models\Alert;
use App\Models\Organization;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class EloquentAlertRepository implements AlertRepository
{
    public function paginateForOrganization(Organization $organization, ?string $state, int $perPage): LengthAwarePaginator
    {
        return Alert::query()->where('organization_id', $organization->id)->when($state, fn ($query) => $query->where('state', $state))->with(['track:id,uuid,callsign,type', 'acknowledgedBy:id,uuid,name'])->latest()->paginate($perPage);
    }

    public function findForOrganization(Organization $organization, Alert $alert): Alert
    {
        abort_unless($alert->organization_id === $organization->id, 404);

        return $alert;
    }

    public function save(Alert $alert): Alert
    {
        $alert->save();

        return $alert->refresh()->load(['track:id,uuid,callsign,type', 'acknowledgedBy:id,uuid,name']);
    }
}
