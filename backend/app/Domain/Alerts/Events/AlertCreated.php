<?php

declare(strict_types=1);

namespace App\Domain\Alerts\Events;

use App\Domain\Alerts\Models\Alert;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

final class AlertCreated implements ShouldBroadcastNow
{
    public function __construct(public readonly Alert $alert) {}

    public function broadcastOn(): array
    {
        return [new Channel('alerts')];
    }

    public function broadcastAs(): string
    {
        return 'alert.created';
    }

    public function broadcastWith(): array
    {
        return [
            'alert' => [
                'id' => $this->alert->uuid,
                'severity' => $this->alert->severity,
                'state' => $this->alert->state,
                'title' => $this->alert->title,
                'message' => $this->alert->message,
                'created_at' => $this->alert->created_at?->toISOString(),
            ],
        ];
    }
}
