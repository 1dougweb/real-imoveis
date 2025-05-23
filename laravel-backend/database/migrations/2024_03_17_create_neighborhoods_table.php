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
        Schema::create('neighborhoods', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 120);
            $table->unsignedBigInteger('city_id');
            $table->boolean('active')->default(true);
            $table->string('zip_code', 9)->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Um bairro deve ser único por cidade
            $table->unique(['name', 'city_id']);
            $table->unique(['slug', 'city_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('neighborhoods');
    }
}; 