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
  deleteField,
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

  // ── 할인(가격) 이벤트용 선택 필드 ──────────────────────────────────────────
  // 아래 값들을 채우면 /promo/[slug] 가 '할인 이벤트' 레이아웃(가격/혜택/조건)으로
  // 렌더링된다. 비워두면 기존 일반형(본문 위주)으로 표시된다.
  originalPrice?: number;  // 정가(원). 예: 152000
  salePrice?: number;      // 이벤트가(원). 예: 49000  → 할인율 자동 계산
  priceCaption?: string;   // 가격 아래 한 줄 설명. 예: '프리미엄 올패스 1개월권'
  badges?: string;         // 상단 작은 배지들. 줄바꿈 또는 쉼표로 구분. 예: '신규 한정, 선착순 300, 1인 1회'
  benefits?: string;       // 혜택 카드. 한 줄당 '제목 | 설명'. (설명 생략 가능)
  conditions?: string;     // 유의사항 불릿. 한 줄당 1개.
  noticeBoxTitle?: string; // '유의사항 및 안내'의 강조 박스 제목. 예: '이용 가능 등급 안내'
  noticeBoxBody?: string;  // 강조 박스 본문.
}

/** 배지/조건처럼 '줄바꿈 또는 쉼표'로 구분된 문자열을 배열로. */
export function splitLines(input?: string): string[] {
  if (!input) return [];
  return input
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 혜택 문자열('제목 | 설명' 줄들)을 {title, desc} 배열로. */
export function parseBenefits(input?: string): { title: string; desc: string }[] {
  if (!input) return [];
  return input
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split('|');
      return { title: title.trim(), desc: rest.join('|').trim() };
    });
}

/** 할인율(%) 계산. 정가/이벤트가가 유효할 때만 양수 반환, 아니면 null. */
export function discountPercent(originalPrice?: number, salePrice?: number): number | null {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return null;
  return Math.round((1 - salePrice / originalPrice) * 100);
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
  // Firestore 는 undefined 값을 거부한다. 미입력(undefined) 항목은 deleteField()로
  // 처리해 저장 오류를 막고, 편집 중 값을 비우면 기존 값도 함께 제거되도록 한다.
  const clean = Object.fromEntries(
    Object.entries(rest).map(([k, v]) => [k, v === undefined ? deleteField() : v])
  );
  await setDoc(doc(db, EVENTS, slug), { ...clean, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteEvent(slug: string): Promise<void> {
  await deleteDoc(doc(db, EVENTS, slug));
}

export async function setEventActive(slug: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, EVENTS, slug), { isActive, updatedAt: serverTimestamp() });
}
