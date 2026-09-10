<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Services;

use App\Domain\Tracking\Contracts\DataSourceInterface;
use App\Domain\Tracking\Models\DataSource;
use App\Domain\Tracking\Sources\Flightradar24\Flightradar24Adapter;
use RuntimeException;

final class DataSourceAdapterFactory
{
    public function make(
        DataSource $source
    ): DataSourceInterface {
        return match ($source->driver) {

            'flightradar24' => $this->makeFlightradar24(
                $source
            ),

            default => throw new RuntimeException(
                "Unsupported data source driver: {$source->driver}"
            ),
        };
    }

    private function makeFlightradar24(
        DataSource $source
    ): Flightradar24Adapter {
        $databaseConfig = is_array($source->configuration)
            ? $source->configuration
            : [];

        return new Flightradar24Adapter([
            'api_key' => config(
                'services.flightradar24.api_key'
            ),

            'base_url' => $databaseConfig['base_url']
                ?? config(
                    'services.flightradar24.base_url'
                ),

            'bounds' => $databaseConfig['bounds']
                ?? config(
                    'services.flightradar24.bounds'
                ),

            'limit' => (int) (
                $databaseConfig['limit']
                ?? config(
                    'services.flightradar24.limit',
                    1000
                )
            ),

            'timeout' => (int) (
                $databaseConfig['timeout']
                ?? 15
            ),
        ]);
    }
}