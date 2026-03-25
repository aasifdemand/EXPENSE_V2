import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'image.png'],
      manifest: {
        name: 'Expense V2',
        short_name: 'ExpenseV2',
        description: 'Advanced Expense & Reimbursement Management',
        theme_color: '#7c3aed',
        background_color: '#fdfdfd',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'image.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'image.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'image.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})

