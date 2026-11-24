import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'VoiceForge - AI Voice Cloning',
        short_name: 'VoiceForge',
        description: 'تحويل واستنساخ الأصوات بالذكاء الاصطناعي عبر Google Colab',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#6366f1',
        background_color: '#0f172a',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.trycloudflare\.com\//,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /^https:\/\/.*\.ngrok-free\.app\//,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
  server: { host: true, port: 5173, allowedHosts: true }
});
