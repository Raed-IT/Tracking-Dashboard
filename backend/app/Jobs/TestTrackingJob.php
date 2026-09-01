<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class TestTrackingJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $time = now()->toDateTimeString();

        Log::info('TestTrackingJob executed', [
            'time' => $time,
        ]);

        Redis::set('test_tracking_job:last_run', $time);
    }
}