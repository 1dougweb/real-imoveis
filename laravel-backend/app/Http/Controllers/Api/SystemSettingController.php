<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SystemSettingController extends Controller
{
    /**
     * Canal de log específico para as configurações
     */
    protected function log()
    {
        return Log::channel('settings');
    }

    /**
     * Get all settings
     */
    public function index()
    {
        try {
            // Check if the table exists
            if (!Schema::hasTable('system_settings')) {
                return response()->json(['message' => 'Tabela de configurações não encontrada. Execute as migrações.'], 500);
            }
            
            $settings = SystemSetting::first();
            
            if (!$settings) {
                return $this->createDefaultSettings();
            }
            
            // Convert snake_case to camelCase for frontend
            $response = $this->formatSettingsResponse($settings);

            return response()->json($response);
        } catch (\Exception $e) {
            $this->log()->error('Erro ao obter configurações', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erro ao buscar configurações', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Check migration status
     */
    public function checkMigration()
    {
        try {
            $tableExists = Schema::hasTable('system_settings');
            
            return response()->json([
                'exists' => $tableExists,
                'message' => $tableExists 
                    ? 'Tabela de configurações está disponível.' 
                    : 'Tabela de configurações não foi criada. Execute a migração.'
            ]);
        } catch (\Exception $e) {
            $this->log()->error('Erro ao verificar migração', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erro ao verificar migração', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Run migration for system settings
     */
    public function runMigration()
    {
        try {
            if (Schema::hasTable('system_settings')) {
                return response()->json(['message' => 'Tabela de configurações já existe.']);
            }
            
            // Execute migration for system_settings table
            Artisan::call('migrate', [
                '--path' => 'database/migrations/2024_05_23_create_system_settings_table.php',
                '--force' => true,
            ]);
            
            // Seed the table
            Artisan::call('db:seed', [
                '--class' => 'SystemSettingSeeder',
                '--force' => true,
            ]);
            
            $output = Artisan::output();
            $this->log()->info('Migração de configurações executada', ['output' => $output]);
            
            return response()->json([
                'message' => 'Migração executada com sucesso.',
                'details' => $output
            ]);
        } catch (\Exception $e) {
            $this->log()->error('Erro ao executar migração', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erro ao executar migração', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        DB::beginTransaction();
        
        try {
            // Check if the table exists
            if (!Schema::hasTable('system_settings')) {
                DB::rollBack();
                return response()->json(['message' => 'Tabela de configurações não encontrada. Execute as migrações.'], 500);
            }
            
            $validator = Validator::make($this->convertToCamelCase($request->all()), [
                // SEO
                'metaTitle' => 'nullable|string|max:60',
                'metaDescription' => 'nullable|string|max:160',
                'metaKeywords' => 'nullable|string',
                'ogImage' => 'nullable|string',
                'canonicalUrl' => 'nullable|url',
                'indexFollow' => 'boolean',
                
                // Analytics
                'gtmContainerId' => 'nullable|string|max:20',
                'facebookPixelId' => 'nullable|string|max:20',
                'googleAnalyticsCode' => 'nullable|string',
                
                // SMTP
                'smtpHost' => 'nullable|string|max:255',
                'smtpPort' => 'nullable|integer|between:1,65535',
                'smtpUsername' => 'nullable|string|max:255',
                'smtpPassword' => 'nullable|string|max:255',
                'smtpEncryption' => 'nullable|in:tls,ssl',
                'mailFromAddress' => 'nullable|email',
                'mailFromName' => 'nullable|string|max:255',

                // Company
                'companyName' => 'nullable|string|max:255',
                'companyEmail' => 'nullable|email',
                'companyPhone' => 'nullable|string|max:20',
                'companyAddress' => 'nullable|string|max:255',
                'companyWebsite' => 'nullable|url',

                // Social Media
                'socialInstagram' => 'nullable|string|max:255',
                'socialFacebook' => 'nullable|string|max:255',
                'socialLinkedin' => 'nullable|string|max:255',
                'socialTwitter' => 'nullable|string|max:255',
                'socialYoutube' => 'nullable|string|max:255',

                // Appearance
                'logo' => 'nullable|string',
                'useLogo' => 'boolean',
                'primaryColor' => 'nullable|string|max:7',
            ]);

            if ($validator->fails()) {
                DB::rollBack();
                $this->log()->error('Validação falhou para atualização de configurações', [
                    'errors' => $validator->errors()->toArray(),
                    'input' => $request->all()
                ]);
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Convert camelCase to snake_case from request
            $data = $this->convertToSnakeCase($request->all());

            // Process logo if it's a base64 image
            if (isset($data['logo']) && Str::startsWith($data['logo'], 'data:image')) {
                $logoPath = $this->saveBase64Image($data['logo'], 'logos');
                if ($logoPath) {
                    $data['logo'] = $logoPath;
                }
            }

            // Process OG image if it's a base64 image
            if (isset($data['og_image']) && Str::startsWith($data['og_image'], 'data:image')) {
                $ogImagePath = $this->saveBase64Image($data['og_image'], 'og-images');
                if ($ogImagePath) {
                    $data['og_image'] = $ogImagePath;
                }
            }

            $this->log()->info('Tentando salvar configurações', ['data' => $data]);

            $settings = SystemSetting::firstOrCreate();
            $settings->fill($data);
            $result = $settings->save();

            if (!$result) {
                DB::rollBack();
                $this->log()->error('Falha ao salvar configurações');
                return response()->json(['message' => 'Erro ao salvar as configurações'], 500);
            }

            DB::commit();
            $this->log()->info('Configurações salvas com sucesso', ['settings_id' => $settings->id]);

            // Convert snake_case to camelCase for response
            $response = $this->formatSettingsResponse($settings);

            return response()->json($response);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->log()->error('Erro ao salvar configurações', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erro ao salvar as configurações', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Save base64 image to storage and return the path
     */
    private function saveBase64Image($base64Image, $directory = 'uploads')
    {
        try {
            // Extract image data from base64 string
            $imageData = explode(',', $base64Image);
            
            if (count($imageData) !== 2) {
                $this->log()->error('Formato de imagem base64 inválido');
                return null;
            }
            
            // Get image extension from mime type
            $mime = explode(':', substr($imageData[0], 0, strpos($imageData[0], ';')))[1];
            $extension = $this->getExtensionFromMime($mime);
            
            if (!$extension) {
                $this->log()->error('Tipo de imagem não suportado', ['mime' => $mime]);
                return null;
            }
            
            // Decode base64 image
            $decodedImage = base64_decode($imageData[1]);
            
            if (!$decodedImage) {
                $this->log()->error('Falha ao decodificar imagem base64');
                return null;
            }
            
            // Generate unique filename
            $filename = Str::uuid() . '.' . $extension;
            
            // Store image in storage
            $path = $directory . '/' . $filename;
            Storage::disk('public')->put($path, $decodedImage);
            
            $this->log()->info('Imagem salva com sucesso', ['path' => $path]);
            
            // Return the relative path instead of full URL
            return '/storage/' . $path;
        } catch (\Exception $e) {
            $this->log()->error('Erro ao salvar imagem base64', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }
    
    /**
     * Get file extension from mime type
     */
    private function getExtensionFromMime($mime)
    {
        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/svg+xml' => 'svg',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
        ];
        
        return $mimeMap[$mime] ?? null;
    }

    /**
     * Test SMTP connection
     */
    public function testSmtp(Request $request)
    {
        try {
            $settings = SystemSetting::first();
            
            if (!$settings || !$settings->smtp_host) {
                return response()->json(['message' => 'Configurações SMTP não configuradas'], 422);
            }

            // Configure mail settings
            Config::set('mail.mailers.smtp', [
                'transport' => 'smtp',
                'host' => $settings->smtp_host,
                'port' => $settings->smtp_port,
                'encryption' => $settings->smtp_encryption,
                'username' => $settings->smtp_username,
                'password' => $settings->smtp_password,
            ]);

            Config::set('mail.from', [
                'address' => $settings->mail_from_address,
                'name' => $settings->mail_from_name,
            ]);

            // Send test email
            Mail::raw('Teste de email de ' . config('app.name'), function($message) use ($settings) {
                $message->to($settings->mail_from_address)
                    ->subject('Email de Teste SMTP');
            });

            return response()->json(['message' => 'Teste SMTP realizado com sucesso']);
        } catch (\Exception $e) {
            $this->log()->error('Teste SMTP falhou', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Teste SMTP falhou: ' . $e->getMessage()], 422);
        }
    }

    /**
     * Create default settings and return response
     */
    private function createDefaultSettings()
    {
        try {
            // Create default settings
            $settings = new SystemSetting();
            $settings->meta_title = 'Laranja Real Imóveis';
            $settings->meta_description = 'Sistema de gestão imobiliária da Laranja Real Imóveis';
            $settings->company_name = 'Laranja Real Imóveis';
            $settings->company_email = 'contato@laranjarealimoveis.com.br';
            $settings->index_follow = true;
            $settings->use_logo = true;
            $settings->primary_color = '#ff6b00';
            $settings->save();

            $this->log()->info('Configurações padrão criadas', ['settings_id' => $settings->id]);
            
            return response()->json($this->formatSettingsResponse($settings));
        } catch (\Exception $e) {
            $this->log()->error('Erro ao criar configurações padrão', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Erro ao criar configurações padrão', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format settings response (convert snake_case to camelCase)
     */
    private function formatSettingsResponse($settings)
    {
        return collect($settings)->mapWithKeys(function ($value, $key) {
            return [Str::camel($key) => $value];
        });
    }

    /**
     * Convert request keys from camelCase to snake_case
     */
    private function convertToSnakeCase(array $data)
    {
        return collect($data)->mapWithKeys(function ($value, $key) {
            return [Str::snake($key) => $value];
        })->toArray();
    }

    /**
     * Convert request keys from snake_case to camelCase
     */
    private function convertToCamelCase(array $data)
    {
        return collect($data)->mapWithKeys(function ($value, $key) {
            return [Str::camel($key) => $value];
        })->toArray();
    }
} 