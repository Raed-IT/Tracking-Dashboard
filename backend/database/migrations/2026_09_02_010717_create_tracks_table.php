<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tracks', function (Blueprint $table) {
            $table->id();

            $table->uuid('uuid')->unique();

            $table->foreignId('organization_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $table->string('type')->index();

            $table->string('classification')
                ->nullable();

            $table->string('callsign')
                ->nullable()
                ->index();

            $table->string('registration')
                ->nullable();

            $table->json('external_identifiers')
                ->nullable();

            $table->decimal('latitude', 10, 7);

            $table->decimal('longitude', 11, 7);

            $table->decimal('altitude', 12, 2)
                ->nullable();

            $table->decimal('speed', 10, 2)
                ->nullable();

            $table->decimal('heading', 7, 3)
                ->nullable();

            $table->decimal('vertical_rate', 10, 2)
                ->nullable();

            $table->decimal('confidence', 5, 4)
                ->default(0.5);

            $table->timestamp('first_seen_at');

            $table->timestamp('last_seen_at')
                ->index();

            $table->string('status')
                ->default('active')
                ->index();

            $table->json('source_ids')
                ->nullable();

            $table->json('metadata')
                ->nullable();

            $table->timestamps();

            $table->index([
                'latitude',
                'longitude',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracks');
    }
};