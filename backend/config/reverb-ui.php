<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Reverb UI Path
    |--------------------------------------------------------------------------
    |
    | This is the URI path where the Reverb UI will be accessible from.
    | Feel free to change this path to anything you like.
    |
    */

    'path' => env('REVERB_UI_PATH', 'reverb-ui'),

    /*
    |--------------------------------------------------------------------------
    | Reverb UI Middleware
    |--------------------------------------------------------------------------
    |
    | These middleware will be assigned to every Reverb UI route, giving
    | you the chance to add your own middleware to this list or change any of
    | the existing middleware. Or, you can simply stick with the defaults.
    |
    */

    'middleware' => [
        'web',
        'reverb-ui.auth',
    ],

    /*
    |--------------------------------------------------------------------------
    | Reverb UI Admins
    |--------------------------------------------------------------------------
    |
    | These are the email addresses of the users who are allowed to access the
    | Reverb UI in production environments.
    |
    */

    'admins' => [
        // 'admin@example.com',
    ],

    /*
    |--------------------------------------------------------------------------
    | Performance and Storage
    |--------------------------------------------------------------------------
    |
    | Telemetry can generate significant data. Here you can configure
    | how records are managed and which events to ignore.
    |
    */

    'max_events' => 1000,

    /*
    |--------------------------------------------------------------------------
    | Reverb UI Master Switch
    |--------------------------------------------------------------------------
    |
    | When disabled, the entire package will stop functioning. This includes
    | all event tracking, database logging, stats collection, and dashboard access.
    |
    */

    'enabled' => env('REVERB_UI_ENABLED', true),

    'always_allow_environments' => [
        'local',
        'staging',
    ],

    'ignored_events' => [
        'pusher:ping',
        'pusher:pong',
    ],

    'storage' => [
        'database' => [
            'connection' => env('REVERB_UI_DB_CONNECTION', null),
        ],
        'cache' => [
            'driver' => env('REVERB_UI_STORAGE_DRIVER', 'cache'),
            'connection' => env('REVERB_UI_STORAGE_CONNECTION', null),
        ],
    ],
];
