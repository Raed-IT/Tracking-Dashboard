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
    public function index()
    {
        return SourceResource::collection(DataSource::where('organization_id', request()->user()->currentOrganizationId())->orderBy('name')->get());
    }

    public function show(DataSource $source): SourceResource
    {
        abort_unless($source->organization_id === request()->user()->currentOrganizationId(), 404);

        return new SourceResource($source);
    }

    public function health(DataSource $source)
    {
        abort_unless($source->organization_id === request()->user()->currentOrganizationId(), 404);

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
            'uuid' => (string) Str::uuid(), 'organization_id' => $request->user()->currentOrganizationId(),
            'name' => $data['name'], 'slug' => $slug, 'type' => $data['type'], 'driver' => $data['driver'],
            'enabled' => true, 'status' => 'offline', 'configuration' => ['api_key' => $data['api_key'] ?? ''],
        ]);
        return new SourceResource($source);
    }

    public function update(Request $request, DataSource $source): SourceResource
    {
        abort_unless($source->organization_id === $request->user()->currentOrganizationId(), 404);
        $data = $request->validate(['enabled' => ['sometimes', 'boolean']]);
        $source->update($data);
        return new SourceResource($source->fresh());
    }
}
