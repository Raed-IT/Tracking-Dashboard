<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Domain\Tracking\Models\DataSource;
use App\Domain\Tracking\Services\DataSourceAdapterFactory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class FetchFlightradar24Aircraft implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function handle(
        DataSourceAdapterFactory $factory
    ): void {
        $source = DataSource::query()
            ->where('driver', 'flightradar24')
            ->where('enabled', true)
            ->first();

        if (!$source) {
            Log::warning('FR24 source is not enabled.');

            return;
        }

        $adapter = $factory->make($source);

        $count = 0;

        foreach ($adapter->retrieveObservations() as $observation) {
            $count++;

            /*
             * IMPORTANT:
             * Put your aircraft/observation persistence logic here.
             *
             * For now we only log the received observation.
             */
            Log::info('FR24 aircraft received', [
                'observation' => $observation,
            ]);
        }

        $source->update([
            'status' => 'online',
            'last_success_at' => now(),
            'last_error' => null,
            'error_count' => 0,
        ]);

        Log::info('FR24 polling completed', [
            'aircraft_count' => $count,
        ]);
    }
}