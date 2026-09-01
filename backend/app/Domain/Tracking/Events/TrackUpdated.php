<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Events;

use App\Domain\Tracking\Models\Track;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

final class TrackUpdated implements ShouldBroadcastNow
{
    public function __construct(public readonly Track $track) {}

    public function broadcastOn(): array
    {
        return [new Channel('tracks')];
    }

    public function broadcastAs(): string
    {
        return 'track.updated';
    }

    public function broadcastWith(): array
    {
        return ['track' => $this->track->toArray()];
    }
}
