<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        return response()->json(AppSetting::all()->keyBy('key'));
    }

    public function update(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            AppSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return response()->json(['message' => 'Pengaturan berhasil disimpan.']);
    }
}
