<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PropertyRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'property_type_id' => 'required|exists:property_types,id',
            'purpose' => ['required', Rule::in(['sale', 'rent', 'both'])],
            'sale_price' => 'nullable|numeric|min:0|required_if:purpose,sale,both',
            'rent_price' => 'nullable|numeric|min:0|required_if:purpose,rent,both',
            'condominium_fee' => 'nullable|numeric|min:0',
            'iptu' => 'nullable|numeric|min:0',
            'address' => 'required|string|max:255',
            'address_number' => 'required|string|max:20',
            'address_complement' => 'nullable|string|max:100',
            'neighborhood_id' => 'required|exists:neighborhoods,id',
            'city_id' => 'required|exists:cities,id',
            'state' => 'required|string|size:2',
            'zip_code' => 'required|string|max:10',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'suites' => 'nullable|integer|min:0',
            'parking_spaces' => 'nullable|integer|min:0',
            'area' => 'nullable|numeric|min:0',
            'total_area' => 'nullable|numeric|min:0',
            'floor' => 'nullable|integer|min:0',
            'furnished' => 'boolean',
            'facing' => 'nullable|string|max:50',
            'owner_id' => 'required|exists:people,id',
            'agent_id' => 'nullable|exists:people,id',
            'status' => ['required', Rule::in(['available', 'sold', 'rented', 'reserved', 'unavailable'])],
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
            'featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string|max:255',
            'active' => 'boolean',
            'features' => 'nullable|array',
            'features.*' => 'exists:features,id',
        ];

        // Adiciona regra de unicidade para o código, exceto no caso de atualização
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['code'] = [
                'nullable',
                'string',
                'max:50',
                Rule::unique('properties')->ignore($this->route('property')),
            ];
        } else {
            $rules['code'] = 'nullable|string|max:50|unique:properties,code';
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
            'title.required' => 'O título do imóvel é obrigatório',
            'title.string' => 'O título do imóvel deve ser um texto',
            'title.max' => 'O título do imóvel não pode ter mais de :max caracteres',
            'description.required' => 'A descrição do imóvel é obrigatória',
            'description.string' => 'A descrição do imóvel deve ser um texto',
            'property_type_id.required' => 'O tipo de imóvel é obrigatório',
            'property_type_id.exists' => 'O tipo de imóvel selecionado não existe',
            'purpose.required' => 'A finalidade do imóvel é obrigatória',
            'purpose.in' => 'A finalidade do imóvel deve ser venda, aluguel ou ambos',
            'sale_price.numeric' => 'O preço de venda deve ser um número',
            'sale_price.min' => 'O preço de venda não pode ser negativo',
            'sale_price.required_if' => 'O preço de venda é obrigatório quando a finalidade é venda ou ambos',
            'rent_price.numeric' => 'O preço de aluguel deve ser um número',
            'rent_price.min' => 'O preço de aluguel não pode ser negativo',
            'rent_price.required_if' => 'O preço de aluguel é obrigatório quando a finalidade é aluguel ou ambos',
            'address.required' => 'O endereço é obrigatório',
            'address.string' => 'O endereço deve ser um texto',
            'address.max' => 'O endereço não pode ter mais de :max caracteres',
            'address_number.required' => 'O número do endereço é obrigatório',
            'address_number.string' => 'O número do endereço deve ser um texto',
            'address_number.max' => 'O número do endereço não pode ter mais de :max caracteres',
            'neighborhood_id.required' => 'O bairro é obrigatório',
            'neighborhood_id.exists' => 'O bairro selecionado não existe',
            'city_id.required' => 'A cidade é obrigatória',
            'city_id.exists' => 'A cidade selecionada não existe',
            'state.required' => 'O estado é obrigatório',
            'state.string' => 'O estado deve ser um texto',
            'state.size' => 'O estado deve ter exatamente :size caracteres',
            'zip_code.required' => 'O CEP é obrigatório',
            'zip_code.string' => 'O CEP deve ser um texto',
            'zip_code.max' => 'O CEP não pode ter mais de :max caracteres',
            'owner_id.required' => 'O proprietário é obrigatório',
            'owner_id.exists' => 'O proprietário selecionado não existe',
            'agent_id.exists' => 'O corretor selecionado não existe',
            'status.required' => 'O status do imóvel é obrigatório',
            'status.in' => 'O status do imóvel deve ser disponível, vendido, alugado, reservado ou indisponível',
            'code.unique' => 'Este código já está em uso',
            'features.array' => 'As características devem ser fornecidas como um array',
            'features.*.exists' => 'Uma ou mais características selecionadas não existem',
        ];
    }
} 