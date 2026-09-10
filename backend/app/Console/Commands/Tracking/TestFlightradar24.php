<?php

declare(strict_types=1);

namespace App\Console\Commands\Tracking;

use App\Domain\Tracking\Models\DataSource;
use App\Domain\Tracking\Services\DataSourceAdapterFactory;
use Illuminate\Console\Command;

final class TestFlightradar24 extends Command
{
    protected $signature = 'tracking:fr24:test
                            {--id=2 : Data source ID}';

    protected $description =
        'Test the Flightradar24 data source connection';

    public function handle(
        DataSourceAdapterFactory $factory
    ): int {
        $source = DataSource::query()
            ->find($this->option('id'));

        if (!$source) {
            $this->error('Data source not found.');

            return self::FAILURE;
        }

        $this->info(
            "Testing DataSource #{$source->id}"
        );

        $this->line(
            "Driver: {$source->driver}"
        );

        $adapter = $factory->make($source);

        $health = $adapter->healthCheck();

        $this->newLine();

        $this->table(
            ['Field', 'Value'],
            [
                [
                    'Healthy',
                    $health['healthy']
                        ? 'YES'
                        : 'NO',
                ],
                [
                    'Latency',
                    $health['latency_ms'] !== null
                        ? $health['latency_ms'] . ' ms'
                        : 'N/A',
                ],
                [
                    'Message',
                    $health['message'],
                ],
            ]
        );

        if (!$health['healthy']) {
            $source->update([
                'status' => 'offline',

                'last_error_at' => now(),

                'last_error' => $health['message'],

                'latency_ms' => $health['latency_ms'],

                'health_metadata' => [
                    'reason' => $health['message'],
                ],

                'error_count' => $source->error_count + 1,
            ]);

            return self::FAILURE;
        }

        $source->update([
            'status' => 'online',

            'last_success_at' => now(),

            'latency_ms' => $health['latency_ms'],

            'last_error' => null,

            'health_metadata' => [
                'reason' => 'FR24 API connection successful',
            ],
        ]);

        $this->info(
            'Flightradar24 is ONLINE.'
        );

        return self::SUCCESS;
    }
}