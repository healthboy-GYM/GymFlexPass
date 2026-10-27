/**
 * 브랜드 로고 매핑 + 빌드 시 로고 파일 존재 탐지.
 * - public/brands/logos/<slug>.(svg|png|webp) 파일이 있으면 그 경로를, 없으면 null 반환.
 * - 지점 상세는 서버 컴포넌트(SSG)라 이 fs 스캔은 빌드 시 1회 평가되어 HTML에 구워진다.
 * - 서버 전용 모듈(fs 사용). 클라이언트 컴포넌트에서 import 금지.
 */
import fs from 'fs';
import path from 'path';

/** 정규화된 브랜드명(branchBrands.ts의 값) → 로고 파일 slug */
export const BRAND_SLUG: Record<string, string> = {
  뉴텍: 'newtec',
  해머스트렝스: 'hammer-strength',
  아스널: 'arsenal-strength',
  테크노짐: 'technogym',
  프라임: 'prime',
  파나타: 'panatta',
  프리모션: 'primotion',
  라이프피트니스: 'life-fitness',
  아틀란티스: 'atlantis',
  짐레코: 'gymreco',
  부티빌더: 'bootybuilder',
  짐80: 'gym80',
  호이스트: 'hoist',
  사이벡스: 'cybex',
  너틸러스: 'nautilus',
  디랙스: 'drax',
  왓슨: 'watson',
  로저스: 'rogers',
  스타트렉: 'star-trac',
  포커스: 'focus',
  매트릭스: 'matrix',
  다이나벡: 'dynavec',
  펜듈럼: 'pendulum',
  신코: 'shinko',
  렙콘: 'repcon',
};

const LOGO_DIR = path.join(process.cwd(), 'public', 'brands', 'logos');

/** slug → 실제 파일 경로 (있는 것만). 빌드 시 1회 스캔. */
function scanLogos(): Record<string, string> {
  const map: Record<string, string> = {};
  try {
    for (const f of fs.readdirSync(LOGO_DIR)) {
      const m = f.match(/^(.+)\.(svg|png|webp)$/i);
      if (!m) continue;
      // 0.3KB대 파일은 실제 로고가 아닌 텍스트 플레이스홀더 → 제외(텍스트 칩으로 폴백)
      try {
        if (fs.statSync(path.join(LOGO_DIR, f)).size < 1024) continue;
      } catch {}
      map[m[1].toLowerCase()] = `/brands/logos/${f}`;
    }
  } catch {
    // 폴더 없거나 접근 불가 → 전부 텍스트 폴백
  }
  return map;
}

const AVAILABLE = scanLogos();

/** 브랜드의 로고 경로. 매핑/파일 없으면 null(→ 텍스트 칩으로 폴백). */
export function brandLogo(brand: string): string | null {
  const slug = BRAND_SLUG[brand];
  if (!slug) return null;
  return AVAILABLE[slug] ?? null;
}
