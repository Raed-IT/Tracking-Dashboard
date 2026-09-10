<?php

declare(strict_types=1);

namespace App\Domain\Tracking\DTOs;

use DateTimeImmutable;

final readonly class ObservationData
{
    public function __construct(
        public string $sourceTrackId,

        public DateTimeImmutable $observedAt,

        public ?float $latitude,

        public ?float $longitude,

        public ?float $altitude,

        public ?float $speed,

        public ?float $heading,

        public ?float $verticalRate,

        public ?string $name = null,

        public ?string $classification = null,

        public ?float $confidence = null,

        public array $metadata = [],
    ) {
    }

    public function toArray(): array
    {
        return [
            'source_track_id' => $this->sourceTrackId,

            'observed_at' => $this->observedAt
                ->format('Y-m-d H:i:s'),

            'latitude' => $this->latitude,
            'longitude' => $this->longitude,

            'altitude' => $this->altitude,
            'speed' => $this->speed,
            'heading' => $this->heading,
            'vertical_rate' => $this->verticalRate,

            'name' => $this->name,
            'classification' => $this->classification,

            'confidence' => $this->confidence,

            'metadata' => $this->metadata,
        ];
    }
}