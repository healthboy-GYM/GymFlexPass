import { MetadataRoute } from 'next';
import { ALL_BRANCHES } from '@/lib/branchesStatic';
import { REGION_SLUG } from '@/lib/branchMeta';
import { BRAND_SLUG } from '@/lib/branchBrands';

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

  // 지역 랜딩 (/area/[slug]) — 지점이 있는 지역만
  const presentRegions = new Set(ALL_BRANCHES.map((b) => b.regionSlug));
  const areaEntries: MetadataRoute.Sitemap = Object.values(REGION_SLUG)
    .filter((slug) => presentRegions.has(slug))
    .map((slug) => ({
      url: `${baseUrl}/area/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // 지점 랜딩 (/branch/[slug])
  const branchEntries: MetadataRoute.Sitemap = ALL_BRANCHES.map((b) => ({
    url: `${baseUrl}/branch/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 브랜드별 페이지 (/brand, /brand/[slug]) — 2곳 이상 보유 브랜드만
  const brandCounts = new Map<string, number>();
  for (const b of ALL_BRANCHES) for (const br of b.brands) brandCounts.set(br, (brandCounts.get(br) ?? 0) + 1);
  const brandEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/brand`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ...Object.entries(BRAND_SLUG)
      .filter(([name]) => (brandCounts.get(name) ?? 0) >= 2)
      .map(([, slug]) => ({
        url: `${baseUrl}/brand/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
  ];

  return [...sitemapEntries, ...areaEntries, ...branchEntries, ...brandEntries];
}
