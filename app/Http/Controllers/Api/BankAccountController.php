<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(BankAccount::orderBy('bank_name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:baznas,upz,upz_penghimpunan',
            'fund_type' => 'nullable|string',
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
            'account_holder' => 'required|string',
            'description' => 'nullable|string',
        ]);
        return response()->json(BankAccount::create($data), 201);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        $bankAccount->update($request->all());
        return response()->json($bankAccount);
    }

    public function destroy(BankAccount $bankAccount)
    {
        $bankAccount->delete();
        return response()->json(['message' => 'Rekening bank berhasil dihapus.']);
    }
}
