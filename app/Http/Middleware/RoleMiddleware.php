<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!empty($roles) && !in_array($request->user()->role, $roles)) {
            return response()->json(['message' => 'Akses ditolak. Role Anda tidak memiliki izin untuk tindakan ini.'], 403);
        }

        return $next($request);
    }
}
