<?php

use App\Domain\Access\Enums\OrganizationRole;
use App\Domain\Access\Enums\Permission;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table): void {
            $table->string('role');
            $table->string('permission');
            $table->primary(['role', 'permission']);
        });

        foreach (OrganizationRole::cases() as $role) {
            foreach ($role->permissions() as $permission) {
                DB::table('role_permissions')->insert([
                    'role' => $role->value,
                    'permission' => $permission,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
