<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user')->orderByDesc('created_at');
        if ($request->entity) $query->where('entity', $request->entity);
        if ($request->action) $query->where('action', $request->action);
        if ($request->user_id) $query->where('user_id', $request->user_id);
        if ($request->date_from) $query->where('created_at', '>=', $request->date_from);
        if ($request->date_to) $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        return response()->json($query->paginate($request->get('per_page', 50)));
    }

    public function clear(Request $request)
    {
        AuditLog::truncate();
        return response()->json(['message' => 'Log aktivitas berhasil dibersihkan.']);
    }
}
