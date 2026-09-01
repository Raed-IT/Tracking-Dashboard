<?php

use App\Domain\Tracking\Jobs\FetchSourceDataJob;
use App\Domain\Tracking\Models\DataSource;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function (): void {
    DataSource::query()->where('enabled', true)->where('driver', 'mock_aircraft')->pluck('id')->each(fn (int $id) => FetchSourceDataJob::dispatch($id));
})->name('mock-source-ingestion')->everyTenSeconds()->withoutOverlapping();
