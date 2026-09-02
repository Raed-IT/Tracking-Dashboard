<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dashboard_layouts', function (Blueprint $table) {
            $table->id();

            $table->uuid('uuid')->unique();

            $table->foreignId('organization_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->boolean('is_default')
                ->default(false);

            $table->json('configuration');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dashboard_layouts');
    }
};