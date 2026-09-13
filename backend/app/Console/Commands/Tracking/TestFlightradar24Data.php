<?php

declare(strict_types=1);

namespace App\Console\Commands\Tracking;

use App\Domain\Tracking\Models\DataSource;
use App\Domain\Tracking\Services\DataSourceAdapterFactory;
use Illuminate\Console\Command;
use Throwable;

final class TestFlightradar24Data extends Command
{
    protected $signature = 'tracking:fr24:data
                            {--id=2 : Data source ID}
                            {--limit=10 : Number of aircraft to display}';

    protected $description =
        'Test retrieving live aircraft data from Flightradar24';

    public function handle(
        DataSourceAdapterFactory $factory
    ): int {
        $source = DataSource::query()
            ->find($this->option('id'));

        if (!$source) {
            $this->error('Data source not found.');

            return self::FAILURE;
        }

        $this->info("Testing DataSource #{$source->id}");
        $this->line("Driver: {$source->driver}");
        $this->newLine();

        try {
            $adapter = $factory->make($source);

            $count = 0;
            $limit = (int) $this->option('limit');

            foreach ($adapter->retrieveObservations() as $observation) {
                $count++;

                $this->table(
                    [
                        'Track ID',
                        'Name',
                        'Lat',
                        'Lon',
                        'Altitude',
                        'Speed',
                        'Heading',
                        'Type',
                    ],
                    [[
                        $observation->sourceTrackId,
                        $observation->name ?? 'N/A',
                        $observation->latitude ?? 'N/A',
                        $observation->longitude ?? 'N/A',
                        $observation->altitude ?? 'N/A',
                        $observation->speed ?? 'N/A',
                        $observation->heading ?? 'N/A',
                        $observation->classification ?? 'N/A',
                    ]]
                );

                if ($count >= $limit) {
                    break;
                }
            }

            $this->newLine();

            if ($count === 0) {
                $this->warn(
                    'FR24 responded successfully, but no aircraft were returned for the configured bounds.'
                );

                return self::SUCCESS;
            }

            $this->info(
                "Successfully received {$count} aircraft from Flightradar24."
            );

            return self::SUCCESS;

        } catch (Throwable $e) {
            $this->error('FR24 data request failed.');
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}