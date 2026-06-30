import type { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${BASE_URL}/schedule`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/standings`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/scorers`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/bracket`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.85,
    },
  ]
}
