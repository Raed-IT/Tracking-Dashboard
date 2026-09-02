<?php

namespace App\Providers;

use App\Domain\Access\Contracts\OrganizationUserRepository;
use App\Domain\Alerts\Contracts\AlertRepository;
use App\Infrastructure\Persistence\EloquentAlertRepository;
use App\Infrastructure\Persistence\EloquentOrganizationUserRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(OrganizationUserRepository::class, EloquentOrganizationUserRepository::class);
        $this->app->bind(AlertRepository::class, EloquentAlertRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
