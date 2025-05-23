<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_number', 20)->unique();
            $table->string('type', 20); // venda, aluguel, proposta
            $table->foreignId('property_id')->constrained();
            $table->unsignedBigInteger('owner_id');
            $table->foreign('owner_id')->references('id')->on('people');
            $table->unsignedBigInteger('client_id');
            $table->foreign('client_id')->references('id')->on('people');
            $table->unsignedBigInteger('agent_id')->nullable();
            $table->foreign('agent_id')->references('id')->on('people');
            $table->decimal('value', 12, 2); // Valor do contrato
            $table->decimal('commission_rate', 5, 2)->nullable(); // Percentual de comissão
            $table->decimal('commission_value', 12, 2)->nullable(); // Valor da comissão
            $table->date('start_date');
            $table->date('end_date')->nullable(); // Para contratos de aluguel
            $table->text('terms')->nullable(); // Termos e condições
            $table->string('status', 20)->default('pending'); // pending, approved, signed, active, completed, cancelled
            $table->date('signed_at')->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->text('payment_terms')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
}; 