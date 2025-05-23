<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentTypeRequest extends FormRequest
{
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
        $rules = [
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ];

        // Adiciona regra de unicidade para o nome, exceto no caso de atualização
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['name'][] = Rule::unique('document_types')->ignore($this->route('document_type'));
        } else {
            $rules['name'][] = 'unique:document_types,name';
        }

        return $rules;
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'O nome do tipo de documento é obrigatório',
            'name.string' => 'O nome do tipo de documento deve ser um texto',
            'name.max' => 'O nome do tipo de documento não pode ter mais de :max caracteres',
            'name.unique' => 'Este nome de tipo de documento já está em uso',
            'description.string' => 'A descrição deve ser um texto',
            'description.max' => 'A descrição não pode ter mais de :max caracteres',
            'is_active.boolean' => 'O campo ativo deve ser verdadeiro ou falso',
        ];
    }
} 