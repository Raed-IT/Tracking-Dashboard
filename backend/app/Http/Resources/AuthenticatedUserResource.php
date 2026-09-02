<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AuthenticatedUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $membership = $this->organizations->first()?->pivot;

        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'organization' => $this->organizations->first() ? [
                'id' => $this->organizations->first()->uuid,
                'name' => $this->organizations->first()->name,
                'slug' => $this->organizations->first()->slug,
            ] : null,
            'role' => $membership?->role,
            'permissions' => $this->permissions(),
        ];
    }
}
