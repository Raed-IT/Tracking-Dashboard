<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Access\Enums\OrganizationRole;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => OrganizationRole::definitions(),
        ]);
    }
}
