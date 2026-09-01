<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class TrackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->uuid, 'type' => $this->type, 'classification' => $this->classification, 'callsign' => $this->callsign, 'registration' => $this->registration, 'external_identifiers' => $this->external_identifiers, 'latitude' => (float) $this->latitude, 'longitude' => (float) $this->longitude, 'altitude' => $this->altitude !== null ? (float) $this->altitude : null, 'speed' => $this->speed !== null ? (float) $this->speed : null, 'heading' => $this->heading !== null ? (float) $this->heading : null, 'vertical_rate' => $this->vertical_rate !== null ? (float) $this->vertical_rate : null, 'confidence' => (float) $this->confidence, 'first_seen_at' => $this->first_seen_at, 'last_seen_at' => $this->last_seen_at, 'status' => $this->status, 'source_ids' => $this->source_ids, 'metadata' => $this->metadata];
    }
}
