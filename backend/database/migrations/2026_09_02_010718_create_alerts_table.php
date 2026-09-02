<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();

            $table->uuid('uuid')->unique();

            $table->foreignId('organization_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('track_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('alert_rule_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('severity')
                ->index();

            $table->string('state')
                ->default('active')
                ->index();

            $table->string('title');

            $table->text('message')
                ->nullable();

            $table->json('metadata')
                ->nullable();

            $table->timestamp('acknowledged_at')
                ->nullable();

            $table->foreignId('acknowledged_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('resolved_at')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};