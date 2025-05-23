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
        Schema::table('cities', function (Blueprint $table) {
            // Drop old columns if they exist
            if (Schema::hasColumn('cities', 'state')) {
                $table->dropColumn('state');
            }
            
            if (Schema::hasColumn('cities', 'state_name')) {
                $table->dropColumn('state_name');
            }
            
            // Add new columns
            $table->foreignId('state_id')->after('name')->nullable()->constrained('states');
            
            // Check if softDeletes column exists, if not add it
            if (!Schema::hasColumn('cities', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cities', function (Blueprint $table) {
            if (Schema::hasColumn('cities', 'state_id')) {
                $table->dropForeign(['state_id']);
                $table->dropColumn('state_id');
            }
            
            $table->string('state', 2)->after('name');
            
            if (!Schema::hasColumn('cities', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
