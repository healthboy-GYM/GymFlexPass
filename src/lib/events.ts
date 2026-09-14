/**
 * 이벤트(프로모션) 페이지 데이터 접근 계층.
 * 관리자가 폼으로 이벤트를 만들면 Firestore `events` 컬렉션에 저장되고,
 * 동적 경로 /promo/[slug] 가 이 데이터를 읽어 템플릿으로 렌더링한다.
 *
 * - 읽기: 공개(누구나)
 * - 쓰기: 관리자만 (firestore.rules 의 isAdmin())
 * - 문서 ID = slug (URL에 그대로 사용, 조회가 단순)
 */

import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  getDoc,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const EVENTS = 'events';

export interface EventDoc {
  slug: string;            // URL 슬러그 (문서 ID). 예: 'summer-2026'  → /promo/summer-2026
  title: string;           // 이벤트 제목
  subtitle?: string;       // 부제/한줄 설명
  imageUrl?: string;       // 히어로 이미지 (Storage 공개 URL)
  startDate?: string;      // 'YYYY-MM-DD'
  endDate?: string;        // 'YYYY-MM-DD'
  highlightText?: string;  // 강조 배지 텍스트. 예: '최대 50% 할인'
  body?: string;           // 본문(여러 줄). 줄바꿈은 그대로 표시됨
  ctaText?: string;        // 버튼 텍스트. 예: '지금 신청하기'
  ctaLink?: string;        // 버튼 링크 (내부 경로 또는 외부 URL)
  isActive: boolean;       // false 면 비공개(목록/페이지에서 숨김)
  order?: number;          // 정렬 순서
}

export type EventInput = EventDoc; // slug 포함 (문서 ID로 사용)

/** 슬러그 정규화: 소문자, 영숫자/한글/하이픈만, 공백은 하이픈으로. */
export function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── 읽기 ────────────────────────────────────────────────────────────────────

/** 전체 이벤트. 기본은 활성만(공개용). includeInactive=true 면 숨김 포함(관리자용). */
export async function fetchEvents(includeInactive = false): Promise<EventDoc[]> {
  const snap = await getDocs(query(collection(db, EVENTS), orderBy('order')));
  const events = snap.docs.map((d) => ({ ...(d.data() as EventDoc), slug: d.id }));
  return includeInactive ? events : events.filter((e) => e.isActive !== false);
}

/** 실시간 구독 (관리자 목록/공개 목록). */
export function subscribeEvents(
  onData: (events: EventDoc[]) => void,
  options: { includeInactive?: boolean; onError?: (e: Error) => void } = {}
): () => void {
  const q = query(collection(db, EVENTS), orderBy('order'));
  return onSnapshot(
    q,
    (snap) => {
      const events = snap.docs.map((d) => ({ ...(d.data() as EventDoc), slug: d.id }));
      onData(options.includeInactive ? events : events.filter((e) => e.isActive !== false));
    },
    (err) => options.onError?.(err)
  );
}

/** 슬러그로 단건 조회 (동적 페이지에서 사용). 없거나 비공개면 null. */
export async function getEventBySlug(slug: string): Promise<EventDoc | null> {
  const d = await getDoc(doc(db, EVENTS, slug));
  if (!d.exists()) return null;
  const data = { ...(d.data() as EventDoc), slug: d.id };
  return data.isActive === false ? null : data;
}

// ── 쓰기 (관리자) ───────────────────────────────────────────────────────────

/** 이벤트 생성/수정. slug 를 문서 ID로 사용(있으면 덮어씀). */
export async function saveEvent(input: EventInput): Promise<void> {
  const { slug, ...rest } = input;
  await setDoc(doc(db, EVENTS, slug), { ...rest, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteEvent(slug: string): Promise<void> {
  await deleteDoc(doc(db, EVENTS, slug));
}

export async function setEventActive(slug: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, EVENTS, slug), { isActive, updatedAt: serverTimestamp() });
}
