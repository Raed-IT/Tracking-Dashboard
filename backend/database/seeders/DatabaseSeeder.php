<?php

namespace Database\Seeders;

use App\Domain\Alerts\Models\Alert;
use App\Domain\Tracking\Models\DataSource;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(['email' => 'admin@example.com'], ['name' => 'Administrator', 'password' => 'change-me', 'role' => 'administrator']);
        User::updateOrCreate(['email' => 'superadmin@test.com'], ['name' => 'Super Administrator', 'password' => '123456', 'role' => 'superadmin']);
        DataSource::firstOrCreate(['slug' => 'mock-aircraft'], ['name' => 'Mock Aircraft Stream', 'type' => 'aircraft', 'driver' => 'mock_aircraft', 'enabled' => true, 'status' => 'online', 'health_metadata' => ['mode' => 'simulation']]);
        DataSource::firstOrCreate(['slug' => 'flightradar24'], ['name' => 'Flightradar24', 'type' => 'aircraft', 'driver' => 'flightradar24', 'enabled' => false, 'status' => 'offline', 'health_metadata' => ['reason' => 'FR24_API_KEY is not configured']]);
        Alert::firstOrCreate(['title' => 'Low-altitude aircraft detected'], ['severity' => 'high', 'state' => 'active', 'message' => 'Aircraft entered the monitored area below the configured altitude threshold.', 'metadata' => ['source' => 'mock-aircraft']]);
        Alert::firstOrCreate(['title' => 'FR24 source offline'], ['severity' => 'medium', 'state' => 'active', 'message' => 'The FR24 adapter is waiting for valid API credentials.', 'metadata' => ['source' => 'flightradar24']]);
        DB::table('dashboard_layouts')->updateOrInsert(['is_default' => true], ['uuid' => Str::uuid(), 'name' => 'Operations Center', 'configuration' => json_encode(['columns' => 12, 'rowHeight' => 80]), 'created_at' => now(), 'updated_at' => now()]);
    }
}
