/**
 * 홈 팝업 설정 (단일 문서 settings/popups).
 * 모든 팝업을 하나의 목록(items)으로 관리한다. 각 항목은 kind로 구분:
 * - 'custom'         : 담당자가 만든 범용 팝업(이미지+제목+문구+버튼)
 * - 'bodyChallenge'  : 바디챌린지 팝업(정교한 고정 디자인 + 편집 가능한 핵심 필드)
 * - 'eventWinner'    : 당첨자 안내 팝업(제목/부제 + 당첨자 목록 편집)
 * 모든 항목은 on/off · 순서변경 · 삭제 가능. 홈은 PopupHost가 우선순위대로 하나만 노출.
 *
 * 읽기 공개 / 쓰기 관리자(firestore.rules settings/{docId}).
 * 문서가 없으면 DEFAULT_ITEMS로 폴백(현재 동작 유지). 구(舊) 스키마도 자동 마이그레이션.
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export type PopupFrequency = 'always' | 'daily' | 'once';
export type PopupKind = 'custom' | 'bodyChallenge' | 'eventWinner';

export const FREQUENCY_LABELS: Record<PopupFrequency, string> = {
  always: '매 방문마다',
  daily: '하루 1회 (오늘 하루 보지 않기)',
  once: '최초 1회 (다시 보지 않기)',
};

interface PopupBase {
  id: string;
  kind: PopupKind;
  enabled: boolean;
  frequency: PopupFrequency;
}

export interface CustomPopup extends PopupBase {
  kind: 'custom';
  title: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface BodyChallengeItem extends PopupBase {
  kind: 'bodyChallenge';
  edition: string;   // 기수 (예: '35기')
  subtitle: string;  // 부제 (예: '10주간의 놀라운 변화')
  prize: string;     // 대상 상금 (예: '1,000만원')
  deadline: string;  // 접수 마감일 (YYYY-MM-DD) — 이 날짜가 지나면 자동 미노출
  applyUrl: string;  // 신청 링크
  imageUrl?: string; // 헤더 이미지
}

export interface WinnerRow {
  rank: number;
  name: string;
  phone: string;
  prize: string;
}

export interface EventWinnerItem extends PopupBase {
  kind: 'eventWinner';
  title: string;
  subtitle?: string;
  stampWinners: WinnerRow[];
  rankingWinners: WinnerRow[];
}

export type PopupItem = CustomPopup | BodyChallengeItem | EventWinnerItem;

export interface PopupSettings {
  items: PopupItem[];
}

const CHALLENGE_IMAGE =
  'https://firebasestorage.googleapis.com/v0/b/gymflex-pass-fgz47.firebasestorage.app/o/assets%2Fchallenge-hero.png?alt=media';

const DEFAULT_STAMP_WINNERS: WinnerRow[] = [
  { rank: 1, name: '조*린', phone: '6748', prize: '에어팟맥스' },
  { rank: 2, name: '신*훈', phone: '9919', prize: '다이슨에어랩' },
  { rank: 3, name: '송*현', phone: '6419', prize: '올패스 6개월' },
  { rank: 4, name: '조*확', phone: '5055', prize: '스타벅스 상품권 5000원' },
  { rank: 5, name: '이*진', phone: '2245', prize: '스타벅스 상품권 5000원' },
  { rank: 6, name: '김*형', phone: '7767', prize: '스타벅스 상품권 5000원' },
  { rank: 7, name: '이*준', phone: '8707', prize: '스타벅스 상품권 5000원' },
];

const DEFAULT_RANKING_WINNERS: WinnerRow[] = [
  { rank: 1, name: '이*진', phone: '2245', prize: 'S프리미엄 올패스 12개월 + 바바라스튜디오 촬영권' },
  { rank: 2, name: '신*훈', phone: '9919', prize: 'S프리미엄 올패스 6개월' },
  { rank: 3, name: '조*확', phone: '5055', prize: 'S프리미엄 올패스 6개월' },
  { rank: 4, name: '이*준', phone: '8707', prize: 'S프리미엄 올패스 1개월' },
  { rank: 5, name: '송*현', phone: '6419', prize: 'S프리미엄 올패스 1개월' },
  { rank: 6, name: '김*형', phone: '7767', prize: 'S프리미엄 올패스 1개월' },
  { rank: 7, name: '김*양', phone: '2656', prize: 'S프리미엄 올패스 1개월' },
  { rank: 8, name: '조*린', phone: '6748', prize: 'S프리미엄 올패스 1개월' },
  { rank: 9, name: '임*솔', phone: '9236', prize: 'S프리미엄 올패스 1개월' },
  { rank: 10, name: '엄*영', phone: '7450', prize: 'S프리미엄 올패스 1개월' },
];

export const DEFAULT_BODY_CHALLENGE: BodyChallengeItem = {
  id: 'builtin-bodyChallenge',
  kind: 'bodyChallenge',
  enabled: true,
  frequency: 'daily',
  edition: '35기',
  subtitle: '10주간의 놀라운 변화',
  prize: '1,000만원',
  deadline: '2026-09-27',
  applyUrl: 'https://healthboybodychallenge.co.kr/',
  imageUrl: CHALLENGE_IMAGE,
};

export const DEFAULT_EVENT_WINNER: EventWinnerItem = {
  id: 'builtin-eventWinner',
  kind: 'eventWinner',
  enabled: false,
  frequency: 'once',
  title: '이벤트 당첨자 안내',
  subtitle: '당첨을 진심으로 축하드립니다!',
  stampWinners: DEFAULT_STAMP_WINNERS,
  rankingWinners: DEFAULT_RANKING_WINNERS,
};

/** 기본 팝업 목록(현재 동작: 바디챌린지 노출, 당첨자 숨김). */
export const DEFAULT_ITEMS: PopupItem[] = [
  { ...DEFAULT_BODY_CHALLENGE },
  { ...DEFAULT_EVENT_WINNER },
];

