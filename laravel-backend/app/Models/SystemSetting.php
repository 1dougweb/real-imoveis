<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        // SEO Settings
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_image',
        'canonical_url',
        'index_follow',
        
        // Analytics Settings
        'gtm_container_id',
        'facebook_pixel_id',
        'google_analytics_code',
        
        // SMTP Settings
        'smtp_host',
        'smtp_port',
        'smtp_username',
        'smtp_password',
        'smtp_encryption',
        'mail_from_address',
        'mail_from_name',

        // Company Settings
        'company_name',
        'company_email',
        'company_phone',
        'company_address',
        'company_website',

        // Social Media Settings
        'social_instagram',
        'social_facebook',
        'social_linkedin',
        'social_twitter',
        'social_youtube',

        // Appearance Settings
        'logo',
        'use_logo',
        'primary_color',
    ];

    protected $casts = [
        'index_follow' => 'boolean',
        'smtp_port' => 'integer',
        'use_logo' => 'boolean',
    ];

    /**
     * Get settings as config array
     */
    public function toConfig(): array
    {
        return [
            'seo' => [
                'title' => $this->meta_title,
                'description' => $this->meta_description,
                'keywords' => $this->meta_keywords,
                'og_image' => $this->og_image,
                'canonical_url' => $this->canonical_url,
                'index_follow' => $this->index_follow,
            ],
            'analytics' => [
                'gtm_container_id' => $this->gtm_container_id,
                'facebook_pixel_id' => $this->facebook_pixel_id,
                'google_analytics_code' => $this->google_analytics_code,
            ],
            'mail' => [
                'host' => $this->smtp_host,
                'port' => $this->smtp_port,
                'username' => $this->smtp_username,
                'password' => $this->smtp_password,
                'encryption' => $this->smtp_encryption,
                'from' => [
                    'address' => $this->mail_from_address,
                    'name' => $this->mail_from_name,
                ],
            ],
            'company' => [
                'name' => $this->company_name,
                'email' => $this->company_email,
                'phone' => $this->company_phone,
                'address' => $this->company_address,
                'website' => $this->company_website,
            ],
            'social' => [
                'instagram' => $this->social_instagram,
                'facebook' => $this->social_facebook,
                'linkedin' => $this->social_linkedin,
                'twitter' => $this->social_twitter,
                'youtube' => $this->social_youtube,
            ],
            'appearance' => [
                'logo' => $this->logo,
                'use_logo' => $this->use_logo,
                'primary_color' => $this->primary_color,
            ],
        ];
    }
} 