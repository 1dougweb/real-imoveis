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
        // Tabela de tipos de comissão
        Schema::create('commission_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('percentage', 5, 2)->default(0.00); // Porcentagem padrão
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabela de comissões
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('person_id'); // Changed to unsignedBigInteger without foreign key constraint
            $table->unsignedBigInteger('contract_id'); // Changed to unsignedBigInteger without foreign key constraint
            $table->foreignId('commission_type_id')->constrained()->onDelete('restrict');
            $table->decimal('amount', 12, 2); // Valor da comissão
            $table->decimal('percentage', 5, 2)->nullable(); // Porcentagem aplicada
            $table->string('status')->default('pending'); // pending, approved, paid, cancelled
            $table->timestamp('paid_at')->nullable(); // Data de pagamento
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions');
        Schema::dropIfExists('commission_types');
    }
}; 