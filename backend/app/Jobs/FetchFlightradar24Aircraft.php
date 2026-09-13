<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Domain\Tracking\Models\DataSource;
use App\Domain\Tracking\Models\Observation;
use App\Domain\Tracking\Models\Track;
use App\Domain\Tracking\Services\DataSourceAdapterFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

final class FetchFlightradar24Aircraft implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $timeout = 30;

    public int $tries = 2;

    public function handle(
        DataSourceAdapterFactory $factory
    ): void {
        $source = DataSource::query()
            ->where('driver', 'flightradar24')
            ->where('enabled', true)
            ->first();

        if (!$source) {
            Log::warning('FR24 source is not enabled.');

            return;
        }

        $adapter = $factory->make($source);

        $aircraftCount = 0;
        $observationCount = 0;

        try {
            foreach ($adapter->retrieveObservations() as $observation) {
                $aircraftCount++;

                $fr24Id = trim(
                    (string) $observation->sourceTrackId
                );

                if ($fr24Id === '') {
                    Log::warning(
                        'FR24 aircraft skipped: missing source_track_id.'
                    );

                    continue;
                }

                $metadata = is_array($observation->metadata)
                    ? $observation->metadata
                    : [];

                $registration =
                    $metadata['registration'] ?? null;

                $hex =
                    $metadata['hex'] ?? null;

                $callsign =
                    $metadata['callsign']
                    ?? $observation->name
                    ?? null;

                /*
                 * Find existing aircraft by FR24 ID.
                 */
                $track = Track::query()
                    ->where(
                        'organization_id',
                        $source->organization_id
                    )
                    ->whereJsonContains(
                        'external_identifiers->fr24_id',
                        $fr24Id
                    )
                    ->first();

                /*
                 * Create new Track.
                 */
                if (!$track) {
                    $track = new Track();

                    $track->uuid = (string) Str::uuid();

                    $track->organization_id =
                        $source->organization_id;

                    $track->type = 'aircraft';

                    $track->classification =
                        $observation->classification
                        ?: 'civil';

                    $track->callsign = $callsign;

                    $track->registration =
                        $registration;

                    $track->external_identifiers = [
                        'fr24_id' => $fr24Id,
                        'hex' => $hex,
                    ];

                    $track->latitude =
                        $observation->latitude;

                    $track->longitude =
                        $observation->longitude;

                    $track->altitude =
                        $observation->altitude;

                    $track->speed =
                        $observation->speed;

                    $track->heading =
                        $observation->heading;

                    $track->vertical_rate =
                        $observation->verticalRate;

                    $track->confidence =
                        $observation->confidence;

                    $track->first_seen_at =
                        $observation->observedAt;

                    $track->last_seen_at =
                        $observation->observedAt;

                    $track->status = 'active';

                    $track->source_ids = [
                        $source->id,
                    ];

                    $track->metadata = $metadata;

                    $track->save();

                    Log::info(
                        'FR24 new aircraft created',
                        [
                            'track_id' => $track->id,
                            'fr24_id' => $fr24Id,
                            'callsign' => $callsign,
                            'registration' => $registration,
                        ]
                    );
                } else {
                    /*
                     * Update existing Track.
                     */
                    $track->classification =
                        $observation->classification
                        ?: $track->classification;

                    $track->callsign =
                        $callsign
                        ?: $track->callsign;

                    $track->registration =
                        $registration
                        ?: $track->registration;

                    $track->latitude =
                        $observation->latitude;

                    $track->longitude =
                        $observation->longitude;

                    $track->altitude =
                        $observation->altitude;

                    $track->speed =
                        $observation->speed;

                    $track->heading =
                        $observation->heading;

                    $track->vertical_rate =
                        $observation->verticalRate;

                    $track->confidence =
                        $observation->confidence;

                    $track->last_seen_at =
                        $observation->observedAt;

                    $track->status = 'active';

                    $track->source_ids = [
                        $source->id,
                    ];

                    $track->metadata = $metadata;

                    $track->save();
                }

                /*
                 * IMPORTANT:
                 *
                 * Do NOT use Observation::create() here.
                 *
                 * Assign every field directly so Laravel
                 * cannot silently remove source_track_id because
                 * of the model's $fillable configuration.
                 */
                $storedObservation = new Observation();

                $storedObservation->uuid =
                    (string) Str::uuid();

                $storedObservation->source_id =
                    $source->id;

                $storedObservation->source_track_id =
                    $fr24Id;

                $storedObservation->track_id =
                    $track->id;

                $storedObservation->observed_at =
                    $observation->observedAt;

                $storedObservation->latitude =
                    $observation->latitude;

                $storedObservation->longitude =
                    $observation->longitude;

                $storedObservation->altitude =
                    $observation->altitude;

                $storedObservation->speed =
                    $observation->speed;

                $storedObservation->heading =
                    $observation->heading;

                $storedObservation->vertical_rate =
                    $observation->verticalRate;

                $storedObservation->classification =
                    $observation->classification;

                $storedObservation->confidence =
                    $observation->confidence;

                $storedObservation->metadata =
                    $metadata;

                /*
                 * Until ObservationData has a dedicated rawPayload
                 * property, store the available FR24 metadata here.
                 */
                $storedObservation->raw_payload =
                    $metadata;

                $storedObservation->save();

                $observationCount++;

                Log::info(
                    'FR24 observation stored',
                    [
                        'observation_id' =>
                            $storedObservation->id,

                        'track_id' =>
                            $track->id,

                        'source_id' =>
                            $source->id,

                        'source_track_id' =>
                            $fr24Id,

                        'callsign' =>
                            $callsign,

                        'registration' =>
                            $registration,

                        'latitude' =>
                            $observation->latitude,

                        'longitude' =>
                            $observation->longitude,

                        'altitude' =>
                            $observation->altitude,
                    ]
                );
            }

            $source->update([
                'status' => 'online',
                'last_success_at' => now(),
                'last_error' => null,
                'error_count' => 0,
            ]);

            Log::info(
                'FR24 polling completed',
                [
                    'aircraft_count' =>
                        $aircraftCount,

                    'observations_stored' =>
                        $observationCount,
                ]
            );
        } catch (Throwable $e) {
            $source->update([
                'status' => 'offline',

                'last_error' =>
                    $e->getMessage(),

                'error_count' =>
                    ((int) $source->error_count) + 1,
            ]);

            Log::error(
                'FR24 polling failed',
                [
                    'error' =>
                        $e->getMessage(),

                    'exception' =>
                        get_class($e),
                ]
            );

            throw $e;
        }
    }
}