<?php

declare(strict_types=1);

namespace App\Infrastructure\Redis;

use App\Domain\Tracking\Models\Track;
use Illuminate\Support\Facades\Redis;

final class LiveTrackStore
{
    public function put(Track $track): void
    {
        $data = $track->toArray();
        Redis::setex("track:{$track->uuid}", 300, json_encode($data, JSON_THROW_ON_ERROR));
        Redis::zadd('tracks:live', $track->last_seen_at->timestamp, $track->uuid);
    }

    public function remove(string $uuid): void
    {
        Redis::del("track:$uuid");
        Redis::zrem('tracks:live', $uuid);
    }
}
