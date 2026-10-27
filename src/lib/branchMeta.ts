// AUTO-GENERATED — 헬스보이짐_지점별_특징.xlsx (기준일 2026-07-31) 기반. 수정 시 생성 스크립트로 갱신.
// 지점별 영문 slug · 정보 수준(rich/normal/low) · 시설 칩 · 지역. 지점 랜딩/지역 랜딩/지도 모달 공용.

export type InfoLevel = 'rich' | 'normal' | 'low';
export interface BranchMeta { slug: string; info: InfoLevel; facilities: string[]; region: string; }

/** key = 지점 짧은 이름('헬스보이짐' 접두어 제거). 예: '철산점' */
export const BRANCH_META: Record<string, BranchMeta> = {
  "서울시청점": { slug: "seoulsicheong", info: "low", facilities: ["헬스", "PT", "필라테스"], region: "서울특별시" },
  "을지로점": { slug: "euljiro", info: "normal", facilities: ["헬스", "PT", "필라테스"], region: "서울특별시" },
  "신촌점": { slug: "sinchon", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX", "골프", "스쿼시", "사우나"], region: "서울특별시" },
  "홍대점": { slug: "hongdae", info: "normal", facilities: ["헬스", "PT", "필라테스"], region: "서울특별시" },
  "여의도점": { slug: "yeouido", info: "normal", facilities: ["헬스", "PT", "필라테스", "안마의자"], region: "서울특별시" },
  "여의도역점": { slug: "yeouidoyeok", info: "rich", facilities: ["헬스", "PT", "필라테스", "골프", "샤워시설"], region: "서울특별시" },
  "강남고속터미널점": { slug: "gangnamgosokteomineol", info: "rich", facilities: ["헬스", "PT", "필라테스"], region: "서울특별시" },
  "당산역점": { slug: "dangsanyeok", info: "low", facilities: ["헬스", "PT", "필라테스"], region: "서울특별시" },
  "신논현점": { slug: "sinnonhyeon", info: "normal", facilities: ["헬스", "PT", "필라테스", "GX", "샤워시설"], region: "서울특별시" },
  "학동역점": { slug: "hakdongyeok", info: "rich", facilities: ["헬스", "PT", "필라테스", "사우나"], region: "서울특별시" },
  "강남역점": { slug: "gangnamyeok", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX", "사우나", "안마의자"], region: "서울특별시" },
  "문래역점": { slug: "munraeyeok", info: "normal", facilities: ["헬스", "PT", "안마의자"], region: "서울특별시" },
  "영등포점": { slug: "yeongdeungpo", info: "normal", facilities: ["헬스", "PT", "필라테스", "안마의자"], region: "서울특별시" },
  "건대스타시티몰점": { slug: "geondaeseutasitimol", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX", "골프", "사우나"], region: "서울특별시" },
  "선릉점": { slug: "seonreung", info: "normal", facilities: ["헬스", "PT", "필라테스", "골프", "사우나"], region: "서울특별시" },
  "불광점": { slug: "bulgwang", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX", "안마의자"], region: "서울특별시" },
  "상암MBC점": { slug: "sangammbc", info: "low", facilities: ["헬스", "PT", "필라테스"], region: "서울특별시" },
  "가산역점": { slug: "gasanyeok", info: "normal", facilities: ["헬스", "PT", "필라테스", "골프", "사우나"], region: "서울특별시" },
  "장안점": { slug: "jangan", info: "normal", facilities: ["헬스", "PT", "필라테스", "GX"], region: "서울특별시" },
  "잠실점": { slug: "jamsil", info: "normal", facilities: ["헬스", "PT", "필라테스"], region: "서울특별시" },
  "양천향교역점": { slug: "yangcheonhyanggyoyeok", info: "low", facilities: ["헬스", "PT", "필라테스", "GX", "골프", "사우나"], region: "서울특별시" },
  "가양역점": { slug: "gayangyeok", info: "normal", facilities: ["헬스", "PT", "필라테스"], region: "서울특별시" },
  "가락점": { slug: "garak", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX", "골프", "수영장", "사우나"], region: "서울특별시" },
  "판교역점": { slug: "pangyoyeok", info: "rich", facilities: ["헬스", "PT"], region: "경기도" },
  "일산주엽점": { slug: "ilsanjuyeop", info: "rich", facilities: ["헬스", "PT", "필라테스", "골프"], region: "경기도" },
  "인계점": { slug: "ingye", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX", "골프", "사우나", "안마의자"], region: "경기도" },
  "광교점": { slug: "gwanggyo", info: "normal", facilities: ["헬스", "PT", "샤워시설"], region: "경기도" },
  "철산점": { slug: "cheolsan", info: "low", facilities: ["헬스", "PT", "GX"], region: "경기도" },
  "수내점": { slug: "sunae", info: "low", facilities: ["헬스", "PT", "필라테스", "GX"], region: "경기도" },
  "안산중앙점": { slug: "ansanjungang", info: "normal", facilities: ["헬스", "PT", "필라테스", "GX", "골프"], region: "경기도" },
  "수지점": { slug: "suji", info: "low", facilities: ["헬스", "PT", "샤워시설"], region: "경기도" },
  "배곧점": { slug: "baegot", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX", "안마의자"], region: "경기도" },
  "상현점": { slug: "sanghyeon", info: "normal", facilities: ["헬스", "PT", "안마의자"], region: "경기도" },
  "망포점": { slug: "mangpo", info: "rich", facilities: ["헬스", "PT", "기구필라테스", "샤워시설"], region: "경기도" },
  "상록수역점": { slug: "sangroksuyeok", info: "low", facilities: ["헬스", "PT", "필라테스", "GX"], region: "경기도" },
  "영통판타지움점": { slug: "yeongtongpantajium", info: "low", facilities: ["헬스", "PT", "샤워시설"], region: "경기도" },
  "권선점": { slug: "gwonseon", info: "rich", facilities: ["헬스", "PT", "필라테스", "안마의자"], region: "경기도" },
  "고양행신점": { slug: "goyanghaengsin", info: "low", facilities: ["헬스", "PT", "필라테스", "샤워시설"], region: "경기도" },
  "병점점": { slug: "byeongjeom", info: "normal", facilities: ["헬스", "PT", "GX", "골프"], region: "경기도" },
  "매탄점": { slug: "maetan", info: "rich", facilities: ["헬스", "PT", "사우나", "안마의자"], region: "경기도" },
  "미금점": { slug: "migeum", info: "normal", facilities: ["헬스", "PT", "필라테스", "GX"], region: "경기도" },
  "정자점": { slug: "jeongja", info: "normal", facilities: ["헬스", "PT", "필라테스", "GX"], region: "경기도" },
  "죽전점": { slug: "jukjeon", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX", "골프", "사우나"], region: "경기도" },
  "천천점": { slug: "cheoncheon", info: "rich", facilities: ["헬스", "PT", "샤워시설", "안마의자"], region: "경기도" },
  "문정역점": { slug: "munjeongyeok", info: "normal", facilities: ["헬스", "PT", "샤워시설"], region: "서울특별시" },
  "송촌점": { slug: "songchon", info: "low", facilities: ["헬스", "PT", "필라테스", "GX", "사우나"], region: "대전광역시" },
  "둔산점": { slug: "dunsan", info: "rich", facilities: ["헬스", "PT", "필라테스"], region: "대전광역시" },
  "관저점": { slug: "gwanjeo", info: "normal", facilities: ["헬스", "PT", "필라테스", "GX", "사우나"], region: "대전광역시" },
  "테크노밸리점": { slug: "tekeunobaelri", info: "normal", facilities: ["헬스", "PT", "GX", "샤워시설"], region: "대전광역시" },
  "도안점": { slug: "doan", info: "normal", facilities: ["헬스", "PT", "필라테스", "GX"], region: "대전광역시" },
  "가오점": { slug: "gao", info: "low", facilities: ["헬스", "PT", "필라테스", "GX"], region: "대전광역시" },
  "월평점": { slug: "wolpyeong", info: "normal", facilities: ["헬스", "PT", "필라테스", "샤워시설"], region: "대전광역시" },
  "목원대점": { slug: "mokwondae", info: "normal", facilities: ["헬스", "PT"], region: "대전광역시" },
  "NC대전유성점": { slug: "ncdaejeonyuseong", info: "low", facilities: ["헬스", "PT"], region: "대전광역시" },
  "대전터미널점": { slug: "daejeonteomineol", info: "rich", facilities: ["헬스", "PT", "필라테스", "골프"], region: "대전광역시" },
  "태평점": { slug: "taepyeong", info: "normal", facilities: ["헬스", "PT", "필라테스"], region: "대전광역시" },
  "탄방점": { slug: "tanbang", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX"], region: "대전광역시" },
  "신부점": { slug: "sinbu", info: "low", facilities: ["헬스", "PT", "필라테스", "GX"], region: "충청남도" },
  "쌍용점": { slug: "ssangyong", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX"], region: "충청남도" },
  "복대점": { slug: "bokdae", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX", "샤워시설"], region: "충청북도" },
  "하단점": { slug: "hadan", info: "low", facilities: ["헬스", "PT"], region: "부산광역시" },
  "당리점": { slug: "dangri", info: "normal", facilities: ["헬스", "PT", "필라테스", "GX"], region: "부산광역시" },
  "삼산점": { slug: "samsan", info: "low", facilities: ["헬스", "PT", "골프"], region: "울산광역시" },
  "창원중앙점": { slug: "changwonjungang", info: "low", facilities: ["헬스", "PT", "샤워시설"], region: "경상남도" },
  "전주송천점": { slug: "jeonjusongcheon", info: "normal", facilities: ["헬스", "PT", "필라테스", "GX", "골프", "사우나"], region: "전라북도" },
  "롯데대구역점": { slug: "rotdedaeguyeok", info: "low", facilities: ["헬스", "PT"], region: "대구광역시" },
  "비전점": { slug: "bijeon", info: "rich", facilities: ["헬스", "PT", "필라테스", "GX", "골프"], region: "경기도" },
};

export const REGION_SLUG: Record<string, string> = {
  "서울특별시": "seoul",
  "경기도": "gyeonggi",
  "대전광역시": "daejeon",
  "부산광역시": "busan",
  "충청남도": "chungnam",
  "충청북도": "chungbuk",
  "울산광역시": "ulsan",
  "경상남도": "gyeongnam",
  "전라북도": "jeonbuk",
  "대구광역시": "daegu",
};
export const REGION_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(REGION_SLUG).map(([ko, en]) => [en, ko])
);

const SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(BRANCH_META).map(([name, m]) => [m.slug, name])
);

export function shortBranchName(name: string): string {
  return (name || '').replace('헬스보이짐', '').trim();
}
export function getBranchMeta(name: string): BranchMeta | undefined {
  return BRANCH_META[shortBranchName(name)];
}
export function branchSlug(name: string): string {
  return getBranchMeta(name)?.slug ?? '';
}
export function nameFromSlug(slug: string): string | undefined {
  return SLUG_TO_NAME[slug];
}
export const INFO_ORDER: Record<InfoLevel, number> = { rich: 0, normal: 1, low: 2 };
export const INFO_LABEL: Record<InfoLevel, string> = { rich: '정보 풍부', normal: '', low: '정보 업데이트 예정' };
