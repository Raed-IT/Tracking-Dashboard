<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Alerts\Contracts\AlertRepository;
use App\Domain\Alerts\Models\Alert;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class EloquentAlertRepository implements AlertRepository
{
    public function paginate(?string $state, int $perPage): LengthAwarePaginator
    {
        return Alert::query()->when($state, fn ($query) => $query->where('state', $state))->with(['track:id,uuid,callsign,type', 'acknowledgedBy:id,uuid,name'])->latest()->paginate($perPage);
    }

    public function find(Alert $alert): Alert
    {
        return $alert;
    }

    public function save(Alert $alert): Alert
    {
        $alert->save();

        return $alert->refresh()->load(['track:id,uuid,callsign,type', 'acknowledgedBy:id,uuid,name']);
    }
}
