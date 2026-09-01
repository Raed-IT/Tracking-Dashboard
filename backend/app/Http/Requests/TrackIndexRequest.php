<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class TrackIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['bbox' => ['nullable', 'regex:/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/'], 'type' => 'nullable|string', 'classification' => 'nullable|string', 'source' => 'nullable|integer', 'status' => 'nullable|string', 'min_altitude' => 'nullable|numeric', 'max_altitude' => 'nullable|numeric', 'last_seen' => 'nullable|date', 'per_page' => 'nullable|integer|min:1|max:500'];
    }
}
