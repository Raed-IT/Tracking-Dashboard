<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SourceController;
use App\Http\Controllers\Api\V1\SystemController;
use App\Http\Controllers\Api\V1\TrackController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::get('system/status', SystemController::class);
    // Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/user', [AuthController::class, 'user']);
        Route::get('tracks', [TrackController::class, 'index']);
        Route::get('tracks/{track}', [TrackController::class, 'show']);
        Route::get('tracks/{track}/history', [TrackController::class, 'history']);
        Route::get('sources', [SourceController::class, 'index']);
        Route::get('sources/{source}', [SourceController::class, 'show']);
        Route::get('sources/{source}/health', [SourceController::class, 'health']);
    // });
});
