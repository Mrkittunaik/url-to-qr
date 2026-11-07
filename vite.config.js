import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Set your real domain at build time: SITE_URL=https://yourdomain.com npm run build
// (On Cloudflare Pages: add SITE_URL under Settings → Environment variables.)
function seoPlugin(site) {
  return {
    name: 'seo-files',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', site),
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n` })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source:
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>\n</urlset>\n` })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const site = (process.env.SITE_URL || env.SITE_URL || 'https://url-to-qr.pages.dev').replace(/\/+$/, '')
  return { plugins: [react(), seoPlugin(site)] }
})