const popupsRef = () => doc(db, 'settings', 'popups');

export function newPopupId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `pop-${crypto.randomUUID()}`;
  } catch { /* ignore */ }
  return `pop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyCustomPopup(): CustomPopup {
  return { id: newPopupId(), kind: 'custom', enabled: false, frequency: 'daily', title: '', description: '', imageUrl: '', buttonText: '', buttonLink: '' };
}

export function emptyWinnerRow(rank: number): WinnerRow {
  return { rank, name: '', phone: '', prize: '' };
}

const asFreq = (v: unknown): PopupFrequency => (v === 'always' || v === 'once' ? v : 'daily');
const asStr = (v: unknown, d = ''): string => (typeof v === 'string' ? v : d);
const asBool = (v: unknown, d = false): boolean => (typeof v === 'boolean' ? v : d);

function normalizeWinner(x: unknown, i: number): WinnerRow {
  const o = (x ?? {}) as Partial<WinnerRow>;
  return {
    rank: typeof o.rank === 'number' ? o.rank : i + 1,
    name: asStr(o.name),
    phone: asStr(o.phone),
    prize: asStr(o.prize),
  };
}

function normalizeItem(x: unknown): PopupItem | null {
  const o = (x ?? {}) as Partial<PopupItem> & { kind?: string };
  if (!o.id || typeof o.id !== 'string') return null;
  const base = { id: o.id, enabled: asBool((o as PopupBase).enabled), frequency: asFreq((o as PopupBase).frequency) };
  if (o.kind === 'bodyChallenge') {
    const b = o as Partial<BodyChallengeItem>;
    return {
      ...base, kind: 'bodyChallenge',
      edition: asStr(b.edition, DEFAULT_BODY_CHALLENGE.edition),
      subtitle: asStr(b.subtitle, DEFAULT_BODY_CHALLENGE.subtitle),
      prize: asStr(b.prize, DEFAULT_BODY_CHALLENGE.prize),
      deadline: asStr(b.deadline, DEFAULT_BODY_CHALLENGE.deadline),
      applyUrl: asStr(b.applyUrl, DEFAULT_BODY_CHALLENGE.applyUrl),
      imageUrl: asStr(b.imageUrl, DEFAULT_BODY_CHALLENGE.imageUrl),
    };
  }
  if (o.kind === 'eventWinner') {
    const e = o as Partial<EventWinnerItem>;
    return {
      ...base, kind: 'eventWinner',
      title: asStr(e.title, DEFAULT_EVENT_WINNER.title),
      subtitle: asStr(e.subtitle, DEFAULT_EVENT_WINNER.subtitle),
      stampWinners: Array.isArray(e.stampWinners) ? e.stampWinners.map(normalizeWinner) : [],
      rankingWinners: Array.isArray(e.rankingWinners) ? e.rankingWinners.map(normalizeWinner) : [],
    };
  }
  // custom (기본)
  const c = o as Partial<CustomPopup>;
  return {
    ...base, kind: 'custom',
    title: asStr(c.title), description: asStr(c.description),
    imageUrl: asStr(c.imageUrl), buttonText: asStr(c.buttonText), buttonLink: asStr(c.buttonLink),
  };
}

/** 구 스키마({bodyChallenge, eventWinner, custom[]}) → 신 스키마(items[]) 변환. */
function migrateLegacy(data: Record<string, unknown>): PopupItem[] {
  const items: PopupItem[] = [];
  if (typeof data.bodyChallenge === 'boolean') items.push({ ...DEFAULT_BODY_CHALLENGE, enabled: data.bodyChallenge });
  if (typeof data.eventWinner === 'boolean') items.push({ ...DEFAULT_EVENT_WINNER, enabled: data.eventWinner });
  if (Array.isArray(data.custom)) {
    for (const c of data.custom) {
      const n = normalizeItem({ ...(c as object), kind: 'custom' });
      if (n) items.push(n);
    }
  }
  return items;
}

export function normalizePopups(data: Partial<PopupSettings> & Record<string, unknown> | null | undefined): PopupItem[] {
  if (data && Array.isArray(data.items)) {
    const items = data.items.map(normalizeItem).filter((i): i is PopupItem => i !== null);
    return items; // 빈 배열이면 '팝업 없음'이 정상(모두 삭제 가능)
  }
  if (data && ('bodyChallenge' in data || 'eventWinner' in data || 'custom' in data)) {
    return migrateLegacy(data);
  }
  return DEFAULT_ITEMS.map((i) => ({ ...i }));
}

export function subscribePopups(cb: (items: PopupItem[]) => void, onError?: (e: Error) => void): () => void {
  return onSnapshot(
    popupsRef(),
    (snap) => cb(normalizePopups(snap.exists() ? (snap.data() as any) : null)),
    (e) => onError?.(e)
  );
}

export async function getPopups(): Promise<PopupItem[]> {
  try {
    const snap = await getDoc(popupsRef());
    return normalizePopups(snap.exists() ? (snap.data() as any) : null);
  } catch {
    return normalizePopups(null);
  }
}

export async function savePopups(items: PopupItem[]): Promise<void> {
  await setDoc(popupsRef(), { items, updatedAt: serverTimestamp() });
}
