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
        /*
        |--------------------------------------------------------------------------
        | PostgreSQL / PostGIS support
        |--------------------------------------------------------------------------
        | This is ignored when using MySQL.
        */
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');
        }

        Schema::create('organizations', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();
            $t->string('name');
            $t->string('slug')->unique();
            $t->timestamps();
        });

        Schema::create('organization_user', function (Blueprint $t) {
            $t->foreignId('organization_id')
                ->constrained()
                ->cascadeOnDelete();

            $t->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $t->string('role')->default('viewer');

            $t->primary([
                'organization_id',
                'user_id',
            ]);
        });

        Schema::create('data_sources', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();

            $t->foreignId('organization_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $t->string('name');
            $t->string('slug')->unique();
            $t->string('type');
            $t->string('driver');

            $t->boolean('enabled')->default(true);
            $t->string('status')->default('offline')->index();

            $t->text('configuration')->nullable();

            $t->timestamp('last_message_at')->nullable();
            $t->timestamp('last_success_at')->nullable();
            $t->timestamp('last_error_at')->nullable();

            $t->text('last_error')->nullable();

            $t->unsignedInteger('latency_ms')->nullable();

            $t->decimal('messages_per_minute', 10, 2)
                ->default(0);

            $t->unsignedBigInteger('error_count')
                ->default(0);

            /*
             * MySQL:
             * Do not use ->default('{}') on JSON here.
             */
            $t->json('health_metadata')->nullable();

            $t->timestamps();
        });

        Schema::create('tracks', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();

            $t->foreignId('organization_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $t->string('type')->index();
            $t->string('classification')->nullable();

            $t->string('callsign')
                ->nullable()
                ->index();

            $t->string('registration')->nullable();

            $t->json('external_identifiers')->nullable();

            $t->decimal('latitude', 10, 7);
            $t->decimal('longitude', 11, 7);

            $t->decimal('altitude', 12, 2)->nullable();
            $t->decimal('speed', 10, 2)->nullable();
            $t->decimal('heading', 7, 3)->nullable();
            $t->decimal('vertical_rate', 10, 2)->nullable();

            $t->decimal('confidence', 5, 4)
                ->default(0.5);

            $t->timestamp('first_seen_at');

            $t->timestamp('last_seen_at')
                ->index();

            $t->string('status')
                ->default('active')
                ->index();

            $t->json('source_ids')->nullable();
            $t->json('metadata')->nullable();

            $t->timestamps();
        });

        Schema::create('observations', function (Blueprint $t) {
            $t->bigIncrements('id');

            $t->uuid('uuid')->unique();

            $t->foreignId('source_id')
                ->constrained('data_sources')
                ->cascadeOnDelete();

            $t->string('source_track_id')
                ->index();

            $t->foreignId('track_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $t->timestamp('observed_at')
                ->index();

            $t->decimal('latitude', 10, 7);
            $t->decimal('longitude', 11, 7);

            $t->decimal('altitude', 12, 2)->nullable();
            $t->decimal('speed', 10, 2)->nullable();
            $t->decimal('heading', 7, 3)->nullable();
            $t->decimal('vertical_rate', 10, 2)->nullable();

            $t->string('classification')->nullable();

            $t->decimal('confidence', 5, 4)
                ->default(0.5);

            $t->json('metadata')->nullable();
            $t->json('raw_payload')->nullable();

            $t->timestamp('created_at')
                ->useCurrent();

            $t->index([
                'source_id',
                'observed_at',
            ]);

            $t->index([
                'track_id',
                'observed_at',
            ]);
        });

        Schema::create('geofences', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();

            $t->foreignId('organization_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $t->string('name');

            $t->string('severity')
                ->default('medium');

            $t->boolean('enabled')
                ->default(true);

            $t->json('geometry_json');
            $t->json('metadata')->nullable();

            $t->timestamps();
        });

        Schema::create('alert_rules', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();

            $t->foreignId('organization_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $t->string('name');

            $t->boolean('enabled')
                ->default(true);

            $t->string('severity');

            $t->json('conditions');

            /*
             * Initialize ["create_alert"] in Laravel code,
             * not as a MySQL JSON default.
             */
            $t->json('actions')->nullable();

            $t->timestamps();
        });

        Schema::create('alerts', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();

            $t->foreignId('organization_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $t->foreignId('track_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $t->foreignId('alert_rule_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $t->string('severity')
                ->index();

            $t->string('state')
                ->default('active')
                ->index();

            $t->string('title');
            $t->text('message')->nullable();

            $t->json('metadata')->nullable();

            $t->timestamp('acknowledged_at')
                ->nullable();

            $t->foreignId('acknowledged_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $t->timestamp('resolved_at')
                ->nullable();

            $t->timestamps();
        });

        Schema::create('track_events', function (Blueprint $t) {
            $t->bigIncrements('id');

            $t->foreignId('track_id')
                ->constrained()
                ->cascadeOnDelete();

            $t->string('type')
                ->index();

            $t->timestamp('occurred_at')
                ->index();

            $t->json('payload')->nullable();

            $t->timestamp('created_at')
                ->useCurrent();
        });

        Schema::create('dashboard_layouts', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();

            $t->foreignId('organization_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $t->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $t->string('name');

            $t->boolean('is_default')
                ->default(false);

            $t->json('configuration');

            $t->timestamps();
        });

        Schema::create('dashboard_widgets', function (Blueprint $t) {
            $t->id();

            $t->foreignId('dashboard_layout_id')
                ->constrained()
                ->cascadeOnDelete();

            $t->string('type');
            $t->string('title');

            $t->json('position');
            $t->json('configuration')->nullable();

            $t->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | PostgreSQL/PostGIS only
        |--------------------------------------------------------------------------
        */
        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE tracks
                ADD COLUMN position geography(Point,4326)
                GENERATED ALWAYS AS (
                    ST_SetSRID(
                        ST_MakePoint(longitude, latitude),
                        4326
                    )::geography
                ) STORED'
            );

            DB::statement(
                'ALTER TABLE observations
                ADD COLUMN position geography(Point,4326)
                GENERATED ALWAYS AS (
                    ST_SetSRID(
                        ST_MakePoint(longitude, latitude),
                        4326
                    )::geography
                ) STORED'
            );

            DB::statement(
                'CREATE INDEX tracks_position_gist
                ON tracks
                USING GIST(position)'
            );

            DB::statement(
                'CREATE INDEX observations_position_gist
                ON observations
                USING GIST(position)'
            );
        }
    }

    public function down(): void
    {
        foreach ([
            'dashboard_widgets',
            'dashboard_layouts',
            'track_events',
            'alerts',
            'alert_rules',
            'geofences',
            'observations',
            'tracks',
            'data_sources',
            'organization_user',
            'organizations',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};