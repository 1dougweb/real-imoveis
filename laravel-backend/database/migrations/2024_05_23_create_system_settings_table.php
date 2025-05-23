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
        Schema::table('system_settings', function (Blueprint $table) {
            // Update column lengths and defaults if needed
            $table->string('meta_title', 60)->nullable()->change();
            $table->string('meta_description', 160)->nullable()->change();
            
            // Add any new columns that don't exist in the original migration
            if (!Schema::hasColumn('system_settings', 'some_new_column')) {
                // $table->string('some_new_column')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('system_settings', function (Blueprint $table) {
            // Revert changes if needed
            $table->string('meta_title')->nullable()->change();
            $table->text('meta_description')->nullable()->change();
            
            // Drop any columns added in this migration
            // $table->dropColumn('some_new_column');
        });
    }
}; 