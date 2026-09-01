<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Jobs;

use App\Domain\Tracking\Models\DataSource;
use App\Domain\Tracking\Services\IngestionService;
use App\Domain\Tracking\Sources\Mock\MockAircraftAdapter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class FetchSourceDataJob implements ShouldQueue
{
    use Dispatchable,InteractsWithQueue,Queueable,SerializesModels;

    public int $tries = 5;

    public function backoff(): array
    {
        return [5, 15, 60, 180];
    }

    public function __construct(public readonly int $sourceId) {}

    public function handle(IngestionService $ingestion): void
    {
        $source = DataSource::findOrFail($this->sourceId);
        if (! $source->enabled) {
            return;
        } $adapter = match ($source->driver) {
            'mock_aircraft' => new MockAircraftAdapter,default => throw new \RuntimeException("Unsupported source driver {$source->driver}")
        };
        foreach ($adapter->retrieveObservations() as $raw) {
            $ingestion->ingest($source, $adapter->normalize($raw));
        } $source->update(['status' => 'online', 'last_message_at' => now(), 'last_success_at' => now(), 'messages_per_minute' => 20]);
    }

    public function failed(\Throwable $e): void
    {
        DataSource::whereKey($this->sourceId)->update(['status' => 'degraded', 'last_error_at' => now(), 'last_error' => $e->getMessage()]);
    }
}
