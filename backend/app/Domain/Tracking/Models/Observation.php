<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class Observation extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $guarded = [];

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    protected function casts(): array
    {
        return ['observed_at' => 'immutable_datetime', 'metadata' => 'array', 'raw_payload' => 'array', 'latitude' => 'float', 'longitude' => 'float'];
    }
}
