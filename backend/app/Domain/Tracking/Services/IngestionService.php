<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Services;

use App\Domain\Tracking\DTOs\ObservationData;
use App\Domain\Tracking\Events\TrackUpdated;
use App\Domain\Tracking\Models\DataSource;
use App\Domain\Tracking\Models\Observation;
use App\Infrastructure\Redis\LiveTrackStore;
use Illuminate\Support\Facades\DB;

final readonly class IngestionService
{
    public function __construct(private TrackFusionService $fusion, private LiveTrackStore $live) {}

    public function ingest(DataSource $source, ObservationData $data): void
    {
        DB::transaction(function () use ($source, $data) {
            $track = $this->fusion->apply($this->fusion->correlate($data), $data, $source->id);
            Observation::create(['source_id' => $source->id, 'source_track_id' => $data->sourceTrackId, 'track_id' => $track->id, 'observed_at' => $data->observedAt, 'latitude' => $data->latitude, 'longitude' => $data->longitude, 'altitude' => $data->altitude, 'speed' => $data->speed, 'heading' => $data->heading, 'vertical_rate' => $data->verticalRate, 'classification' => $data->classification, 'confidence' => $data->confidence, 'metadata' => $data->metadata, 'raw_payload' => $data->rawPayload]);
            $this->live->put($track);
            event(new TrackUpdated($track));
        });
    }
}
