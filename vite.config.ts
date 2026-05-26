import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const googleAnalyticsIdPattern = /^G-[A-Z0-9]+$/;

function googleAnalyticsPlugin(): Plugin {
  return {
    name: 'videocalc-google-analytics',
    transformIndexHtml() {
      const measurementId = process.env.VITE_GA_MEASUREMENT_ID;

      if (!measurementId || !googleAnalyticsIdPattern.test(measurementId)) {
        return [];
      }

      return [
        {
          tag: 'script',
          attrs: {
            async: true,
            src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
          },
          injectTo: 'head-prepend',
        },
        {
          tag: 'script',
          children: [
            'window.dataLayer = window.dataLayer || [];',
            'window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);};',
            "window.gtag('consent', 'default', {",
            "  analytics_storage: 'denied',",
            "  ad_storage: 'denied',",
            "  ad_user_data: 'denied',",
            "  ad_personalization: 'denied',",
            "  functionality_storage: 'denied',",
            "  personalization_storage: 'denied',",
            "  security_storage: 'granted',",
            '  wait_for_update: 500',
            '});',
            "window.gtag('js', new Date());",
            `window.gtag('config', '${measurementId}', {`,
            '  send_page_view: false,',
            '  anonymize_ip: true,',
            '  allow_google_signals: false,',
            '  allow_ad_personalization_signals: false',
            '});',
          ].join('\n'),
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), googleAnalyticsPlugin()],
  resolve: {
    alias: {
      '@repo-data': path.resolve(__dirname, 'data'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});