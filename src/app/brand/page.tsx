import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Dumbbell } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ALL_BRANCHES } from '@/lib/branchesStatic';
import { BRAND_SLUG } from '@/lib/branchBrands';

const SITE = 'https://healthboypass.co.kr';
const MIN_BRANCHES = 2;

export const metadata: Metadata = {
  title: '웨이트 브랜드로 헬스장 찾기 | 헬스보이짐 헬보올패스',
  description:
    '파나타·해머스트렝스·테크노짐·사이벡스 등 원하는 웨이트 브랜드를 보유한 헬스보이짐 지점을 브랜드별로 찾아보세요. 헬보올패스 한 장으로 전국 이용.',
  alternates: { canonical: `${SITE}/brand` },
  openGraph: {
    title: '웨이트 브랜드로 헬스장 찾기 | 헬보올패스',
    description: '원하는 웨이트 브랜드를 보유한 헬스보이짐 지점을 브랜드별로 찾기.',
    type: 'website',
    locale: 'ko_KR',
    url: `${SITE}/brand`,
    siteName: '헬보 올패스',
  },
};

function brandCounts(): { name: string; slug: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const b of ALL_BRANCHES) for (const br of b.brands) counts.set(br, (counts.get(br) ?? 0) + 1);
  return Object.entries(BRAND_SLUG)
    .map(([name, slug]) => ({ name, slug, count: counts.get(name) ?? 0 }))
    .filter((x) => x.count >= MIN_BRANCHES)
    .sort((a, b) => b.count - a.count);
}

export default function BrandIndexPage() {
  const brands = brandCounts();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-background border-b border-border/40">
          <div className="container px-4 md:px-6 py-12 md:py-16 max-w-5xl text-center">
            <Button asChild variant="ghost" size="sm" className="mb-4 text-muted-foreground">
              <Link href="/branch-locator"><ArrowLeft className="mr-1.5 h-4 w-4" /> 전체 지점 지도</Link>
            </Button>
            <p className="inline-flex items-center gap-1.5 text-sm font-bold tracking-widest text-primary uppercase">
              <Dumbbell className="h-4 w-4" /> 웨이트 브랜드
            </p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black tracking-tight leading-tight text-balance">
              원하는 브랜드로 헬스장 찾기
            </h1>
            <p className="mt-3 text-muted-foreground md:text-lg">
              보유한 웨이트 머신 브랜드로 헬스보이짐 지점을 찾아보세요.
            </p>
          </div>
        </section>

        <section className="container px-4 md:px-6 py-10 md:py-14 max-w-4xl">
          <div className="flex flex-wrap gap-2.5">
            {brands.map((b) => (
              <Link
                key={b.slug}
                href={`/brand/${b.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                {b.name}
                <span className="text-xs text-muted-foreground">{b.count}곳</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
