'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useGyms } from '@/hooks/use-gyms';
import { subscribePricing, DEFAULT_PRODUCTS, type Product } from '@/lib/pricing';
import { Reveal } from '@/components/sections/Reveal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Crown, Gem, Medal, BarChart3, Heart, MapPin, Check, X, ArrowRight, Search, RotateCcw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// 높은 등급 → 낮은 등급 순. (선택 지점 중 '가장 높은 등급'이 필요 등급)
const TIER_ORDER = ['S-PREMIUM', 'PREMIUM', 'GOLD', 'SILVER', 'BLACK'] as const;
type TierKey = (typeof TIER_ORDER)[number];

const TIER_META: Record<TierKey, { label: string; icon: LucideIcon; color: string; bar: string }> = {
  'S-PREMIUM': { label: 'S-프리미엄', icon: Crown, color: 'text-red-500', bar: 'from-red-500 to-red-400' },
  PREMIUM: { label: '프리미엄', icon: Gem, color: 'text-blue-500', bar: 'from-blue-500 to-sky-400' },
  GOLD: { label: '골드', icon: Medal, color: 'text-yellow-500', bar: 'from-yellow-500 to-amber-400' },
  SILVER: { label: '실버', icon: BarChart3, color: 'text-slate-400', bar: 'from-slate-400 to-slate-300' },
  BLACK: { label: '블랙', icon: Heart, color: 'text-neutral-400', bar: 'from-neutral-500 to-neutral-400' },
};

const normalizeTier = (t?: string): TierKey => {
  const up = (t ?? '').toUpperCase().replace(/\s+/g, '-');
  return (TIER_ORDER.includes(up as TierKey) ? up : 'SILVER') as TierKey;
};
const shortName = (n: string) => n.replace('헬스보이짐', '').trim();

// 등급 → 가격 상품 id
const TIER_PRODUCT_ID: Record<TierKey, string> = {
  'S-PREMIUM': 's-premium', PREMIUM: 'premium', GOLD: 'gold', SILVER: 'silver', BLACK: 'black',
};

// 지역별 안내 메시지(지역 선택 시 자동 노출)
const REGION_HINT: Record<string, string> = {
  서울특별시: '지점이 가장 많은 지역이에요. 자주 가는 곳만 고르면 딱 맞는 등급을 찾아드려요.',
  경기도: '골드·실버 지점이 촘촘합니다. 집·회사 근처 지점을 골라보세요.',
  대전광역시: '대전 생활권 전체가 촘촘하게 연결돼 있어요.',
  부산광역시: '동네 밀착형 지점 중심이에요. 실속 등급으로 충분합니다.',
};
const regionHint = (r: string) => REGION_HINT[r] ?? '자주 갈 지점을 골라보세요. 필요한 등급을 바로 계산해 드립니다.';

