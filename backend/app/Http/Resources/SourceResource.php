<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class SourceResource extends JsonResource
{
    public function toArray(Request $r): array
    {
        return ['id' => $this->uuid, 'name' => $this->name, 'slug' => $this->slug, 'type' => $this->type, 'driver' => $this->driver, 'enabled' => $this->enabled, 'status' => $this->status, 'last_message_at' => $this->last_message_at, 'last_success_at' => $this->last_success_at, 'last_error_at' => $this->last_error_at, 'last_error' => $this->last_error, 'latency_ms' => $this->latency_ms, 'messages_per_minute' => (float) $this->messages_per_minute, 'error_count' => $this->error_count, 'health' => $this->health_metadata];
    }
}
