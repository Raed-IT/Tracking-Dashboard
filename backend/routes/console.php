<?php

use App\Domain\Tracking\Jobs\FetchSourceDataJob;
use App\Domain\Tracking\Models\DataSource;
use App\Jobs\FetchFlightradar24Aircraft;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

 

Schedule::job(new FetchFlightradar24Aircraft())
    ->everyFiveSeconds()
    ->withoutOverlapping();