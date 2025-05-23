<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PropertyTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        $rules = [
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => 'nullable|string',
            'active' => 'boolean',
            'icon' => 'nullable|string|max:50',
        ];

        // Add unique rule with exception for the current record when updating
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['name'][] = Rule::unique('property_types')->ignore($this->route('property_type'));
        } else {
            $rules['name'][] = 'unique:property_types';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'name.required' => 'O nome do tipo de imóvel é obrigatório.',
            'name.unique' => 'Este nome de tipo de imóvel já está em uso.',
            'name.max' => 'O nome do tipo de imóvel não pode ter mais de 255 caracteres.',
        ];
    }
} 