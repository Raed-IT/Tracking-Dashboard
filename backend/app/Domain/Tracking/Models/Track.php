<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class Track extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    protected function casts(): array
    {
        return ['external_identifiers' => 'array', 'source_ids' => 'array', 'metadata' => 'array', 'first_seen_at' => 'immutable_datetime', 'last_seen_at' => 'immutable_datetime', 'latitude' => 'float', 'longitude' => 'float', 'confidence' => 'float'];
    }

    public function observations()
    {
        return $this->hasMany(Observation::class);
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
