<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Contracts;

use App\Domain\Tracking\DTOs\ObservationData;

interface DataSourceInterface
{
    public function connect(): void;

    /** @return iterable<mixed> */
    public function retrieveObservations(): iterable;

    public function normalize(mixed $payload): ObservationData;

    /** @return array{healthy:bool,latency_ms:int|null,message:string} */
    public function healthCheck(): array;

    /** @return list<string> */
    public function validateConfiguration(array $configuration): array;
}
