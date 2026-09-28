/**
 * 빌드 타임(정적 생성)용 지점 데이터.
 * - 소스: src/data/gyms_update.json (레거시 필드) + src/lib/branchMeta.ts (slug·정보수준·시설)
 * - Firebase 를 import 하지 않으므로 서버 컴포넌트(generateStaticParams/generateMetadata)에서 안전하게 사용.
 * - 지점/지역 랜딩 페이지의 단일 데이터 진입점.
 */
import gymsData from '@/data/gyms_update.json';
import { BRANCH_META, REGION_SLUG, shortBranchName, INFO_ORDER, type InfoLevel } from '@/lib/branchMeta';
import { BRANCH_PHOTO_BY_NAME } from '@/lib/branchImages';
import { BRANCH_BRANDS, BRAND_SLUG } from '@/lib/branchBrands';
import { BRANCH_FACTS } from '@/lib/branchFacts';

export interface StaticBranch {
  name: string;
  shortName: string;
  slug: string;
  region: string;
  regionSlug: string;
  tier: string;
  tierLabel: string;
  address: string;
  transport: string;
  phone: string;
  hours: string;
  parking: string;
  is24h: boolean;
  naverPlaceUrl: string;
  facilities: string[];
  info: InfoLevel;
  lat: number;
  lng: number;
  photo: string;          // 대표 사진(public 경로). 없으면 ''
  droneVideoUrl: string;  // 드론 영상 Storage 파일명. 없으면 ''
  brands: string[];       // 보유 웨이트기구 브랜드(정규화). 없으면 []
  intro: string;          // 지점 한 줄 소개. 없으면 ''
  size: number | null;    // 전용면적(평). 없으면 null
  floor: string;          // 층 구성. 없으면 ''
  opened: string;         // 오픈 시기(예: '2020년 10월'). 없으면 ''
}

const TIER_LABEL: Record<string, string> = {
  'S-PREMIUM': 'S-Premium',
  PREMIUM: 'Premium',
  GOLD: 'Gold',
  SILVER: 'Silver',
  BLACK: 'Black',
};

export function tierLabel(tier: string): string {
  const key = (tier || '').toUpperCase().replace(/\s+/g, '-');
  return TIER_LABEL[key] ?? tier;
}

function build(): StaticBranch[] {
  return (gymsData as any[])
    .map((g) => {
      const name = (g.name ?? g.c ?? '').trim();
      const short = shortBranchName(name);
      const meta = BRANCH_META[short];
      return {
        name,
        shortName: short,
        slug: meta?.slug ?? '',
        region: g.region ?? '',
        regionSlug: REGION_SLUG[g.region] ?? '',
        tier: g.tier ?? '',
        tierLabel: tierLabel(g.tier ?? ''),
        address: g.address ?? '',
        transport: g.transport ?? '',
        phone: g.phone ?? '',
        hours: g.hours ?? '',
        parking: g['무료주차시간'] ?? '',
        is24h: g['24시간 운영여부'] === 'O' || g['24시간 운영여부'] === true,
        naverPlaceUrl: g['naverplace URL'] ?? '',
        facilities: meta?.facilities ?? [],
        info: meta?.info ?? 'normal',
        lat: Number(g.lat) || 0,
        lng: Number(g.lng) || 0,
        photo: BRANCH_PHOTO_BY_NAME[name] ?? '',
        droneVideoUrl: g.droneVideoUrl ?? '',
        brands: BRANCH_BRANDS[short] ?? [],
        intro: BRANCH_FACTS[short]?.intro ?? '',
        size: BRANCH_FACTS[short]?.size ?? null,
        floor: BRANCH_FACTS[short]?.floor ?? '',
        opened: BRANCH_FACTS[short]?.opened ?? '',
      } as StaticBranch;
    })
    .filter((b) => b.slug);
}

export const ALL_BRANCHES: StaticBranch[] = build();

export function getBranchBySlug(slug: string): StaticBranch | undefined {
  return ALL_BRANCHES.find((b) => b.slug === slug);
}

export function getBranchesByRegionSlug(regionSlug: string): StaticBranch[] {
  return ALL_BRANCHES.filter((b) => b.regionSlug === regionSlug);
}

/** 정보 풍부 → 보통 → 부족(업데이트 예정) 순, 같은 등급이면 이름순. */
export function sortByInfo(list: StaticBranch[]): StaticBranch[] {
  return [...list].sort(
    (a, b) => INFO_ORDER[a.info] - INFO_ORDER[b.info] || a.shortName.localeCompare(b.shortName)
  );
}

export function parkingLabel(b: StaticBranch): string {
  return b.parking && b.parking !== 'X' ? `무료주차 ${b.parking}` : '유료 주차';
}

export const TOTAL_BRANCHES = ALL_BRANCHES.length;

// 브랜드별 보유 지점 수 (브랜드 페이지는 2곳 이상만 존재)
const BRAND_COUNT = new Map<string, number>();
for (const b of ALL_BRANCHES) for (const br of b.brands) BRAND_COUNT.set(br, (BRAND_COUNT.get(br) ?? 0) + 1);

/** 그 브랜드의 페이지(/brand/[slug])가 있으면 slug, 없으면 null. */
export function brandPageSlug(brand: string): string | null {
  return (BRAND_COUNT.get(brand) ?? 0) >= 2 ? BRAND_SLUG[brand] ?? null : null;
}
