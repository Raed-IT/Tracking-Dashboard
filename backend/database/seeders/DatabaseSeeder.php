<?php

namespace Database\Seeders;

use App\Domain\Tracking\Models\DataSource;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $org = DB::table('organizations')->insertGetId(['uuid' => Str::uuid(), 'name' => 'Operations Center', 'slug' => 'operations', 'created_at' => now(), 'updated_at' => now()]);
        $user = User::factory()->create(['name' => 'Operations Administrator', 'email' => 'admin@example.com', 'password' => Hash::make('change-me')]);
        DB::table('organization_user')->insert(['organization_id' => $org, 'user_id' => $user->id, 'role' => 'administrator']);
        DataSource::firstOrCreate(['slug' => 'mock-aircraft'], ['organization_id' => $org, 'name' => 'Mock Aircraft Stream', 'type' => 'aircraft', 'driver' => 'mock_aircraft', 'enabled' => true, 'status' => 'online', 'health_metadata' => ['mode' => 'simulation']]);
        DataSource::firstOrCreate(['slug' => 'flightradar24'], ['organization_id' => $org, 'name' => 'Flightradar24', 'type' => 'aircraft', 'driver' => 'flightradar24', 'enabled' => false, 'status' => 'offline', 'health_metadata' => ['reason' => 'FR24_API_KEY is not configured']]);
        DB::table('dashboard_layouts')->insert(['uuid' => Str::uuid(), 'organization_id' => $org, 'name' => 'Operations Center', 'is_default' => true, 'configuration' => json_encode(['columns' => 12, 'rowHeight' => 80]), 'created_at' => now(), 'updated_at' => now()]);
    }
}
