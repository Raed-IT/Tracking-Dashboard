<?php

declare(strict_types=1);

// namespace App\Domain\Tracking\Models;

// use Illuminate\Database\Eloquent\Concerns\HasUuids;
// use Illuminate\Database\Eloquent\Model;

// final class Observation extends Model
// {
//     use HasUuids;

//     public $timestamps = false;

//     protected $guarded = [];

//     public function uniqueIds(): array
//     {
//         return ['uuid'];
//     }

//     protected function casts(): array
//     {
//         return ['observed_at' => 'immutable_datetime', 'metadata' => 'array', 'raw_payload' => 'array', 'latitude' => 'float', 'longitude' => 'float'];
//     }
// }
 

namespace App\Domain\Tracking\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Observation extends Model
{
    protected $table = 'observations';

    public $timestamps = false;

    protected $fillable = [
        'uuid',
        'source_id',
        'source_track_id',
        'track_id',
        'observed_at',
        'latitude',
        'longitude',
        'altitude',
        'speed',
        'heading',
        'vertical_rate',
        'classification',
        'confidence',
        'metadata',
        'raw_payload',
    ];

    protected $casts = [
        'observed_at' => 'datetime',

        'latitude' => 'float',
        'longitude' => 'float',
        'altitude' => 'float',
        'speed' => 'float',
        'heading' => 'float',
        'vertical_rate' => 'float',
        'confidence' => 'float',

        'metadata' => 'array',
        'raw_payload' => 'array',
    ];

    public function source(): BelongsTo
    {
        return $this->belongsTo(
            DataSource::class,
            'source_id'
        );
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(
            Track::class,
            'track_id'
        );
    }
}