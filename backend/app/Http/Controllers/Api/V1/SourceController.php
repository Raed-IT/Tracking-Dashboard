<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Tracking\Models\DataSource;
use App\Http\Controllers\Controller;
use App\Http\Resources\SourceResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class SourceController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return SourceResource::collection(
            DataSource::query()
                ->orderBy('name')
                ->paginate((int) ($validated['per_page'] ?? 25))
                ->withQueryString(),
        );
    }

    public function show(DataSource $source): SourceResource
    {
        return new SourceResource($source);
    }

    public function health(DataSource $source)
    {
        return response()->json(['data' => (new SourceResource($source))->resolve()]);
    }

    public function store(Request $request): SourceResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'string', 'max:50'],
            'driver' => ['required', 'in:flightradar24,mock_aircraft'],
            'api_key' => ['nullable', 'string', 'max:500'],
        ]);
        $slug = Str::slug($data['name']);
        abort_if(DataSource::where('slug', $slug)->exists(), 422, 'A source with this name already exists.');
        $source = DataSource::create([
            'uuid' => (string) Str::uuid(),
            'name' => $data['name'], 'slug' => $slug, 'type' => $data['type'], 'driver' => $data['driver'],
            'enabled' => true, 'status' => 'offline', 'configuration' => ['api_key' => $data['api_key'] ?? ''],
        ]);
        return new SourceResource($source);
    }

    public function update(Request $request, DataSource $source): SourceResource
    {
        $data = $request->validate(['enabled' => ['sometimes', 'boolean']]);
        $source->update($data);
        return new SourceResource($source->fresh());
    }
}
