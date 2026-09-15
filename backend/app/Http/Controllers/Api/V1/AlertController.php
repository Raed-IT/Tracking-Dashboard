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

        return AlertResource::collection($this->alerts->paginate($validated['state'] ?? 'active', (int) ($validated['per_page'] ?? 50)));
    }

    public function test(Request $request): AlertResource
    {
        $validated = $request->validate([
            'severity' => 'nullable|in:info,low,medium,high,critical',
            'title' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:5000',
        ]);

        $alert = Alert::create([
            'severity' => $validated['severity'] ?? 'high',
            'state' => 'active',
            'title' => $validated['title'] ?? 'Test alert',
            'message' => $validated['message'] ?? 'This is a realtime test alert.',
        ]);

        return new AlertResource($alert);
    }

    public function acknowledge(Request $request, Alert $alert): AlertResource
    {
        return new AlertResource($this->alerts->acknowledge($alert, $request->user()));
    }
}
