<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role')->default('viewer')->after('password');
        });

        if (Schema::hasTable('organization_user')) {
            DB::table('organization_user')->orderBy('user_id')->get()->each(
                static function (object $membership): void {
                    DB::table('users')
                        ->where('id', $membership->user_id)
                        ->update(['role' => $membership->role]);
                },
            );
        }

        foreach (['tracks', 'data_sources', 'alerts', 'alert_rules', 'geofences', 'dashboard_layouts'] as $tableName) {
            if (! Schema::hasTable($tableName) || ! Schema::hasColumn($tableName, 'organization_id')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropForeign(['organization_id']);
                $table->dropColumn('organization_id');
            });
        }

        Schema::dropIfExists('organization_user');
        Schema::dropIfExists('organizations');
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('role');
        });
    }
};
