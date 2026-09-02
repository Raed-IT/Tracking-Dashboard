<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_sources', function (Blueprint $table) {
            $table->id();

            $table->uuid('uuid')->unique();

            $table->foreignId('organization_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->string('slug')->unique();

            $table->string('type');

            $table->string('driver');

            $table->boolean('enabled')
                ->default(true);

            $table->string('status')
                ->default('offline')
                ->index();

            $table->text('configuration')
                ->nullable();

            $table->timestamp('last_message_at')
                ->nullable();

            $table->timestamp('last_success_at')
                ->nullable();

            $table->timestamp('last_error_at')
                ->nullable();

            $table->text('last_error')
                ->nullable();

            $table->unsignedInteger('latency_ms')
                ->nullable();

            $table->decimal(
                'messages_per_minute',
                10,
                2
            )->default(0);

            $table->unsignedBigInteger('error_count')
                ->default(0);

            $table->json('health_metadata')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_sources');
    }
};