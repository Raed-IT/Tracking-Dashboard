<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geofences', function (Blueprint $table) {
            $table->id();

            $table->uuid('uuid')->unique();

            $table->foreignId('organization_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->string('severity')
                ->default('medium');

            $table->boolean('enabled')
                ->default(true);

            $table->json('geometry_json');

            $table->json('metadata')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geofences');
    }
};