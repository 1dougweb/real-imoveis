<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\Person;
use App\Models\Contract;
use App\Models\BankAccount;
use App\Models\PaymentType;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['receivable', 'payable']);
        $status = $this->faker->randomElement(['pending', 'paid', 'cancelled']);
        $category = $this->faker->randomElement(['rent', 'sale', 'commission', 'maintenance', 'tax', 'other']);
        $dueDate = $this->faker->dateTimeBetween('-6 months', '+6 months');
        $paymentDate = $status === 'paid' ? $this->faker->dateTimeBetween($dueDate, 'now') : null;

        return [
            'type' => $type,
            'description' => $this->faker->sentence(),
            'amount' => $this->faker->randomFloat(2, 100, 10000),
            'due_date' => $dueDate,
            'payment_date' => $paymentDate,
            'status' => $status,
            'category' => $category,
            'person_id' => Person::factory(),
            'contract_id' => $category === 'rent' || $category === 'sale' ? Contract::factory() : null,
            'bank_account_id' => BankAccount::factory(),
            'payment_type_id' => $status === 'paid' ? PaymentType::factory() : null,
            'property_id' => $category === 'rent' || $category === 'sale' ? Property::factory() : null,
            'notes' => $this->faker->optional(0.7)->paragraph(),
        ];
    }

    /**
     * Estado para transações a receber
     */
    public function receivable(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'receivable',
        ]);
    }

    /**
     * Estado para transações a pagar
     */
    public function payable(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'payable',
        ]);
    }

    /**
     * Estado para transações pendentes
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'payment_date' => null,
            'payment_type_id' => null,
        ]);
    }

    /**
     * Estado para transações pagas
     */
    public function paid(): static
    {
        return $this->state(function (array $attributes) {
            $dueDate = $attributes['due_date'] ?? now();
            return [
                'status' => 'paid',
                'payment_date' => $this->faker->dateTimeBetween($dueDate, 'now'),
                'payment_type_id' => PaymentType::factory(),
            ];
        });
    }

    /**
     * Estado para transações canceladas
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'payment_date' => null,
            'payment_type_id' => null,
        ]);
    }

    /**
     * Estado para transações de aluguel
     */
    public function rent(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'rent',
            'contract_id' => Contract::factory(),
            'property_id' => Property::factory(),
        ]);
    }

    /**
     * Estado para transações de venda
     */
    public function sale(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'sale',
            'contract_id' => Contract::factory(),
            'property_id' => Property::factory(),
        ]);
    }

    /**
     * Estado para transações de comissão
     */
    public function commission(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'commission',
            'contract_id' => Contract::factory(),
        ]);
    }

    /**
     * Estado para transações de manutenção
     */
    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'maintenance',
            'property_id' => Property::factory(),
        ]);
    }

    /**
     * Estado para transações de impostos
     */
    public function tax(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'tax',
        ]);
    }

    /**
     * Estado para transações vencidas
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'due_date' => $this->faker->dateTimeBetween('-6 months', '-1 day'),
            'payment_date' => null,
            'payment_type_id' => null,
        ]);
    }

    /**
     * Estado para transações do mês atual
     */
    public function thisMonth(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => $this->faker->dateTimeBetween('first day of this month', 'last day of this month'),
        ]);
    }

    /**
     * Estado para transações do próximo mês
     */
    public function nextMonth(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => $this->faker->dateTimeBetween('first day of next month', 'last day of next month'),
        ]);
    }
} 