import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Fills the site URL into index.html (canonical, Open Graph, structured data).
// Change the default below if you move to a custom domain, or set SITE_URL in Cloudflare Pages.
// robots.txt and sitemap.xml are plain files in /public (edit the URL inside them too).
function seoPlugin(site) {
  return {
    name: 'seo-site-url',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', site)
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const site = (process.env.SITE_URL || env.SITE_URL || 'https://url-to-qr-a65.pages.dev').replace(/\/+$/, '')
  return { plugins: [react(), seoPlugin(site)] }
})
