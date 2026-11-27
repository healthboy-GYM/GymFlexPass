import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, Clock, Car, ArrowRight, ArrowLeft, ExternalLink, CheckCircle2, Info } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { BranchDroneVideo } from '@/components/sections/BranchDroneVideo';
import {
  ALL_BRANCHES,
  getBranchBySlug,
  getBranchesByRegionSlug,
  parkingLabel,
  brandPageSlug,
  type StaticBranch,
} from '@/lib/branchesStatic';

const SITE = 'https://healthboypass.co.kr';

const TIER_STYLE: Record<string, { bg: string; fg: string }> = {
  'S-PREMIUM': { bg: '#d32f2f', fg: '#ffffff' },
  PREMIUM: { bg: '#1976d2', fg: '#ffffff' },
  GOLD: { bg: '#ffa000', fg: '#000000' },
  SILVER: { bg: '#757575', fg: '#ffffff' },
  BLACK: { bg: '#212121', fg: '#ffffff' },
};
function tierStyle(tier: string) {
  return TIER_STYLE[(tier || '').toUpperCase().replace(/\s+/g, '-')] ?? TIER_STYLE.SILVER;
}

export function generateStaticParams() {
  return ALL_BRANCHES.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = getBranchBySlug(slug);
  if (!b) return { title: '지점을 찾을 수 없습니다' };

  const regionShort = (b.region || '').replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, '');
  const facil = b.facilities.slice(0, 4).join(', ');
  const title = `헬스보이짐 ${b.shortName} | ${regionShort} 헬스장 · 헬보올패스`;
  const description =
    `${b.address}. ${b.transport ? b.transport + '. ' : ''}` +
    `${facil ? facil + ' 이용 가능. ' : ''}` +
    `${b.brands.length ? b.brands.slice(0, 4).join('·') + ' 등 프리미엄 웨이트 머신 보유. ' : ''}` +
    `헬보올패스 ${b.tierLabel} 등급이면 이 지점 가격으로 전국 ${ALL_BRANCHES.length}개 헬스보이짐을 자유롭게 이용하세요.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/branch/${b.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
      url: `${SITE}/branch/${b.slug}`,
      siteName: '헬보 올패스',
      images: b.photo ? [{ url: `${SITE}${b.photo}` }] : undefined,
    },
  };
}

function jsonLd(b: StaticBranch) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ExerciseGym',
    name: `헬스보이짐 ${b.shortName}`,
    address: { '@type': 'PostalAddress', streetAddress: b.address, addressRegion: b.region, addressCountry: 'KR' },
    ...(b.phone ? { telephone: b.phone } : {}),
    ...(b.lat && b.lng ? { geo: { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng } } : {}),
    url: `${SITE}/branch/${b.slug}`,
    ...(b.naverPlaceUrl ? { sameAs: [b.naverPlaceUrl] } : {}),
    brand: { '@type': 'Brand', name: '헬스보이짐' },
  };
}

export default async function BranchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = getBranchBySlug(slug);
  if (!b) notFound();

  const ts = tierStyle(b.tier);
  const hoursShort = (b.hours || '').split('|')[0]?.trim();
  const siblings = getBranchesByRegionSlug(b.regionSlug).filter((x) => x.slug !== b.slug);
  const regionShort = (b.region || '').replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, '');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(b)) }} />
      <main className="flex-grow">
        {/* 히어로 (지점 사진 배경 + 오버레이) */}
        <section className="relative overflow-hidden border-b border-border/40 min-h-[300px] md:min-h-[380px] flex items-end">
          <div aria-hidden className="absolute inset-0">
            {b.photo ? (
              <img src={b.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-secondary to-background" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/40" />
          </div>
          <div className="relative container px-4 md:px-6 py-8 md:py-12 max-w-5xl text-white">
            <Button asChild variant="ghost" size="sm" className="mb-5 -ml-2 text-white/85 hover:text-white hover:bg-white/10">
              <Link href={`/area/${b.regionSlug}`}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> {regionShort} 지점 전체
              </Link>
            </Button>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: ts.bg, color: ts.fg }}
              >
                {b.tierLabel}
              </span>
              {b.info === 'low' && (
                <span className="inline-flex items-center gap-1 rounded-md border border-white/25 bg-white/10 px-2.5 py-1 text-xs text-white/90">
                  <Info className="h-3 w-3" /> 정보 업데이트 예정
                </span>
              )}
            </div>
            <h1
              className="text-3xl md:text-5xl font-black tracking-tight leading-tight"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            >
              헬스보이짐 {b.shortName}
            </h1>
            <a
              href={`https://map.naver.com/p/search/${encodeURIComponent('헬스보이짐 ' + b.shortName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-start gap-1.5 text-white/90 md:text-lg hover:text-white hover:underline underline-offset-4 decoration-white/50"
            >
              <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
              <span>
                {b.address}
                <span className="ml-1.5 whitespace-nowrap text-xs text-white/70 align-middle">· 네이버 지도에서 보기</span>
              </span>
            </a>
          </div>
        </section>

        {/* 본문 */}
        <section className="container px-4 md:px-6 py-10 md:py-14 max-w-5xl grid gap-6 md:grid-cols-3">
          {/* 왼쪽: 정보 */}
          <div className="md:col-span-2 space-y-6">
            {(b.intro || b.size || b.floor || b.opened) && (
              <div>
                {b.intro && (
                  <p className="text-base md:text-lg leading-relaxed text-foreground/90">{b.intro}</p>
                )}
                {(b.size || b.floor || b.opened) && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {[
                      b.size ? `약 ${b.size.toLocaleString()}평` : null,
                      b.floor || null,
                      b.opened ? `${b.opened} 오픈` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>
            )}

            <BranchDroneVideo fileName={b.droneVideoUrl} branchName={b.shortName} />

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm">
                <Car className="h-4 w-4 text-primary" /> {parkingLabel(b)}
              </span>
              {b.is24h && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm">
                  <Clock className="h-4 w-4 text-primary" /> 24시간 운영
                </span>
              )}
              {hoursShort && !b.is24h && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm">
                  <Clock className="h-4 w-4 text-primary" /> {hoursShort}
                </span>
              )}
            </div>

            {b.transport && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-1.5">오시는 길</h2>
                <p className="flex items-start gap-2 text-foreground">
                  <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-primary" /> {b.transport}
                </p>
              </div>
            )}

            {b.facilities.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">시설 · 프로그램</h2>
                <div className="flex flex-wrap gap-2">
                  {b.facilities.map((f) => (
                    <span key={f} className="rounded-full bg-secondary px-3 py-1 text-sm text-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {b.brands.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">보유 웨이트 브랜드</h2>
                <div className="flex flex-wrap gap-2">
                  {b.brands.map((br) => {
                    const bslug = brandPageSlug(br);
                    return bslug ? (
                      <Link
                        key={br}
                        href={`/brand/${bslug}`}
                        className="rounded-full border border-border/60 bg-card px-3 py-1 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {br}
                      </Link>
                    ) : (
                      <span
                        key={br}
                        className="rounded-full border border-border/60 bg-card px-3 py-1 text-sm font-medium text-foreground"
                      >
                        {br}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  브랜드를 누르면 해당 브랜드 보유 지점을 볼 수 있어요.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {b.phone && (
                <Button asChild variant="outline">
                  <a href={`tel:${b.phone.replace(/[^0-9]/g, '')}`}>
                    <Phone className="mr-2 h-4 w-4" /> {b.phone}
                  </a>
                </Button>
              )}
              {b.naverPlaceUrl && (
                <Button asChild variant="outline">
                  <a href={b.naverPlaceUrl} target="_blank" rel="noopener noreferrer">
                    네이버 플레이스 <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* 오른쪽: 헬보올패스 후크 + CTA */}
          <aside className="md:col-span-1">
            <div className="rounded-xl border border-primary/30 bg-card p-5 md:sticky md:top-24">
              <p className="text-lg font-bold leading-snug">
                이 지점 가격으로<br />전국 {ALL_BRANCHES.length}개 자유이용
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {b.shortName}에 등록해도, 헬보올패스 하나면 전국 헬스보이짐 어디서든 운동하세요.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {b.tierLabel} 등급으로 이용</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> 집·회사·여행지 어디서나</li>
              </ul>
              <div className="mt-5 flex flex-col gap-2">
                <Button asChild size="lg" className="w-full font-bold">
                  <Link href="/purchase">헬보올패스 구매하기 <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/register">이 지점으로 등록</Link>
                </Button>
              </div>
            </div>
          </aside>
        </section>

        {/* 같은 지역 다른 지점 */}
        {siblings.length > 0 && (
          <section className="container px-4 md:px-6 pb-14 max-w-5xl">
            <h2 className="text-lg font-bold mb-4">{regionShort}의 다른 헬스보이짐</h2>
            <div className="flex flex-wrap gap-2">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/branch/${s.slug}`}
                  className="rounded-md border border-border/60 bg-card px-3 py-1.5 text-sm hover:border-primary hover:text-primary transition-colors"
                >
                  {s.shortName} <span className="text-muted-foreground">({s.tierLabel})</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
