<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AlertResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->uuid, 'severity' => $this->severity, 'state' => $this->state, 'title' => $this->title, 'message' => $this->message, 'track' => $this->track ? ['id' => $this->track->uuid, 'callsign' => $this->track->callsign, 'type' => $this->track->type] : null, 'acknowledged_at' => $this->acknowledged_at, 'acknowledged_by' => $this->acknowledgedBy ? ['id' => $this->acknowledgedBy->uuid, 'name' => $this->acknowledgedBy->name] : null, 'created_at' => $this->created_at];
    }
}
