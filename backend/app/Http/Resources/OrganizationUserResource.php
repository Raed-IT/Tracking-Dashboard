<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class OrganizationUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->uuid, 'name' => $this->name, 'email' => $this->email, 'role' => $this->pivot?->role, 'created_at' => $this->created_at];
    }
}
