'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, Info, Lock, ArrowUpRight } from 'lucide-react';
import { getBranchMeta, shortBranchName } from '@/lib/branchMeta';

export interface RegionBranch {
  shortName: string;
  slug: string;
  tier: string;
  tierLabel: string;
  transport: string;
  facilities: string[];
  info: 'rich' | 'normal' | 'low';
}

const TIER_ORDER = [
  { key: 'S-PREMIUM', label: 'S-프리미엄' },
  { key: 'PREMIUM', label: '프리미엄' },
  { key: 'GOLD', label: '골드' },
  { key: 'SILVER', label: '실버' },
  { key: 'BLACK', label: '블랙' },
];

const TIER_STYLE: Record<string, { bg: string; fg: string }> = {
  'S-PREMIUM': { bg: '#d32f2f', fg: '#ffffff' },
  PREMIUM: { bg: '#1976d2', fg: '#ffffff' },
  GOLD: { bg: '#ffa000', fg: '#000000' },
  SILVER: { bg: '#757575', fg: '#ffffff' },
  BLACK: { bg: '#212121', fg: '#ffffff' },
};
const TIER_LABEL_EN: Record<string, string> = {
  'S-PREMIUM': 'S-Premium',
  PREMIUM: 'Premium',
  GOLD: 'Gold',
  SILVER: 'Silver',
  BLACK: 'Black',
};

const normKey = (t: string) => (t || '').toUpperCase().replace(/\s+/g, '-');
const tierIdx = (t: string) => TIER_ORDER.findIndex((x) => x.key === normKey(t));
const tierStyle = (t: string) => TIER_STYLE[normKey(t)] ?? TIER_STYLE.SILVER;

export function RegionTierExplorer({
  branches,
  regionShort,
  regionName,
}: {
  branches: RegionBranch[];
  regionShort: string;
  regionName: string;
}) {
  const [passKey, setPassKey] = useState<string | null>(null);
  // 관리자가 새로 추가한 지점(정적 목록에 없는 것)을 실시간으로 보강
  const [liveExtra, setLiveExtra] = useState<RegionBranch[]>([]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let alive = true;
    const staticNames = new Set(branches.map((b) => b.shortName));
    (async () => {
      try {
        const { subscribeGyms } = await import('@/lib/gyms');
        unsub = subscribeGyms(
          (gyms) => {
            if (!alive) return;
            const extra: RegionBranch[] = gyms
              .filter((g) => g.region === regionName)
              .map((g) => {
                const short = shortBranchName(g.name);
                const meta = getBranchMeta(g.name);
                return {
                  shortName: short,
                  slug: meta?.slug ?? '',
                  tier: g.tier ?? '',
                  tierLabel: TIER_LABEL_EN[normKey(g.tier ?? '')] ?? g.tier ?? '',
                  transport: g.transport ?? '',
                  facilities: meta?.facilities ?? [],
                  info: (meta?.info as RegionBranch['info']) ?? 'normal',
                } as RegionBranch;
              })
              .filter((b) => b.shortName && !staticNames.has(b.shortName));
            setLiveExtra(extra);
          },
          { onError: () => {} }
        );
      } catch {
        /* 실시간 실패 시 정적 목록 유지 */
      }
    })();
    return () => {
      alive = false;
      unsub?.();
    };
  }, [branches, regionName]);

  const all = useMemo(() => [...branches, ...liveExtra], [branches, liveExtra]);

  const passIndex = passKey ? TIER_ORDER.findIndex((t) => t.key === passKey) : -1;
  const accessibleCountAt = (idx: number) => all.filter((b) => tierIdx(b.tier) >= idx).length;
  const accessibleCount = passIndex >= 0 ? accessibleCountAt(passIndex) : all.length;
  const upsellDelta = passIndex > 0 ? accessibleCountAt(passIndex - 1) - accessibleCountAt(passIndex) : 0;
  const passLabel = passIndex >= 0 ? TIER_ORDER[passIndex].label : null;

  const ordered = useMemo(() => {
    const rank = { rich: 0, normal: 1, low: 2 } as const;
    return [...all].sort(
      (a, b) => rank[a.info] - rank[b.info] || a.shortName.localeCompare(b.shortName)
    );
  }, [all]);

  return (
    <div>
      {/* 등급 선택 */}
      <div className="mb-3">
        <p className="text-sm font-semibold mb-2">
          내 패스 등급으로 이용 가능한 지점 보기
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            등급이 높을수록 더 많은 지점을 이용해요
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPassKey(null)}
            aria-pressed={passKey === null}
            className={
              'rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ' +
              (passKey === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border/60 text-foreground hover:border-primary/60')
            }
          >
            전체
          </button>
          {TIER_ORDER.map((t) => {
            const active = passKey === t.key;
            const st = TIER_STYLE[t.key];
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setPassKey(t.key)}
                aria-pressed={active}
                className={
                  'rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ' +
                  (active ? '' : 'bg-card border-border/60 text-foreground hover:border-primary/60')
                }
                style={active ? { background: st.bg, color: st.fg, borderColor: st.bg } : undefined}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 헤드라인 카운트 */}
      <div className="mb-4 rounded-lg border border-border/60 bg-card px-4 py-3">
        {passLabel ? (
          <p className="text-base font-bold">
            <span className="text-primary">{passLabel} 패스</span>로 {regionShort}{' '}
            <span className="text-primary">{accessibleCount}</span>
            <span className="text-muted-foreground"> / {all.length}곳</span> 이용 가능
            {upsellDelta > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary align-middle">
                <ArrowUpRight className="h-3.5 w-3.5" /> 한 등급 올리면 +{upsellDelta}곳
              </span>
            )}
          </p>
        ) : (
          <p className="text-base font-bold">
            {regionShort} 헬스보이짐 <span className="text-primary">{all.length}</span>개 지점
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              등급을 선택하면 이용 가능 지점을 확인할 수 있어요
            </span>
          </p>
        )}
      </div>

      {/* 지점 카드 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((b) => {
          const locked = passIndex >= 0 && tierIdx(b.tier) < passIndex;
          const st = tierStyle(b.tier);
          const href = b.slug ? `/branch/${b.slug}` : '/branch-locator';
          return (
            <Link
              key={b.shortName}
              href={href}
              className={
                'group relative rounded-xl border bg-card p-4 transition-colors ' +
                (locked ? 'border-border/40 opacity-55 hover:opacity-80' : 'border-border/60 hover:border-primary/70')
              }
            >
              <span
                className="absolute right-4 top-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{ background: st.bg, color: st.fg }}
              >
                {b.tierLabel}
              </span>
              <h3 className="font-bold text-base pr-16">{b.shortName}</h3>

              {locked ? (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Lock className="h-3 w-3" /> {b.tierLabel} 패스부터 이용
                </span>
              ) : (
                b.info === 'low' && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Info className="h-3 w-3" /> 정보 업데이트 예정
                  </span>
                )
              )}

              {b.transport && (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/80" /> {b.transport}
                </p>
              )}
              {b.facilities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {b.facilities.slice(0, 4).map((f) => (
                    <span key={f} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
