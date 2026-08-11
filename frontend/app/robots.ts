import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/orders', '/wallet', '/admin', '/purchases'],
    },
    sitemap: 'https://joshseclogs.com/sitemap.xml',
  }
}