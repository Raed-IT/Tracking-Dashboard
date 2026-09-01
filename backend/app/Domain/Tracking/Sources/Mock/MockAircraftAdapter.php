<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Sources\Mock;

use App\Domain\Tracking\Contracts\DataSourceInterface;
use App\Domain\Tracking\DTOs\ObservationData;
use Carbon\CarbonImmutable;

final class MockAircraftAdapter implements DataSourceInterface
{
    public function __construct(private readonly float $centerLat = 40.7128, private readonly float $centerLng = -74.0060, private readonly int $count = 20) {}

    public function connect(): void {}

    public function retrieveObservations(): iterable
    {
        $tick = time();
        for ($i = 0; $i < $this->count; $i++) {
            $heading = fmod($i * 47 + 20, 360);
            $radius = .08 + ($i % 7) * .025;
            $angle = deg2rad(fmod($tick / 8 + $i * 360 / $this->count, 360));
            yield ['id' => sprintf('A%05X', $i + 100), 'lat' => $this->centerLat + sin($angle) * $radius, 'lng' => $this->centerLng + cos($angle) * $radius, 'alt' => 5000 + ($i % 10) * 2500, 'speed' => 220 + ($i % 8) * 28, 'heading' => $heading, 'callsign' => sprintf('OPS%03d', $i + 1)];
        }
    }

    public function normalize(mixed $p): ObservationData
    {
        return new ObservationData($p['id'], CarbonImmutable::now(), (float) $p['lat'], (float) $p['lng'], (float) $p['alt'], (float) $p['speed'], (float) $p['heading'], 0, 'aircraft', 'civil', .92, ['icao_hex' => $p['id']], ['callsign' => $p['callsign']], $p);
    }

    public function healthCheck(): array
    {
        return ['healthy' => true, 'latency_ms' => 2, 'message' => 'Mock generator online'];
    }

    public function validateConfiguration(array $configuration): array
    {
        return [];
    }
}
