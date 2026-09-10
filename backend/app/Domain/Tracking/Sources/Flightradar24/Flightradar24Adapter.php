<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Sources\Flightradar24;

use App\Domain\Tracking\Contracts\DataSourceInterface;
use App\Domain\Tracking\DTOs\ObservationData;
use DateTimeImmutable;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class Flightradar24Adapter implements DataSourceInterface
{
    public function __construct(
        private readonly array $config
    ) {
    }

    public function connect(): void
    {
        $errors = $this->validateConfiguration($this->config);

        if ($errors !== []) {
            throw new RuntimeException(
                'FR24 configuration is invalid: '
                . implode(', ', $errors)
            );
        }
    }

    /**
     * Fetch live aircraft positions from FR24.
     *
     * @return iterable<ObservationData>
     */
    public function retrieveObservations(): iterable
    {
        $this->connect();

        $response = Http::timeout(
            (int) ($this->config['timeout'] ?? 15)
        )
            ->retry(
                2,
                250,
                throw: false
            )
            ->withToken($this->config['api_key'])
            ->withHeaders([
                'Accept' => 'application/json',
                'Accept-Version' => 'v1',
            ])
            ->get(
                rtrim($this->config['base_url'], '/')
                . '/live/flight-positions/full',
                [
                    'bounds' => $this->config['bounds'],
                    'limit' => $this->config['limit'],
                ]
            );

        if ($response->failed()) {
            throw new RequestException($response);
        }

        $data = $response->json('data', []);

        if (!is_array($data)) {
            throw new RuntimeException(
                'FR24 returned an invalid data payload.'
            );
        }

        foreach ($data as $flight) {
            if (!is_array($flight)) {
                continue;
            }

            yield $this->normalize($flight);
        }
    }

    public function normalize(mixed $payload): ObservationData
    {
        if (!is_array($payload)) {
            throw new RuntimeException(
                'Invalid FR24 observation payload.'
            );
        }

        $fr24Id = $payload['fr24_id'] ?? null;

        if (!$fr24Id) {
            throw new RuntimeException(
                'FR24 observation is missing fr24_id.'
            );
        }

        $observedAt = $this->parseTimestamp(
            $payload['timestamp'] ?? null
        );

        $latitude = $this->nullableFloat(
            $payload['lat'] ?? null
        );

        $longitude = $this->nullableFloat(
            $payload['lon'] ?? null
        );

        $altitude = $this->nullableFloat(
            $payload['alt'] ?? null
        );

        $speed = $this->nullableFloat(
            $payload['gspeed'] ?? null
        );

        $heading = $this->nullableFloat(
            $payload['track'] ?? null
        );

        $verticalRate = $this->nullableFloat(
            $payload['vspeed'] ?? null
        );

        return new ObservationData(
            sourceTrackId: (string) $fr24Id,

            observedAt: $observedAt,

            latitude: $latitude,
            longitude: $longitude,

            altitude: $altitude,
            speed: $speed,
            heading: $heading,
            verticalRate: $verticalRate,

            name: $payload['callsign']
                ?? $payload['flight']
                ?? null,

            classification: $payload['type']
                ?? null,

            confidence: $this->calculateConfidence($payload),

            metadata: [
                'provider' => 'flightradar24',

                'fr24_id' => $payload['fr24_id'] ?? null,

                'flight' => $payload['flight'] ?? null,

                'callsign' => $payload['callsign'] ?? null,

                'hex' => $payload['hex'] ?? null,

                'registration' => $payload['reg'] ?? null,

                'aircraft_type' => $payload['type'] ?? null,

                'source' => $payload['source'] ?? null,

                'painted_as' => $payload['painted_as'] ?? null,

                'operating_as' => $payload['operating_as'] ?? null,

                'origin_iata' => $payload['orig_iata'] ?? null,

                'origin_icao' => $payload['orig_icao'] ?? null,

                'destination_iata' => $payload['dest_iata'] ?? null,

                'destination_icao' => $payload['dest_icao'] ?? null,

                'eta' => $payload['eta'] ?? null,

                'squawk' => $payload['squawk'] ?? null,
            ],
        );
    }

    public function healthCheck(): array
    {
        $startedAt = microtime(true);

        try {
            $errors = $this->validateConfiguration(
                $this->config
            );

            if ($errors !== []) {
                return [
                    'healthy' => false,
                    'latency_ms' => null,
                    'message' => implode(', ', $errors),
                ];
            }

            $response = Http::timeout(10)
                ->withToken($this->config['api_key'])
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Accept-Version' => 'v1',
                ])
                ->get(
                    rtrim($this->config['base_url'], '/')
                    . '/live/flight-positions/full',
                    [
                        'bounds' => $this->config['bounds'],
                        'limit' => 1,
                    ]
                );

            $latency = (int) round(
                (microtime(true) - $startedAt) * 1000
            );

            if ($response->successful()) {
                return [
                    'healthy' => true,
                    'latency_ms' => $latency,
                    'message' => 'FR24 API is reachable.',
                ];
            }

            return [
                'healthy' => false,
                'latency_ms' => $latency,
                'message' => sprintf(
                    'FR24 API returned HTTP %d: %s',
                    $response->status(),
                    $response->body()
                ),
            ];
        } catch (\Throwable $e) {
            return [
                'healthy' => false,
                'latency_ms' => null,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function validateConfiguration(array $c): array
    {
        $errors = [];

        if (
            !isset($c['api_key'])
            || trim((string) $c['api_key']) === ''
        ) {
            $errors[] = 'api_key is required';
        }

        if (
            !isset($c['base_url'])
            || trim((string) $c['base_url']) === ''
        ) {
            $errors[] = 'base_url is required';
        }

        if (
            !isset($c['bounds'])
            || trim((string) $c['bounds']) === ''
        ) {
            $errors[] = 'bounds is required';
        }

        return $errors;
    }

    private function parseTimestamp(
        mixed $timestamp
    ): DateTimeImmutable {
        if (
            !is_string($timestamp)
            || trim($timestamp) === ''
        ) {
            return new DateTimeImmutable('now', new \DateTimeZone('UTC'));
        }

        try {
            return new DateTimeImmutable($timestamp);
        } catch (\Throwable) {
            return new DateTimeImmutable(
                'now',
                new \DateTimeZone('UTC')
            );
        }
    }

    private function nullableFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (!is_numeric($value)) {
            return null;
        }

        return (float) $value;
    }

    private function calculateConfidence(
        array $payload
    ): float {
        $confidence = 0.80;

        if (!empty($payload['lat']) && !empty($payload['lon'])) {
            $confidence += 0.05;
        }

        if (!empty($payload['hex'])) {
            $confidence += 0.05;
        }

        if (!empty($payload['reg'])) {
            $confidence += 0.05;
        }

        if (!empty($payload['callsign'])) {
            $confidence += 0.05;
        }

        return min($confidence, 1.0);
    }
}