<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class RolePermission extends Model
{
    public $timestamps = false;

    protected $table = 'role_permissions';

    protected $fillable = ['role', 'permission'];
}
