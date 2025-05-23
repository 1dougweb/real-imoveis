<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default system settings if they don't exist
        SystemSetting::firstOrCreate([], [
            // SEO Settings
            'meta_title' => 'Laranja Real Imóveis',
            'meta_description' => 'Sistema de gestão imobiliária da Laranja Real Imóveis',
            'meta_keywords' => 'imóveis, compra, venda, locação, apartamentos, casas',
            'og_image' => null,
            'canonical_url' => null,
            'index_follow' => true,
            
            // Analytics Settings
            'gtm_container_id' => null,
            'facebook_pixel_id' => null,
            'google_analytics_code' => null,
            
            // SMTP Settings
            'smtp_host' => null,
            'smtp_port' => 587,
            'smtp_username' => null,
            'smtp_password' => null,
            'smtp_encryption' => 'tls',
            'mail_from_address' => 'contato@laranjarealimoveis.com.br',
            'mail_from_name' => 'Laranja Real Imóveis',

            // Company Settings
            'company_name' => 'Laranja Real Imóveis',
            'company_email' => 'contato@laranjarealimoveis.com.br',
            'company_phone' => '(00) 00000-0000',
            'company_address' => 'Rua Exemplo, 123 - Centro',
            'company_website' => 'https://laranjarealimoveis.com.br',

            // Social Media Settings
            'social_instagram' => '@laranjarealimoveis',
            'social_facebook' => 'laranjarealimoveis',
            'social_linkedin' => 'laranja-real-imoveis',
            'social_twitter' => '@laranjaimoveis',
            'social_youtube' => '@laranjarealimoveis',

            // Appearance Settings
            'logo' => null,
            'use_logo' => true,
            'primary_color' => '#ff6b00',
        ]);

        $this->command->info('Default system settings created successfully!');
    }
} 