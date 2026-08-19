<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class DigitalArchiveController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::whereNotNull('proof_file_path')->with(['creator']);
        if ($request->date_from) $query->where('date', '>=', $request->date_from);
        if ($request->date_to) $query->where('date', '<=', $request->date_to);
        return response()->json($query->orderByDesc('date')->paginate(50));
    }

    public function upload(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,xlsx,xls',
        ]);
        $transaction = Transaction::findOrFail($request->transaction_id);
        $file = $request->file('file');
        $path = $file->store('proofs', 'public');
        $transaction->update([
            'proof_file_name' => $file->getClientOriginalName(),
            'proof_file_path' => $path,
        ]);
        return response()->json([
            'message' => 'File bukti berhasil diupload.',
            'path' => $path,
        ]);
    }
}
