<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Access\Services\OrganizationUserService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrganizationUserRequest;
use App\Http\Requests\UpdateOrganizationUserRequest;
use App\Http\Resources\OrganizationUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

final class OrganizationUserController extends Controller
{
    public function __construct(private readonly OrganizationUserService $users) {}

    public function index(): AnonymousResourceCollection
    {
        return OrganizationUserResource::collection($this->users->paginate(request()->user()->organizations->firstOrFail()));
    }

    public function store(StoreOrganizationUserRequest $request): JsonResponse
    {
        return (new OrganizationUserResource($this->users->create($request->user()->organizations->firstOrFail(), $request->validated())))
            ->response()->setStatusCode(201);
    }

    public function update(UpdateOrganizationUserRequest $request, User $user): OrganizationUserResource
    {
        return new OrganizationUserResource($this->users->update($request->user()->organizations->firstOrFail(), $user, $request->validated()));
    }

    public function destroy(User $user): Response
    {
        $actor = request()->user();
        $organization = $actor->organizations->firstOrFail();
        $this->users->remove($actor, $organization, $user);

        return response()->noContent();
    }
}
