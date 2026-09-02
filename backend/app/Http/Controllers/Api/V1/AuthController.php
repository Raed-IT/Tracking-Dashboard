<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\AuthenticatedUserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

final class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $v = $request->validated();
        $u = User::where('email', $v['email'])->first();
        if (! $u || ! Hash::check($v['password'], $u->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        $u->load('organizations');
        $u->tokens()->where('name', 'dashboard')->delete();

        return response()->json([
            'token' => $u->createToken('dashboard', $u->permissions())->plainTextToken,
            'user' => (new AuthenticatedUserResource($u))->resolve(),
        ]);
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()?->delete();
        Auth::forgetGuards();

        return response()->noContent();
    }

    public function user(Request $r)
    {
        return new AuthenticatedUserResource($r->user()->load('organizations'));
    }
}