export function RouteFinderSection() {
  const { gyms } = useGyms();
  const [region, setRegion] = useState<string>('');
  const [selected, setSelected] = useState<Record<string, TierKey>>({}); // 지점명 → 등급
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    const unsub = subscribePricing(setProducts, () => setProducts(DEFAULT_PRODUCTS));
    return () => unsub();
  }, []);

  // 지역 목록(지점 수 많은 순)
  const regions = useMemo(() => {
    const cnt: Record<string, number> = {};
    gyms.forEach((g: any) => { const r = g.region || '기타'; cnt[r] = (cnt[r] || 0) + 1; });
    return Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]);
  }, [gyms]);

  const activeRegion = region || regions[0] || '';
  const regionGyms = useMemo(
    () => gyms.filter((g: any) => (g.region || '기타') === activeRegion).sort((a: any, b: any) => (a.c || '').localeCompare(b.c || '')),
    [gyms, activeRegion]
  );

  const toggle = (name: string, tier: TierKey) =>
    setSelected((s) => {
      const next = { ...s };
      if (next[name]) delete next[name];
      else next[name] = tier;
      return next;
    });

  const selectedNames = Object.keys(selected);
  const recommended: TierKey | null = useMemo(() => {
    if (selectedNames.length === 0) return null;
    return selectedNames
      .map((n) => selected[n])
      .reduce((best, t) => (TIER_ORDER.indexOf(t) < TIER_ORDER.indexOf(best) ? t : best), 'BLACK' as TierKey);
  }, [selected, selectedNames]);

  const meta = recommended ? TIER_META[recommended] : null;
  const RecIcon = meta?.icon;
  const allBlack = recommended === 'BLACK';

  const recProduct = recommended ? products.find((p) => p.id === TIER_PRODUCT_ID[recommended]) : null;
  const price1 = recProduct?.prices['1']?.price ?? null;
  const monthly6 = recProduct?.prices['6']?.price ? Math.round(recProduct.prices['6'].price / 6) : null;

  return (
    <section className="w-full bg-secondary/40 py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <Reveal className="mx-auto mb-8 max-w-2xl text-center md:mb-12">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Search className="h-3.5 w-3.5" /> 내 동선 진단
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            자주 갈 지점을 고르면,<br className="sm:hidden" /> <span className="text-primary">필요한 등급</span>을 알려드려요
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            집·회사·자주 가는 곳을 골라보세요. 그 지점들을 모두 이용하려면 어떤 등급이면 되는지 바로 계산해 드립니다.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_360px]">
          {/* 지점 선택 */}
          <Reveal className="rounded-2xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">지역을 고르고, 자주 갈 지점을 눌러보세요</span>
            </div>
            <Select value={activeRegion} onValueChange={setRegion}>
              <SelectTrigger className="mb-2"><SelectValue placeholder="지역 선택" /></SelectTrigger>
              <SelectContent>
                {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="mb-4 text-xs text-muted-foreground">💡 {regionHint(activeRegion)}</p>

            <div className="flex max-h-[260px] flex-wrap content-start gap-2 overflow-y-auto">
              {regionGyms.map((g: any) => {
                const name = g.c || g.name;
                const tier = normalizeTier(g.tier);
                const on = !!selected[name];
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggle(name, tier)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                      on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary/50'
                    )}
                  >
                    {on && <Check className="h-3.5 w-3.5" />}
                    {shortName(name)}
                  </button>
                );
              })}
              {regionGyms.length === 0 && <p className="text-sm text-muted-foreground">이 지역에 지점이 없습니다.</p>}
            </div>
          </Reveal>

          {/* 결과 */}
          <Reveal delay={120} className="flex flex-col rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">내 동선 진단 결과</span>
              {selectedNames.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => setSelected({})}>
                  <RotateCcw className="mr-1 h-3 w-3" /> 초기화
                </Button>
              )}
            </div>

            {/* 선택 지점 칩 */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedNames.length === 0 ? (
                <p className="text-sm text-muted-foreground">왼쪽에서 지점을 선택하면 필요한 등급이 여기에 표시됩니다.</p>
              ) : (
                selectedNames.map((n) => (
                  <span key={n} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs">
                    {shortName(n)}
                    <button onClick={() => setSelected((s) => { const x = { ...s }; delete x[n]; return x; })} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* 추천 등급 */}
            {recommended && meta && RecIcon && (
              <div className="mt-4 flex-1 rounded-xl border bg-background p-4">
                <div className={cn('mb-2 h-1 w-full rounded-full bg-gradient-to-r', meta.bar)} />
                <p className="text-xs text-muted-foreground">필요한 등급</p>
                <div className={cn('mt-1 flex items-center gap-2 text-2xl font-black', meta.color)}>
                  <RecIcon className="h-7 w-7" /> {meta.label} 올패스
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  {allBlack ? (
                    <>선택하신 {selectedNames.length}개 지점은 모두 <b>블랙 급</b>입니다. <b className="text-primary">블랙 등급이면 충분해요</b> — 굳이 상위 등급은 필요 없습니다.</>
                  ) : (
                    <>선택하신 {selectedNames.length}개 지점을 <b>모두 이용</b>하려면 <b className={meta.color}>{meta.label}</b> 등급이면 됩니다. 같은 급의 전국 지점도 함께 자유이용해요.</>
                  )}
                </p>
                {price1 != null && (
                  <div className="mt-3 flex items-baseline gap-2 rounded-lg bg-secondary/60 px-3 py-2">
                    <span className="text-lg font-black text-foreground">{price1.toLocaleString()}원</span>
                    <span className="text-xs text-muted-foreground">/ 1개월</span>
                    {monthly6 != null && (
                      <span className="ml-auto text-xs text-primary font-semibold">6개월 등록 시 월 {monthly6.toLocaleString()}원</span>
                    )}
                  </div>
                )}
                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href="/purchase">{meta.label} 패스 구매하기 <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/branch-locator">지도에서 내 주변 찾기</Link>
                  </Button>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
