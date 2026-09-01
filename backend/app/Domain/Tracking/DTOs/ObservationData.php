<?php

declare(strict_types=1);

namespace App\Domain\Tracking\DTOs;

use Carbon\CarbonImmutable;

final readonly class ObservationData
{
    public function __construct(public string $sourceTrackId, public CarbonImmutable $observedAt, public float $latitude, public float $longitude, public ?float $altitude, public ?float $speed, public ?float $heading, public ?float $verticalRate, public string $type, public ?string $classification, public float $confidence, public array $externalIdentifiers = [], public array $metadata = [], public array $rawPayload = []) {}
}
