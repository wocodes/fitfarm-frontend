import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeInitializer from "./components/ThemeInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitFarmHQ Gym Portal",
  description: "Member Gym Portal and Digital Gate Access",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var rawTheme = localStorage.getItem('fitcloud_theme_settings');
                  var slug = 'polanfit-fitness';
                  var search = window.location.search || '';
                  var tenantMatch = search.match(/[?&]tenant=([^&]+)/);
                  if (tenantMatch && tenantMatch[1]) {
                    slug = decodeURIComponent(tenantMatch[1]).toLowerCase();
                  } else {
                    var platformDomain = ${JSON.stringify(process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || '')};
                    if (platformDomain) {
                      var host = (window.location.hostname || '').toLowerCase().replace(/:\\d+$/, '').replace(/^www\\./, '');
                      var suffix = '.' + platformDomain;
                      if (host.slice(-suffix.length) === suffix) {
                        var label = host.slice(0, -suffix.length);
                        if (label && label.indexOf('.') === -1) slug = label;
                      }
                    }
                    var storedSlug = localStorage.getItem('fitcloud_member_tenant');
                    if (storedSlug) slug = storedSlug.toLowerCase();
                  }
                  try { localStorage.setItem('fitcloud_member_tenant', slug); } catch (e) {}
                  
                  if (!rawTheme) {
                    var portalCache = localStorage.getItem('fitcloud_portal_info_' + slug);
                    if (portalCache) {
                      var parsedPortal = JSON.parse(portalCache);
                      if (parsedPortal && parsedPortal.theme) {
                        rawTheme = JSON.stringify(parsedPortal.theme);
                      }
                    }
                  }

                  if (rawTheme) {
                    var theme = JSON.parse(rawTheme);
                    var primary = theme.primary_color || '#fa6a2e';
                    var accent = theme.accent_color || '#1e293b';
                    var font = theme.font_family || 'Inter';

                    var hex = primary.replace('#', '');
                    if (hex.length === 3) hex = hex.split('').map(function(c) { return c + c; }).join('');
                    var num = parseInt(hex, 16);
                    var r = (num >> 16) & 255;
                    var g = (num >> 8) & 255;
                    var b = num & 255;
                    var rgb = r + ' ' + g + ' ' + b;

                    var style = document.createElement('style');
                    style.id = 'fitcloud-dynamic-theme';
                    style.textContent = ':root { --brand-primary: ' + primary + ' !important; --brand-primary-rgb: ' + rgb + ' !important; --brand-accent: ' + accent + ' !important; --brand-font: "' + font + '", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; } body, button, input, select, textarea { font-family: var(--brand-font); } .brand-btn-gradient { background: ' + primary + ' !important; box-shadow: 0 10px 25px -5px rgb(' + rgb + ' / 0.3) !important; } .brand-text-gradient { color: ' + primary + ' !important; -webkit-text-fill-color: ' + primary + ' !important; } .bg-orange-500 { background-color: ' + primary + ' !important; } .text-orange-400, .text-orange-500 { color: ' + primary + ' !important; } .border-orange-500 { border-color: ' + primary + ' !important; }';
                    document.head.appendChild(style);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
