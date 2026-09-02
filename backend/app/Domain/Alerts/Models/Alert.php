<?php

declare(strict_types=1);

namespace App\Domain\Alerts\Models;

use App\Domain\Tracking\Models\Track;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Alert extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    protected function casts(): array
    {
        return ['metadata' => 'array', 'acknowledged_at' => 'immutable_datetime', 'resolved_at' => 'immutable_datetime'];
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(Track::class);
    }

    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }
}
