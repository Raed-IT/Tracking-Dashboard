<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Tracking\Models\DataSource;
use App\Http\Controllers\Controller;
use App\Http\Resources\SourceResource;

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
}
