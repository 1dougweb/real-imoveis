import { useSettings } from '@/lib/contexts/SettingsContext';
import { useEffect } from 'react';

export const Analytics = () => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    // Google Tag Manager
    if (settings.gtmContainerId) {
      const gtmScript = document.createElement('script');
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.gtmContainerId}');
      `;
      document.head.appendChild(gtmScript);
    }

    // Facebook Pixel
    if (settings.facebookPixelId) {
      const fbScript = document.createElement('script');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    // Google Analytics
    if (settings.googleAnalyticsCode) {
      const gaScript = document.createElement('script');
      gaScript.innerHTML = settings.googleAnalyticsCode;
      document.head.appendChild(gaScript);
    }

    // Cleanup function
    return () => {
      // Remove scripts when component unmounts
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (
          script.innerHTML.includes('gtm.start') ||
          script.innerHTML.includes('fbq') ||
          script.innerHTML.includes(settings.googleAnalyticsCode || '')
        ) {
          script.remove();
        }
      });
    };
  }, [settings]);

  if (!settings) return null;

  return (
    <>
      {/* Google Tag Manager (noscript) */}
      {settings.gtmContainerId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${settings.gtmContainerId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      )}
    </>
  );
}; 