<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\State;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StateController extends Controller
{
    /**
     * Display a listing of the states.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 50);
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = State::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('abbreviation', 'like', "%{$search}%");
            });
        }

        $states = $query->orderBy($sortBy, $sortDirection)
                       ->paginate($perPage);

        return response()->json($states);
    }

    /**
     * Display the specified state.
     */
    public function show(State $state): JsonResponse
    {
        return response()->json($state);
    }

    /**
     * Get cities for a specific state.
     */
    public function cities(State $state, Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 50);
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = $state->cities();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $cities = $query->orderBy($sortBy, $sortDirection)
                       ->paginate($perPage);

        return response()->json($cities);
    }
}
