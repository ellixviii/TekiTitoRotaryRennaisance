<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $search = $request->string('search')->toString();

        return Inertia::render('audit/index', ['events' => AuditEvent::with('actor:id,name')->when($search, fn ($q) => $q->where('action', 'like', "%{$search}%"))->latest()->paginate(50)->withQueryString(), 'search' => $search]);
    }
}
