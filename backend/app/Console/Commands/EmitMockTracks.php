<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Domain\Tracking\Jobs\FetchSourceDataJob;
use App\Domain\Tracking\Models\DataSource;
use Illuminate\Console\Command;

final class EmitMockTracks extends Command
{
    protected $signature = 'tracking:mock {--once} {--interval=3}';

    protected $description = 'Emit mock aircraft through the production ingestion pipeline';

    public function handle(): int
    {
        $source = DataSource::where('driver', 'mock_aircraft')->firstOrFail();
        do {
            FetchSourceDataJob::dispatchSync($source->id);
            if ($this->option('once')) {
                break;
            }sleep((int) $this->option('interval'));
        } while (true);

        return self::SUCCESS;
    }
}
