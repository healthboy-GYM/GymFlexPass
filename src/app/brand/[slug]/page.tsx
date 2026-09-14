import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ArrowRight, ArrowLeft, Dumbbell } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ALL_BRANCHES, sortByInfo, type StaticBranch } from '@/lib/branchesStatic';
import { SLUG_TO_BRAND, BRAND_SLUG } from '@/lib/branchBrands';

const SITE = 'https://healthboypass.co.kr';
const MIN_BRANCHES = 2; // 2곳 이상 보유 브랜드만 페이지 생성

const TIER_STYLE: Record<string, { bg: string; fg: string }> = {
  'S-PREMIUM': { bg: '#d32f2f', fg: '#ffffff' },
  PREMIUM: { bg: '#1976d2', fg: '#ffffff' },
  GOLD: { bg: '#ffa000', fg: '#000000' },
  SILVER: { bg: '#757575', fg: '#ffffff' },
  BLACK: { bg: '#212121', fg: '#ffffff' },
};
const tierStyle = (t: string) => TIER_STYLE[(t || '').toUpperCase().replace(/\s+/g, '-')] ?? TIER_STYLE.SILVER;
const regionShort = (r: string) => (r || '').replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, '');

function branchesWithBrand(brand: string): StaticBranch[] {
  return sortByInfo(ALL_BRANCHES.filter((b) => b.brands.includes(brand)));
}

export function generateStaticParams() {
  return Object.entries(SLUG_TO_BRAND)
    .filter(([, brand]) => branchesWithBrand(brand).length >= MIN_BRANCHES)
    .map(([slug]) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = SLUG_TO_BRAND[slug];
  const list = brand ? branchesWithBrand(brand) : [];
  if (!brand || list.length === 0) return { title: '브랜드를 찾을 수 없습니다' };

  const title = `${brand} 보유 헬스보이짐 ${list.length}곳 | 헬보올패스`;
  const description =
    `${brand} 웨이트 머신을 보유한 헬스보이짐 지점 ${list.length}곳. ` +
    `헬보올패스 한 장으로 ${brand} 있는 지점을 포함해 전국 ${ALL_BRANCHES.length}개 지점을 이용하세요.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/brand/${slug}` },
    openGraph: { title, description, type: 'website', locale: 'ko_KR', url: `${SITE}/brand/${slug}`, siteName: '헬보 올패스' },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = SLUG_TO_BRAND[slug];
  const list = brand ? branchesWithBrand(brand) : [];
  if (!brand || list.length < MIN_BRANCHES) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-background border-b border-border/40">
          <div className="container px-4 md:px-6 py-12 md:py-16 max-w-5xl text-center">
            <Button asChild variant="ghost" size="sm" className="mb-4 text-muted-foreground">
              <Link href="/brand"><ArrowLeft className="mr-1.5 h-4 w-4" /> 브랜드 전체</Link>
            </Button>
            <p className="inline-flex items-center gap-1.5 text-sm font-bold tracking-widest text-primary uppercase">
              <Dumbbell className="h-4 w-4" /> 웨이트 브랜드
            </p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black tracking-tight leading-tight text-balance">
              {brand} 보유 헬스보이짐 {list.length}곳
            </h1>
            <p className="mt-3 text-muted-foreground md:text-lg">
              {brand} 머신을 갖춘 지점. 헬보올패스 하나면 전국 {ALL_BRANCHES.length}개 지점 어디서든.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" className="font-bold">
                <Link href="/purchase">헬보올패스 구매하기 <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container px-4 md:px-6 py-10 md:py-14 max-w-5xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((b) => {
              const ts = tierStyle(b.tier);
              return (
                <Link
                  key={b.slug}
                  href={`/branch/${b.slug}`}
                  className="group relative rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/70"
                >
                  <span
                    className="absolute right-4 top-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: ts.bg, color: ts.fg }}
                  >
                    {b.tierLabel}
                  </span>
                  <h2 className="font-bold text-base pr-16">{b.shortName}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{regionShort(b.region)}</p>
                  {b.transport && (
                    <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/80" /> {b.transport}
                    </p>
                  )}
                  {b.brands.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {b.brands.slice(0, 5).map((br) => (
                        <span
                          key={br}
                          className={
                            'rounded-full px-2.5 py-0.5 text-xs ' +
                            (br === brand
                              ? 'bg-primary/15 text-primary font-semibold'
                              : 'bg-secondary text-foreground')
                          }
                        >
                          {br}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
