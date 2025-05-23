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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique(); // Código do imóvel
            $table->string('title', 200);
            $table->string('slug', 250)->unique();
            $table->text('description')->nullable();
            $table->foreignId('property_type_id')->constrained();
            $table->string('purpose', 20); // sale, rent, both
            $table->decimal('sale_price', 12, 2)->nullable();
            $table->decimal('rent_price', 12, 2)->nullable();
            $table->decimal('condominium_fee', 12, 2)->nullable();
            $table->decimal('iptu', 12, 2)->nullable(); // Imposto territorial
            
            // Localização
            $table->string('address', 200);
            $table->string('address_number', 20)->nullable();
            $table->string('address_complement', 50)->nullable();
            $table->foreignId('neighborhood_id')->constrained();
            $table->unsignedBigInteger('city_id'); // Changed to unsignedBigInteger
            $table->string('state', 2);
            $table->string('zip_code', 9)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Características físicas
            $table->integer('bedrooms')->nullable()->default(0);
            $table->integer('bathrooms')->nullable()->default(0);
            $table->integer('suites')->nullable()->default(0);
            $table->integer('parking_spaces')->nullable()->default(0);
            $table->decimal('area', 10, 2)->nullable(); // Área útil
            $table->decimal('total_area', 10, 2)->nullable(); // Área total
            $table->integer('floor')->nullable(); // Andar (para apartamentos)
            $table->boolean('furnished')->default(false); // Mobiliado
            $table->string('facing', 50)->nullable(); // Norte, Sul, Leste, Oeste
            
            // Proprietário e status
            $table->unsignedBigInteger('owner_id'); 
            $table->foreign('owner_id')->references('id')->on('people');
            $table->unsignedBigInteger('agent_id')->nullable();
            $table->foreign('agent_id')->references('id')->on('people');
            $table->string('status', 20)->default('available'); // available, sold, rented, reserved, unavailable
            $table->date('available_from')->nullable();
            $table->date('available_until')->nullable();
            
            // SEO e destaque
            $table->boolean('featured')->default(false);
            $table->string('meta_title', 100)->nullable();
            $table->string('meta_description', 255)->nullable();
            $table->string('meta_keywords', 150)->nullable();
            
            // Estatísticas
            $table->integer('views')->default(0);
            $table->integer('favorites')->default(0);
            
            // Controle
            $table->boolean('active')->default(true);
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
        Schema::dropIfExists('properties');
    }
}; 