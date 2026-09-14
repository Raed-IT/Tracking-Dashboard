<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Domain\Alerts\Models\Alert as ModelsAlert;
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

    public int $tries = 1;

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

        $aircraftCount = 0;
        $observationCount = 0;

        try {
            /*
             * IMPORTANT:
             *
             * Do not skip the request when the source is offline.
             *
             * A previous version skipped the API call when credits
             * were exhausted. That prevents automatic recovery detection
             * after the customer tops up their FR24 account.
             */

            $adapter = $factory->make($source);

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

                if (!$track) {
                    $track = new Track();

                    $track->uuid = (string) Str::uuid();
                    $track->organization_id =
                        $source->organization_id;
                    $track->type = 'aircraft';

                    $track->classification =
                        $observation->classification ?: 'civil';

                    $track->callsign = $callsign;
                    $track->registration = $registration;

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

                $storedObservation->raw_payload =
                    $metadata;

                $storedObservation->save();

                $observationCount++;
            }

            /*
             * =============================================================
             * SUCCESS
             * =============================================================
             */

            $source->update([
                'status' => 'online',
                'last_success_at' => now(),
                'last_error' => null,
                'error_count' => 0,
            ]);

            /*
             * Resolve any active FR24 error/offline/credit alerts.
             */
            $this->resolveActiveFr24Alerts($source);

            Log::info(
                'FR24 polling completed',
                [
                    'source_id' => $source->id,
                    'aircraft_count' => $aircraftCount,
                    'observations_stored' => $observationCount,
                ]
            );
        } catch (Throwable $e) {
            $this->handleFr24Error(
                $source,
                $e,
                $aircraftCount,
                $observationCount
            );
        }
    }

    /**
     * Handle every FR24 failure.
     */
    private function handleFr24Error(
        DataSource $source,
        Throwable $e,
        int $aircraftCount,
        int $observationCount
    ): void {
        $errorMessage = $e->getMessage();
        $errorCode = (int) $e->getCode();

        $isCreditLimitError =
            $errorCode === 402
            || str_contains(
                $errorMessage,
                'HTTP 402'
            )
            || str_contains(
                $errorMessage,
                'Credit limit reached'
            )
            || str_contains(
                $errorMessage,
                'Please top up your account'
            )
            || str_contains(
                strtolower($errorMessage),
                'credit limit'
            );

        /*
         * =============================================================
         * CREDIT LIMIT
         * =============================================================
         */

        if ($isCreditLimitError) {
            $alertMessage =
                'Flightradar24 API credits exhausted. '
                . 'Please top up your Flightradar24 API account.';

            $source->update([
                'status' => 'offline',
                'last_error' => $alertMessage,
                'error_count' =>
                    ((int) $source->error_count) + 1,
            ]);

            $this->createFr24CreditLimitAlert(
                $source,
                $errorMessage
            );

            Log::critical(
                'FR24 API credit limit reached.',
                [
                    'source_id' => $source->id,
                    'organization_id' =>
                        $source->organization_id,
                    'error' => $errorMessage,
                    'code' => $errorCode,
                ]
            );

            /*
             * Do not throw.
             *
             * The scheduler can continue running and will test
             * FR24 again. Once credits are restored, the successful
             * request will resolve the alert and mark the source online.
             */
            return;
        }

        /*
         * =============================================================
         * ALL OTHER ERRORS
         * =============================================================
         */

        $source->update([
            'status' => 'offline',
            'last_error' => $errorMessage,
            'error_count' =>
                ((int) $source->error_count) + 1,
        ]);

        /*
         * Create ONE active offline/error alert.
         *
         * Repeated errors do not create duplicates.
         */
        $this->createFr24OfflineAlert(
            $source,
            $e
        );

        Log::error(
            'FR24 polling failed.',
            [
                'source_id' => $source->id,
                'organization_id' =>
                    $source->organization_id,
                'error' => $errorMessage,
                'exception' => get_class($e),
                'code' => $errorCode,
                'aircraft_count' => $aircraftCount,
                'observations_stored' => $observationCount,
            ]
        );

        /*
         * Keep normal errors as failed jobs.
         */
        throw $e;
    }

    /**
     * Create a credit-limit alert only when there is no active
     * credit-limit alert.
     *
     * ACTIVE  -> no duplicate
     * RESOLVED -> create new
     * CLOSED   -> create new
     * OTHER    -> create new
     */
    private function createFr24CreditLimitAlert(
        DataSource $source,
        string $originalError
    ): void {
        $title = 'Flightradar24 API Credits Exhausted';

        $activeAlert = ModelsAlert::query()
            ->where(
                'organization_id',
                $source->organization_id
            )
            ->where('title', $title)
            ->where('state', 'active')
            ->first();

        if ($activeAlert) {
            Log::debug(
                'FR24 credit alert already active. '
                . 'No duplicate alert created.',
                [
                    'alert_id' => $activeAlert->id,
                    'source_id' => $source->id,
                    'state' => $activeAlert->state,
                ]
            );

            return;
        }

        $alert = ModelsAlert::create([
            'uuid' => (string) Str::uuid(),

            'organization_id' =>
                $source->organization_id,

            'track_id' => null,

            'alert_rule_id' => null,

            'severity' => 'critical',

            'state' => 'active',

            'title' => $title,

            'message' =>
                'Flightradar24 API credits have been exhausted. '
                . 'Please top up your Flightradar24 API account.',

            'metadata' => [
                'type' => 'fr24_credit_limit',
                'source_id' => $source->id,
                'driver' => 'flightradar24',
                'original_error' => $originalError,
                'created_at' =>
                    now()->toIso8601String(),
            ],

            'acknowledged_at' => null,
            'acknowledged_by' => null,
            'resolved_at' => null,
        ]);

        Log::critical(
            'FR24 CREDIT LIMIT ALERT CREATED',
            [
                'alert_id' => $alert->id,
                'source_id' => $source->id,
                'organization_id' =>
                    $source->organization_id,
            ]
        );
    }

    /**
     * Create a normal FR24 offline/error alert.
     *
     * Only one ACTIVE alert is allowed for this condition.
     *
     * If the old alert is resolved/closed/etc., a new alert is created.
     */
    private function createFr24OfflineAlert(
        DataSource $source,
        Throwable $exception
    ): void {
        $title = 'Flightradar24 Data Source Offline';

        $activeAlert = ModelsAlert::query()
            ->where(
                'organization_id',
                $source->organization_id
            )
            ->where('title', $title)
            ->where('state', 'active')
            ->first();

        /*
         * Already active -> do not create another alert.
         */
        if ($activeAlert) {
            Log::debug(
                'FR24 offline alert already active. '
                . 'No duplicate alert created.',
                [
                    'alert_id' => $activeAlert->id,
                    'source_id' => $source->id,
                    'state' => $activeAlert->state,
                ]
            );

            return;
        }

        /*
         * No ACTIVE alert exists.
         *
         * Therefore this creates a new alert even if an older
         * alert is resolved, closed, acknowledged, etc.
         */
        $alert = ModelsAlert::create([
            'uuid' => (string) Str::uuid(),

            'organization_id' =>
                $source->organization_id,

            'track_id' => null,

            'alert_rule_id' => null,

            'severity' => 'error',

            'state' => 'active',

            'title' => $title,

            'message' =>
                'Flightradar24 data source is offline. '
                . 'The API request failed.',

            'metadata' => [
                'type' => 'fr24_offline',
                'source_id' => $source->id,
                'driver' => 'flightradar24',

                'error' => $exception->getMessage(),

                'exception' =>
                    get_class($exception),

                'error_code' =>
                    (int) $exception->getCode(),

                'created_at' =>
                    now()->toIso8601String(),
            ],

            'acknowledged_at' => null,
            'acknowledged_by' => null,
            'resolved_at' => null,
        ]);

        Log::error(
            'FR24 OFFLINE ALERT CREATED',
            [
                'alert_id' => $alert->id,
                'source_id' => $source->id,
                'organization_id' =>
                    $source->organization_id,
                'error' => $exception->getMessage(),
            ]
        );
    }

    /**
     * Resolve active FR24 alerts after a successful request.
     *
     * This handles:
     * - credit exhausted
     * - normal offline/API errors
     */
    private function resolveActiveFr24Alerts(
        DataSource $source
    ): void {
        $titles = [
            'Flightradar24 API Credits Exhausted',
            'Flightradar24 Data Source Offline',
        ];

        $updated = ModelsAlert::query()
            ->where(
                'organization_id',
                $source->organization_id
            )
            ->whereIn('title', $titles)
            ->where('state', 'active')
            ->update([
                'state' => 'resolved',
                'resolved_at' => now(),
            ]);

        if ($updated > 0) {
            Log::info(
                'Active FR24 alerts resolved after successful API request.',
                [
                    'source_id' => $source->id,
                    'organization_id' =>
                        $source->organization_id,
                    'alerts_resolved' => $updated,
                ]
            );
        }
    }
}