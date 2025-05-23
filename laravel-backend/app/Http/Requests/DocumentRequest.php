<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentRequest extends FormRequest
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
            'document_type_id' => 'required|exists:document_types,id',
            'documentable_id' => 'required|integer',
            'documentable_type' => [
                'required',
                'string',
                Rule::in([
                    'App\\Models\\Property',
                    'App\\Models\\Contract',
                    'App\\Models\\Person',
                    'App\\Models\\Transaction',
                ]),
            ],
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => [
                'sometimes',
                'string',
                Rule::in(['pending', 'approved', 'rejected', 'expired']),
            ],
            'expires_at' => 'nullable|date',
            'is_visible_to_client' => 'boolean',
        ];

        // Regras adicionais para upload de arquivo
        if ($this->isMethod('POST') && $this->routeIs('documents.upload')) {
            $rules['file'] = 'required|file|max:10240'; // Máximo 10MB
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
            'document_type_id.required' => 'O tipo de documento é obrigatório',
            'document_type_id.exists' => 'O tipo de documento selecionado não existe',
            'documentable_id.required' => 'O ID do item relacionado é obrigatório',
            'documentable_id.integer' => 'O ID do item relacionado deve ser um número inteiro',
            'documentable_type.required' => 'O tipo do item relacionado é obrigatório',
            'documentable_type.string' => 'O tipo do item relacionado deve ser um texto',
            'documentable_type.in' => 'O tipo do item relacionado é inválido',
            'title.required' => 'O título do documento é obrigatório',
            'title.string' => 'O título do documento deve ser um texto',
            'title.max' => 'O título do documento não pode ter mais de :max caracteres',
            'description.string' => 'A descrição deve ser um texto',
            'status.string' => 'O status deve ser um texto',
            'status.in' => 'O status deve ser pendente, aprovado, rejeitado ou expirado',
            'expires_at.date' => 'A data de expiração deve ser uma data válida',
            'is_visible_to_client.boolean' => 'O campo visível para cliente deve ser verdadeiro ou falso',
            'file.required' => 'O arquivo é obrigatório',
            'file.file' => 'O arquivo enviado é inválido',
            'file.max' => 'O arquivo não pode ter mais de 10MB',
        ];
    }
} 