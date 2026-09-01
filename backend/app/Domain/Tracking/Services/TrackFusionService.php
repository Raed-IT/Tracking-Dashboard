<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Services;

use App\Domain\Tracking\DTOs\ObservationData;
use App\Domain\Tracking\Models\Track;

final class TrackFusionService
{
    public function correlate(ObservationData $o): ?Track
    {
        foreach ($o->externalIdentifiers as $kind => $value) {
            if ($value && ($track = Track::query()->where("external_identifiers->{$kind}", $value)->where('last_seen_at', '>=', $o->observedAt->subMinutes(30))->first())) {
                return $track;
            }
        }
        $latDelta = 5 / 111.0;
        $lngDelta = $latDelta / max(cos(deg2rad($o->latitude)), .2);

        return Track::query()->where('type', $o->type)->whereBetween('latitude', [$o->latitude - $latDelta, $o->latitude + $latDelta])->whereBetween('longitude', [$o->longitude - $lngDelta, $o->longitude + $lngDelta])->whereBetween('last_seen_at', [$o->observedAt->subMinutes(2), $o->observedAt->addSeconds(10)])->orderByRaw('ABS(latitude-?) + ABS(longitude-?)', [$o->latitude, $o->longitude])->first();
    }

    public function apply(?Track $track, ObservationData $o, int $sourceId): Track
    {
        $track ??= new Track(['type' => $o->type, 'first_seen_at' => $o->observedAt, 'status' => 'active']);
        $sources = array_values(array_unique([...($track->source_ids ?? []), $sourceId]));
        $track->fill(['type' => $o->type, 'classification' => $o->classification, 'callsign' => $o->metadata['callsign'] ?? $track->callsign, 'registration' => $o->metadata['registration'] ?? $track->registration, 'external_identifiers' => array_merge($track->external_identifiers ?? [], $o->externalIdentifiers), 'latitude' => $o->latitude, 'longitude' => $o->longitude, 'altitude' => $o->altitude, 'speed' => $o->speed, 'heading' => $o->heading, 'vertical_rate' => $o->verticalRate, 'confidence' => max((float) ($track->confidence ?? 0), $o->confidence), 'last_seen_at' => $o->observedAt, 'source_ids' => $sources, 'metadata' => array_merge($track->metadata ?? [], $o->metadata)])->save();

        return $track;
    }
}
