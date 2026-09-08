<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrganizationUserSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::firstOrCreate(
            ['slug' => 'operations'],
            ['name' => 'Operations Center'],
        );

        $users = [
            
                [
                    'name' => 'Operations Administrator',
                    'email' => 'superadmin@test.com',
                    'password' => '123456',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Operations Supervisor',
                    'email' => 'supervisor@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'Flight Operator',
                    'email' => 'operator@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Read Only Viewer',
                    'email' => 'viewer@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'John Anderson',
                    'email' => 'john.anderson@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Sarah Mitchell',
                    'email' => 'sarah.mitchell@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'Michael Johnson',
                    'email' => 'michael.johnson@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Emily Davis',
                    'email' => 'emily.davis@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'David Wilson',
                    'email' => 'david.wilson@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Jessica Brown',
                    'email' => 'jessica.brown@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'Robert Taylor',
                    'email' => 'robert.taylor@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Ashley Martinez',
                    'email' => 'ashley.martinez@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'James Anderson',
                    'email' => 'james.anderson@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Linda Thomas',
                    'email' => 'linda.thomas@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'William Jackson',
                    'email' => 'william.jackson@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Mary White',
                    'email' => 'mary.white@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'Christopher Harris',
                    'email' => 'christopher.harris@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Patricia Martin',
                    'email' => 'patricia.martin@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'Daniel Thompson',
                    'email' => 'daniel.thompson@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Jennifer Garcia',
                    'email' => 'jennifer.garcia@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'Matthew Martinez',
                    'email' => 'matthew.martinez@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Nancy Robinson',
                    'email' => 'nancy.robinson@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'Anthony Clark',
                    'email' => 'anthony.clark@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Karen Rodriguez',
                    'email' => 'karen.rodriguez@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'Mark Lewis',
                    'email' => 'mark.lewis@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Betty Lee',
                    'email' => 'betty.lee@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'Donald Walker',
                    'email' => 'donald.walker@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Helen Hall',
                    'email' => 'helen.hall@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'Steven Allen',
                    'email' => 'steven.allen@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Sandra Young',
                    'email' => 'sandra.young@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'Paul Hernandez',
                    'email' => 'paul.hernandez@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Donna King',
                    'email' => 'donna.king@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'Andrew Wright',
                    'email' => 'andrew.wright@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Carol Lopez',
                    'email' => 'carol.lopez@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'Joshua Hill',
                    'email' => 'joshua.hill@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Michelle Scott',
                    'email' => 'michelle.scott@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'Kenneth Green',
                    'email' => 'kenneth.green@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Dorothy Adams',
                    'email' => 'dorothy.adams@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'Kevin Baker',
                    'email' => 'kevin.baker@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Laura Nelson',
                    'email' => 'laura.nelson@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'Brian Carter',
                    'email' => 'brian.carter@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Kimberly Mitchell',
                    'email' => 'kimberly.mitchell@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'George Perez',
                    'email' => 'george.perez@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Betty Roberts',
                    'email' => 'betty.roberts@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'Edward Turner',
                    'email' => 'edward.turner@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Donna Phillips',
                    'email' => 'donna.phillips@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'Ronald Campbell',
                    'email' => 'ronald.campbell@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Stephanie Parker',
                    'email' => 'stephanie.parker@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
                [
                    'name' => 'Timothy Evans',
                    'email' => 'timothy.evans@test.com',
                    'password' => 'password',
                    'role' => 'administrator',
                ],
                [
                    'name' => 'Rebecca Edwards',
                    'email' => 'rebecca.edwards@test.com',
                    'password' => 'password',
                    'role' => 'supervisor',
                ],
                [
                    'name' => 'Jason Collins',
                    'email' => 'jason.collins@test.com',
                    'password' => 'password',
                    'role' => 'operator',
                ],
                [
                    'name' => 'Sharon Stewart',
                    'email' => 'sharon.stewart@test.com',
                    'password' => 'password',
                    'role' => 'viewer',
                ],
            
        ];

        foreach ($users as $attributes) {
            $user = User::firstOrCreate(
                ['email' => $attributes['email']],
                [
                    'name' => $attributes['name'],
                    'password' => Hash::make($attributes['password']),
                ],
            );

            $organization->users()->syncWithoutDetaching([
                $user->id => ['role' => $attributes['role']],
            ]);
        }
    }
}
