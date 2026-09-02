<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('track_events', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->foreignId('track_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('type')
                ->index();

            $table->timestamp('occurred_at')
                ->index();

            $table->json('payload')
                ->nullable();

            $table->timestamp('created_at')
                ->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('track_events');
    }
};