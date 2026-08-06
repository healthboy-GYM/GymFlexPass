import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://healthboypass.co.kr';

  const staticPages = [
    '/',
    '/body-challenge',
    '/branch-locator',
    '/brand-story',
    '/checkin-guide',
    '/coupon-manager',
    '/faq',
    '/helbo-pass',
    '/how-to-use',
    '/payment-history-guide',
    '/promo/black-friday',
    '/promo/quit-smoking',
    '/promo/new-year',
    '/promo/march',
    '/purchase',
    '/qr-entry-guide',
    '/register',
    '/tier-guide',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '/' ? 1.0 : 0.8,
  }));

  return sitemapEntries;
}
