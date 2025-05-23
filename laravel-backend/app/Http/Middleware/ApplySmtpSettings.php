<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;

class ApplySmtpSettings
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Get settings from database
        $settings = SystemSetting::first();

        if ($settings && $settings->smtp_host) {
            // Configure SMTP settings
            Config::set('mail.mailers.smtp', [
                'transport' => 'smtp',
                'host' => $settings->smtp_host,
                'port' => $settings->smtp_port,
                'encryption' => $settings->smtp_encryption,
                'username' => $settings->smtp_username,
                'password' => $settings->smtp_password,
            ]);

            // Configure mail from
            if ($settings->mail_from_address) {
                Config::set('mail.from', [
                    'address' => $settings->mail_from_address,
                    'name' => $settings->mail_from_name ?? config('app.name'),
                ]);
            }
        }

        return $next($request);
    }
} 