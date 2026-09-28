import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { RegionTierExplorer } from '@/components/sections/RegionTierExplorer';
import { ALL_BRANCHES, getBranchesByRegionSlug, sortByInfo } from '@/lib/branchesStatic';
import { REGION_NAME, REGION_SLUG } from '@/lib/branchMeta';

const SITE = 'https://healthboypass.co.kr';

function regionShort(region: string) {
  return (region || '').replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, '');
}

export function generateStaticParams() {
  // 지점이 1개 이상 있는 지역만 생성
  const present = new Set(ALL_BRANCHES.map((b) => b.regionSlug));
  return Object.values(REGION_SLUG)
    .filter((slug) => present.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const region = REGION_NAME[slug];
  const branches = getBranchesByRegionSlug(slug);
  if (!region || branches.length === 0) return { title: '지역을 찾을 수 없습니다' };

  const short = regionShort(region);
  const title = `${short} 헬스장 ${branches.length}곳 | 헬스보이짐 헬보올패스`;
  const description =
    `${region} 헬스보이짐 ${branches.length}개 지점을 한눈에. ` +
    `한 지점 가격으로 전국 ${ALL_BRANCHES.length}개 헬스보이짐을 자유롭게 이용하는 헬보올패스.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/area/${slug}` },
    openGraph: { title, description, type: 'website', locale: 'ko_KR', url: `${SITE}/area/${slug}`, siteName: '헬보 올패스' },
  };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const region = REGION_NAME[slug];
  const branches = sortByInfo(getBranchesByRegionSlug(slug));
  if (!region || branches.length === 0) notFound();

  const short = regionShort(region);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* 히어로 */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-background border-b border-border/40">
          <div className="container px-4 md:px-6 py-12 md:py-16 max-w-5xl text-center">
            <Button asChild variant="ghost" size="sm" className="mb-4 text-muted-foreground">
              <Link href="/branch-locator"><ArrowLeft className="mr-1.5 h-4 w-4" /> 전체 지점 지도</Link>
            </Button>
            <p className="text-sm font-bold tracking-widest text-primary uppercase">헬보올패스 · {region}</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black tracking-tight leading-tight text-balance">
              이 지점 가격으로 전국 {ALL_BRANCHES.length}개 자유이용
            </h1>
            <p className="mt-3 text-muted-foreground md:text-lg">
              {short} 어느 지점에 등록해도, 헬보올패스 하나로 전국 헬스보이짐 어디서든.
            </p>
            <div className="mx-auto mt-6 grid max-w-md grid-cols-3 overflow-hidden rounded-xl border border-border/60">
              <div className="bg-card p-4">
                <div className="text-2xl font-black">{branches.length}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{short} 지점</div>
              </div>
              <div className="bg-card p-4 border-x border-border/60">
                <div className="text-2xl font-black">5</div>
                <div className="text-xs text-muted-foreground mt-0.5">이용 등급</div>
              </div>
              <div className="bg-card p-4">
                <div className="text-2xl font-black">{ALL_BRANCHES.length}</div>
                <div className="text-xs text-muted-foreground mt-0.5">전국 지점</div>
              </div>
            </div>
            <div className="mt-6">
              <Button asChild size="lg" className="font-bold">
                <Link href="/purchase">헬보올패스 구매하기 <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 지점 목록 + 등급별 이용 가능 탐색 */}
        <section className="container px-4 md:px-6 py-10 md:py-14 max-w-5xl">
          <RegionTierExplorer
            regionShort={short}
            regionName={region}
            branches={branches.map((b) => ({
              shortName: b.shortName,
              slug: b.slug,
              tier: b.tier,
              tierLabel: b.tierLabel,
              transport: b.transport,
              facilities: b.facilities,
              info: b.info,
            }))}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
