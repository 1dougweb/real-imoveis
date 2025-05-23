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
        Schema::create('people', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('type', 20); // cliente, corretor, vendedor, locador, locatário, comprador, funcionário
            $table->string('document_type', 10)->nullable(); // CPF ou CNPJ
            $table->string('document', 20)->nullable()->unique();
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('mobile', 20)->nullable();
            $table->date('birthdate')->nullable();
            $table->string('address', 200)->nullable();
            $table->string('address_number', 20)->nullable();
            $table->string('address_complement', 50)->nullable();
            $table->foreignId('neighborhood_id')->nullable()->constrained();
            $table->unsignedBigInteger('city_id')->nullable();
            $table->string('state', 2)->nullable();
            $table->string('zip_code', 9)->nullable();
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
        Schema::dropIfExists('people');
    }
}; 