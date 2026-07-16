<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveMember
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_if(in_array($request->user()?->memberProfile?->status, ['suspended', 'archived'], true), 403, 'This account is not active.');

        return $next($request);
    }
}
