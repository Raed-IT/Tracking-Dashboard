<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Tracking\Models\DataSource;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

final class SystemController extends Controller
{
    public function __invoke()
    {
        $checks = [];
        try {
            DB::select('select 1');
            $checks['database'] = 'online';
        } catch (\Throwable) {
            $checks['database'] = 'offline';
        } try {
            Redis::ping();
            $checks['redis'] = 'online';
        } catch (\Throwable) {
            $checks['redis'] = 'offline';
        } $checks['queue'] = config('queue.default');
        $checks['websocket'] = config('broadcasting.default');

        return response()->json(['status' => in_array('offline', $checks, true) ? 'degraded' : 'operational', 'checks' => $checks, 'sources' => DataSource::query()->selectRaw('status,count(*) as count')->groupBy('status')->pluck('count', 'status')]);
    }
}
