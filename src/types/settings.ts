export interface SystemSettings {
  // SEO Settings
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  canonicalUrl: string;
  indexFollow: boolean;
  
  // Analytics Settings
  gtmContainerId: string;
  facebookPixelId: string;
  googleAnalyticsCode: string;
  
  // SMTP Settings
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: string;
  mailFromAddress: string;
  mailFromName: string;

  // Existing settings
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  socialInstagram: string;
  socialFacebook: string;
  socialLinkedin: string;
  socialTwitter: string;
  socialYoutube: string;
  logo: string;
  useLogo: boolean;
  primaryColor: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoOgImage: string;
} 