<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Alerts\Models\Alert;
use App\Domain\Alerts\Services\AlertService;
use App\Http\Controllers\Controller;
use App\Http\Resources\AlertResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class AlertController extends Controller
{
    public function __construct(private readonly AlertService $alerts) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate(['state' => 'nullable|in:active,acknowledged,resolved', 'per_page' => 'nullable|integer|min:1|max:100']);

        return AlertResource::collection($this->alerts->paginate($request->user()->organizations->firstOrFail(), $validated['state'] ?? 'active', (int) ($validated['per_page'] ?? 50)));
    }

    public function acknowledge(Request $request, Alert $alert): AlertResource
    {
        return new AlertResource($this->alerts->acknowledge($request->user()->organizations->firstOrFail(), $alert, $request->user()));
    }
}
