/**
 * 상단 공지 배너 설정 (단일 문서 settings/noticeBanner).
 * 관리자가 문구/표시여부/링크/색상을 편집하고, 사이트 상단 배너가 이를 실시간 반영.
 * - 읽기: 공개, 쓰기: 관리자만 (firestore.rules)
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export interface NoticeBanner {
  enabled: boolean;             // 표시 여부
  text: string;                 // 배너 문구
  link?: string;                // 클릭 시 이동 링크(선택)
  variant: 'warning' | 'info';  // warning=노랑(경고), info=파랑(안내)
}

/**
 * Firestore에 배너 문서가 아직 없을 때(또는 로딩 전/오류 시) 사용하는 폴백.
 * ⚠️ 반드시 enabled:false — 기본 상태는 '배너 없음'이어야 한다.
 * (예전처럼 enabled:true 로 두면, 문서가 없을 때 옛 공지가 '잔상'처럼 계속 노출되고
 *  정적 HTML에도 박혀 매 로드마다 깜빡인다.)
 * 관리자가 배너 관리에서 문구를 입력하고 저장(enabled:true)할 때만 노출된다.
 */
export const FALLBACK_BANNER: NoticeBanner = {
  enabled: false,
  text: '',
  link: '',
  variant: 'warning',
};

const bannerRef = () => doc(db, 'settings', 'noticeBanner');

/** 실시간 구독. 문서가 없으면 null (컴포넌트가 폴백 처리). */
export function subscribeBanner(
  cb: (b: NoticeBanner | null) => void,
  onError?: (e: Error) => void
): () => void {
  return onSnapshot(
    bannerRef(),
    (snap) => cb(snap.exists() ? (snap.data() as NoticeBanner) : null),
    (e) => onError?.(e)
  );
}

export async function getBanner(): Promise<NoticeBanner | null> {
  const snap = await getDoc(bannerRef());
  return snap.exists() ? (snap.data() as NoticeBanner) : null;
}

export async function saveBanner(b: NoticeBanner): Promise<void> {
  await setDoc(bannerRef(), { ...b, updatedAt: serverTimestamp() }, { merge: true });
}
