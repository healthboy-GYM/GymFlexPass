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
 * Firestore에 배너 문서가 아직 없을 때 사이트와 관리자가 공통으로 사용하는 폴백(현재 노출 중인 공지).
 * 사이트 상단 배너와 관리자 편집 폼이 이 값을 함께 쓰므로, 관리자가 '현재 표시 중인 배너'를 그대로 불러와 수정/off 할 수 있다.
 * 관리자가 한 번이라도 저장하면 Firestore 값이 우선한다.
 */
export const FALLBACK_BANNER: NoticeBanner = {
  enabled: true,
  text: '[공지] 평택역점, 대전시청점, 용문역점은 2026년 7월 1일 폐점으로 인해 헬보올패스 사용이 불가합니다.',
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
