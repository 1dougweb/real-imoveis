<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            // First, drop the existing columns if they exist
            $table->dropColumn(['name', 'description', 'is_active', 'created_at', 'updated_at', 'deleted_at']);
        });

        Schema::table('roles', function (Blueprint $table) {
            // Then recreate them with the correct structure
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn(['name', 'description', 'is_active', 'deleted_at']);
        });
    }
}; 