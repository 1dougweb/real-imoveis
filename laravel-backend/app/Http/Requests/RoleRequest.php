<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class RoleRequest extends FormRequest
{
    /**
     * Constructor to log incoming data
     */
    public function __construct(array $query = [], array $request = [], array $attributes = [], array $cookies = [], array $files = [], array $server = [], $content = null)
    {
        parent::__construct($query, $request, $attributes, $cookies, $files, $server, $content);
        
        Log::info('RoleRequest constructed with data:', [
            'json' => $this->json()->all(),
            'request' => $this->all(),
            'route_params' => $this->route() ? $this->route()->parameters() : 'No Route',
            'content_type' => $this->header('Content-Type')
        ]);
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // A autorização será verificada nos controllers
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $roleId = $this->route('role')?->id;
        
        Log::info('RoleRequest rules - Role ID:', ['role_id' => $roleId]);
        Log::info('RoleRequest rules - Request data:', $this->all());

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->whereNull('deleted_at')->ignore($roleId),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
            'guard_name' => ['sometimes', 'string', 'in:web,api'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $mergeData = [
            'guard_name' => 'web', // Default guard
        ];
        
        // Only set is_active if it's not already in the request
        if (!$this->has('is_active')) {
            $mergeData['is_active'] = true;
        }
        
        $this->merge($mergeData);
        
        Log::info('RoleRequest prepareForValidation - Data after merge:', $this->all());
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome do cargo é obrigatório',
            'name.string' => 'O nome do cargo deve ser um texto',
            'name.max' => 'O nome do cargo não pode ter mais de 255 caracteres',
            'name.unique' => 'Já existe um cargo com este nome',
            'description.string' => 'A descrição deve ser um texto',
            'is_active.boolean' => 'O campo ativo deve ser verdadeiro ou falso',
            'guard_name.string' => 'O guard_name deve ser um texto',
            'guard_name.in' => 'O guard_name deve ser web ou api',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function failedValidation($validator)
    {
        Log::error('RoleRequest validation failed:', [
            'errors' => $validator->errors()->toArray(),
            'data' => $this->all()
        ]);

        parent::failedValidation($validator);
    }
} 