import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';
import initialProjects from '@/data/projects.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const currentDate = new Date();

  // Extract showcase project images for Google Image search indexing
  const projectImages = (initialProjects || [])
    .map((p) => p.image)
    .filter(Boolean)
    .map((img) => (img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`));

  const allImages = [
    `${baseUrl}/assets/favicon.png`,
    ...projectImages,
  ];

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
      images: allImages,
    },
  ];
}
