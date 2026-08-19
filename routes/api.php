<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MuzakkiController;
use App\Http\Controllers\Api\MustahikController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\CollectionPlanController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\BaznasTransactionController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\DigitalArchiveController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\BackupRestoreController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // DATA MASTER
    Route::apiResource('muzakki', MuzakkiController::class);
    Route::post('/muzakki/import', [MuzakkiController::class, 'import']);
    Route::apiResource('mustahik', MustahikController::class);

    // PERENCANAAN
    Route::apiResource('programs', ProgramController::class);
    Route::apiResource('collection-plans', CollectionPlanController::class);

    // TRANSAKSI
    Route::apiResource('transactions', TransactionController::class);
    Route::patch('/transactions/{transaction}/status', [TransactionController::class, 'updateStatus']);

    // PEMBUKUAN & LAPORAN
    Route::prefix('reports')->group(function () {
        Route::get('/posisi-keuangan', [ReportController::class, 'posisiKeuangan']);
        Route::get('/perubahan-dana', [ReportController::class, 'perubahanDana']);
        Route::get('/arus-kas', [ReportController::class, 'arusKas']);
        Route::get('/buku-kas', [ReportController::class, 'bukuKas']);
        Route::get('/buku-besar', [ReportController::class, 'bukuBesar']);
        Route::get('/neraca-saldo', [ReportController::class, 'neracaSaldo']);
        Route::get('/mutasi-kas-bank', [ReportController::class, 'mutasiKasBank']);
        Route::get('/jurnal-umum', [ReportController::class, 'jurnalUmum']);
    });

    // REGULATOR & ARSIP
    Route::apiResource('baznas-transactions', BaznasTransactionController::class);
    Route::patch('/baznas-transactions/{baznasTransaction}/approve', [BaznasTransactionController::class, 'approve']);
    Route::get('/digital-archive', [DigitalArchiveController::class, 'index']);
    Route::post('/digital-archive/upload', [DigitalArchiveController::class, 'upload']);

    // BANK ACCOUNTS
    Route::apiResource('bank-accounts', BankAccountController::class)->except(['show']);

    // SISTEM & ALAT
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::delete('/audit-logs', [AuditLogController::class, 'clear'])->middleware('role:Admin');
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);
    Route::get('/backup', [BackupRestoreController::class, 'export']);
    Route::post('/restore', [BackupRestoreController::class, 'restore']);

    // USER MANAGEMENT (Admin only)
    Route::apiResource('users', UserController::class)->middleware('role:Admin');
});
