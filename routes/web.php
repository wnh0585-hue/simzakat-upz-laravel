<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

Route::get('/{any?}', function () {
    $indexPath = public_path('frontend/index.html');
    if (File::exists($indexPath)) {
        return response()->file($indexPath);
    }
    return response()->json([
        'app' => 'SIMZAKAT UPZ - PSAK 109',
        'backend' => 'Laravel 13 API Running',
        'status' => 'Frontend build not found. Please run npm run build in frontend directory.',
    ]);
})->where('any', '^(?!api).*$');
