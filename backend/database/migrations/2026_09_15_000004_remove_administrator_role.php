<?php

declare(strict_types=1);

use App\Domain\Access\Enums\OrganizationRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereIn('role', ['admin', 'administrator'])
            ->update(['role' => OrganizationRole::Superadmin->value]);

        DB::table('role_permissions')
            ->whereIn('role', ['admin', 'administrator'])
            ->delete();

        DB::table('roles')
            ->whereIn(DB::raw('lower(slug)'), ['admin', 'administrator'])
            ->delete();
    }

    public function down(): void
    {
        // The removed role is intentionally not restored.
    }
};
