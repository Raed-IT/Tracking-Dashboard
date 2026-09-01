<?php

declare(strict_types=1);

namespace App\Domain\Tracking\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class DataSource extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    protected function casts(): array
    {
        return ['enabled' => 'boolean', 'configuration' => 'encrypted:array', 'health_metadata' => 'array', 'last_message_at' => 'datetime', 'last_success_at' => 'datetime', 'last_error_at' => 'datetime'];
    }
}
