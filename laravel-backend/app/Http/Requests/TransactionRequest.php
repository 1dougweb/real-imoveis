<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransactionRequest extends FormRequest
{
    public function authorize()
    {
        return true; // A autorização já é feita no middleware do controller
    }

    public function rules()
    {
        $rules = [
            'type' => ['required', Rule::in(['receivable', 'payable'])],
            'description' => ['required', 'string', 'min:3', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'due_date' => ['required', 'date'],
            'payment_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['pending', 'paid', 'cancelled'])],
            'category' => ['required', Rule::in(['rent', 'sale', 'commission', 'maintenance', 'tax', 'other'])],
            'person_id' => ['nullable', 'exists:people,id'],
            'contract_id' => ['nullable', 'exists:contracts,id'],
            'bank_account_id' => ['nullable', 'exists:bank_accounts,id'],
            'payment_type_id' => ['nullable', 'exists:payment_types,id'],
            'property_id' => ['nullable', 'exists:properties,id'],
            'notes' => ['nullable', 'string'],
            'receipt' => ['nullable', 'file', 'mimes:jpeg,png,pdf', 'max:5120'], // 5MB max
        ];

        // Validações adicionais baseadas no tipo de transação
        if ($this->input('category') === 'rent' || $this->input('category') === 'sale') {
            $rules['property_id'] = ['required', 'exists:properties,id'];
            $rules['contract_id'] = ['required', 'exists:contracts,id'];
        }

        if ($this->input('category') === 'commission') {
            $rules['person_id'] = ['required', 'exists:people,id'];
            $rules['contract_id'] = ['required', 'exists:contracts,id'];
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'type.required' => 'O tipo da transação é obrigatório',
            'type.in' => 'O tipo da transação deve ser "receivable" ou "payable"',
            'description.required' => 'A descrição é obrigatória',
            'description.min' => 'A descrição deve ter no mínimo 3 caracteres',
            'amount.required' => 'O valor é obrigatório',
            'amount.numeric' => 'O valor deve ser um número',
            'amount.min' => 'O valor deve ser maior que zero',
            'due_date.required' => 'A data de vencimento é obrigatória',
            'due_date.date' => 'A data de vencimento deve ser uma data válida',
            'payment_date.date' => 'A data de pagamento deve ser uma data válida',
            'status.required' => 'O status é obrigatório',
            'status.in' => 'O status deve ser "pending", "paid" ou "cancelled"',
            'category.required' => 'A categoria é obrigatória',
            'category.in' => 'Categoria inválida',
            'person_id.exists' => 'Pessoa não encontrada',
            'contract_id.exists' => 'Contrato não encontrado',
            'bank_account_id.exists' => 'Conta bancária não encontrada',
            'payment_type_id.exists' => 'Tipo de pagamento não encontrado',
            'property_id.exists' => 'Imóvel não encontrado',
            'property_id.required' => 'O imóvel é obrigatório para aluguéis e vendas',
            'contract_id.required' => 'O contrato é obrigatório para aluguéis, vendas e comissões',
            'person_id.required' => 'A pessoa é obrigatória para comissões',
            'receipt.file' => 'O comprovante deve ser um arquivo',
            'receipt.mimes' => 'O comprovante deve ser uma imagem (jpeg, png) ou PDF',
            'receipt.max' => 'O comprovante não pode ter mais que 5MB',
        ];
    }
} 