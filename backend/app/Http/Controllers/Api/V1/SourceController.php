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
        return SourceResource::collection(DataSource::orderBy('name')->get());
    }

    public function show(DataSource $source): SourceResource
    {
        return new SourceResource($source);
    }

    public function health(DataSource $source)
    {
        return response()->json(['data' => (new SourceResource($source))->resolve()]);
    }
}
