/**
 * 네이버 CTS(전환추적) 연동.
 * 공통(PV/유입) 스크립트는 wcslog.js 를 공유하고, 전환은 wcs.trans(_conv) 로 보낸다.
 * 참고: https://navercts.gitbook.io/guide/script_guide
 *
 * ▼ 아래 AccountId 에 네이버 광고시스템에서 발급받은 CTS 계정값(예: 's_1a2b3c4d')을 넣으세요.
 *    비어 있으면 CTS 유입/전환 추적이 동작하지 않습니다(안전 — 오류 없이 건너뜀).
 */
export const NAVER_CTS_ACCOUNT_ID = 's_49d4331f327c';

export type NaverConvType =
  | 'purchase' | 'sign_up' | 'lead' | 'add_to_cart' | 'add_to_wishlist'
  | 'begin_checkout' | 'view_product' | 'view_content' | 'schedule' | 'subscribe'
  | (string & {});

export interface NaverConv {
  type: NaverConvType;
  value?: string | number; // purchase 시 총 구매액(필수)
  id?: string;             // 주문번호 등
  items?: Array<{ id?: string; name?: string; payAmount?: string | number }>;
}

/** CTS 전환 이벤트 전송. AccountId 가 없거나 wcs 미로딩이면 조용히 무시. */
export function fireNaverConversion(conv: NaverConv): void {
  if (!NAVER_CTS_ACCOUNT_ID) return;
  try {
    const w = window as unknown as { wcs?: any; wcs_add?: Record<string, string> };
    if (!w.wcs || typeof w.wcs.trans !== 'function') return;
    if (!w.wcs_add) w.wcs_add = {};
    w.wcs_add['wa'] = NAVER_CTS_ACCOUNT_ID;
    const _conv: Record<string, unknown> = { type: conv.type };
    if (conv.value != null) _conv.value = String(conv.value);
    if (conv.id) _conv.id = conv.id;
    if (conv.items && conv.items.length) {
      _conv.items = conv.items.map((it) => ({
        id: it.id ?? '',
        name: it.name ?? '',
        payAmount: it.payAmount != null ? String(it.payAmount) : '',
      }));
    }
    w.wcs.trans(_conv);
  } catch {
    /* 추적 실패는 사용자 흐름에 영향 주지 않도록 무시 */
  }
}

/**
 * wcslog.js 로딩을 기다렸다가 전환을 전송한다(페이지 진입형 전환용).
 * 진입 즉시 wcs 가 준비 안 됐을 수 있으므로 로더 load 이벤트를 기다린다.
 * cleanup 함수를 반환(useEffect 에서 그대로 반환).
 */
export function fireNaverConversionWhenReady(conv: NaverConv): () => void {
  if (!NAVER_CTS_ACCOUNT_ID || typeof window === 'undefined') return () => {};
  const w = window as unknown as { wcs?: any };
  if (w.wcs && typeof w.wcs.trans === 'function') {
    fireNaverConversion(conv);
    return () => {};
  }
  const el = document.getElementById('naver-analytics-loader');
  const handler = () => fireNaverConversion(conv);
  el?.addEventListener('load', handler);
  return () => el?.removeEventListener('load', handler);
}
