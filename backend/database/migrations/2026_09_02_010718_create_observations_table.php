<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('observations', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->uuid('uuid')->unique();

            $table->foreignId('source_id')
                ->constrained('data_sources')
                ->cascadeOnDelete();

            $table->string('source_track_id')
                ->index();

            $table->foreignId('track_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->timestamp('observed_at')
                ->index();

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

            $table->string('classification')
                ->nullable();

            $table->decimal('confidence', 5, 4)
                ->default(0.5);

            $table->json('metadata')
                ->nullable();

            $table->json('raw_payload')
                ->nullable();

            $table->timestamp('created_at')
                ->useCurrent();

            $table->index([
                'source_id',
                'observed_at',
            ]);

            $table->index([
                'track_id',
                'observed_at',
            ]);

            $table->index([
                'latitude',
                'longitude',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('observations');
    }
};