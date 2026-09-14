<?php

namespace App\Console\Commands\Tracking;

use App\Jobs\FetchFlightradar24Aircraft;
use Illuminate\Console\Command;

class FetchFlightsContinuously extends Command
{
    protected $signature = 'flights:fetch';

    protected $description = 'Fetch Flightradar24 aircraft every 6 seconds';

    public function handle(): int
    {
        $this->info('Flightradar24 fetcher started.');

        while (true) {
            sleep(6);
            try {
                FetchFlightradar24Aircraft::dispatch();
                $this->info(now()->toDateTimeString() . ' - Job dispatched');
            } catch (\Throwable $e) {
                $this->error($e->getMessage());
                            sleep(20);
                        return self::FAILURE;
            }

            
        }

        return self::SUCCESS;
    }
}