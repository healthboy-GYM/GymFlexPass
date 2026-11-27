/**
 * 올패스 제외 지점 — 헬보올패스에 포함되지 않는 지점.
 * 이 사이트(all-pass) 전역에서 숨긴다: 지도/목록/드롭다운/등급표/마퀴/지점·지역 랜딩/사이트맵.
 *
 * 각 데이터 소스(gyms_update.json, branchMeta, branchImages 등 일부는 자동 생성)를
 * 직접 고치는 대신, 소비 시점에 이 목록으로 필터링한다 → 데이터가 재생성돼도 제외 유지.
 * 지점이 추가로 제외되면 아래 배열에만 추가하면 된다. (지점 짧은 이름 기준, 예: '도안점')
 */
export const EXCLUDED_BRANCHES = ['도안점', '복대점'] as const;

/** 전체명('헬스보이짐 도안점')·짧은이름('도안점') 모두 매칭. */
export function isExcludedBranch(name?: string | null): boolean {
  if (!name) return false;
  const s = String(name).replace('헬스보이짐', '').trim();
  return EXCLUDED_BRANCHES.some((b) => s === b || String(name).includes(b));
}
