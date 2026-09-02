<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Tracking\Models\Track;
use App\Http\Controllers\Controller;
use App\Http\Requests\TrackIndexRequest;
use App\Http\Resources\TrackResource;

final class TrackController extends Controller
{
    public function index(TrackIndexRequest $r)
    {
        $q = Track::query()
            ->where('organization_id', $r->user()->currentOrganizationId())
            ->where('last_seen_at', '>=', now()->subMinutes(10));
        if ($r->bbox) {
            [$minLng,$minLat,$maxLng,$maxLat] = array_map('floatval', explode(',', $r->bbox));
            $q->whereBetween('longitude', [$minLng, $maxLng])->whereBetween('latitude', [$minLat, $maxLat]);
        } foreach (['type', 'classification', 'status'] as $f) {
            if ($r->filled($f)) {
                $q->where($f, $r->string($f));
            }
        } if ($r->filled('source')) {
            $q->whereJsonContains('source_ids', (int) $r->source);
        } if ($r->filled('min_altitude')) {
            $q->where('altitude', '>=', $r->float('min_altitude'));
        } if ($r->filled('max_altitude')) {
            $q->where('altitude', '<=', $r->float('max_altitude'));
        }

return TrackResource::collection($q->orderByDesc('last_seen_at')->paginate($r->integer('per_page', 250)));
    }

    public function show(Track $track): TrackResource
    {
        abort_unless($track->organization_id === request()->user()->currentOrganizationId(), 404);

        return new TrackResource($track);
    }

    public function history(Track $track)
    {
        abort_unless($track->organization_id === request()->user()->currentOrganizationId(), 404);

        return response()->json(['data' => $track->observations()->orderBy('observed_at')->whereBetween('observed_at', [request('from', now()->subDay()), request('to', now())])->limit(10000)->get(['uuid', 'observed_at', 'latitude', 'longitude', 'altitude', 'speed', 'heading', 'source_id'])]);
    }
}
