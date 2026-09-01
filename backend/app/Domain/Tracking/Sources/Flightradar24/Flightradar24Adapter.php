<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Sources\Flightradar24;

use App\Domain\Tracking\Contracts\DataSourceInterface;
use App\Domain\Tracking\DTOs\ObservationData;
use RuntimeException;

final class Flightradar24Adapter implements DataSourceInterface
{
    public function __construct(private readonly array $config) {}

    public function connect(): void
    {
        if ($this->validateConfiguration($this->config) !== []) {
            throw new RuntimeException('FR24 credentials are not configured.');
        }
    }

    public function retrieveObservations(): iterable
    {
        return [];
    }

    public function normalize(mixed $payload): ObservationData
    {
        throw new RuntimeException('Supply mappings for the contracted official FR24 API before enabling.');
    }

    public function healthCheck(): array
    {
        return ['healthy' => false, 'latency_ms' => null, 'message' => 'Disabled until official API configuration is supplied'];
    }

    public function validateConfiguration(array $c): array
    {
        return empty($c['api_key']) ? ['api_key is required'] : [];
    }
}
