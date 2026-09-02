<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SourceController;
use App\Http\Controllers\Api\V1\SystemController;
use App\Http\Controllers\Api\V1\TrackController;
use App\Http\Controllers\Api\V1\OrganizationUserController;
use App\Http\Controllers\Api\V1\AlertController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::get('system/status', SystemController::class);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/user', [AuthController::class, 'user']);
        Route::middleware('permission:tracks.view')->group(function () {
            Route::get('tracks', [TrackController::class, 'index']);
            Route::get('tracks/{track}', [TrackController::class, 'show']);
            Route::get('tracks/{track}/history', [TrackController::class, 'history']);
        });
        Route::middleware('permission:sources.view')->group(function () {
            Route::get('sources', [SourceController::class, 'index']);
            Route::get('sources/{source}', [SourceController::class, 'show']);
            Route::get('sources/{source}/health', [SourceController::class, 'health']);
        });
        Route::middleware('permission:users.manage')->apiResource('organization/users', OrganizationUserController::class)->except('show');
        Route::middleware('permission:alerts.view')->get('alerts', [AlertController::class, 'index']);
        Route::middleware('permission:alerts.manage')->post('alerts/{alert}/acknowledge', [AlertController::class, 'acknowledge']);
    });
});
