/**
 * FAQ(자주 묻는 질문) 콘텐츠 (단일 문서 settings/faq).
 * 관리자가 카테고리·질문/답변·유의사항을 추가/수정/삭제. /faq 페이지가 실시간 반영.
 * - 읽기 공개 / 쓰기 관리자 (firestore.rules settings/{docId})
 * - 문서가 없으면 DEFAULT_FAQ로 폴백(현재 사이트 내용 유지).
 * - 답변은 가벼운 마크다운 지원: **굵게**, 줄바꿈, 줄 앞의 "- "는 목록 항목.
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export interface FaqItem {
  id: string;
  question: string;
  answer: string; // 가벼운 마크다운
}

export interface FaqCategory {
  id: string;
  name: string;
  items: FaqItem[];
}

export interface FaqData {
  categories: FaqCategory[];
  notices: string[]; // 기타 유의사항
}

export const DEFAULT_FAQ: FaqData = {
  categories: [
    {
      id: 'about',
      name: '헬보올패스란?',
      items: [
        { id: 'faq-q1', question: 'Q1. 헬보올패스 통합 이용권이 무엇인가요?', answer: 'A. 전국 80여개 헬스보이짐 지점을 회원 등급에 따라 자유롭게 이용할 수 있는 통합 이용권입니다.' },
        {
          id: 'faq-q2',
          question: 'Q2. 등급별로 이용 가능한 지점이 다르나요?',
          answer: 'A. 네, 등급별로 이용 가능한 지점 범위가 다릅니다.\n- **S프리미엄:** 모든 지점 이용 가능\n- **프리미엄:** 프리미엄, 골드, 실버, 블랙 지점 이용 가능\n- **골드:** 골드, 실버, 블랙 지점 이용 가능\n- **실버:** 실버, 블랙 지점 이용 가능\n- **블랙:** 블랙 지점만 이용 가능',
        },
        { id: 'faq-q3', question: 'Q3. 내 등급에 맞는 지점은 어디서 확인하나요?', answer: 'A. 헬보올패스 안내 웹사이트, 각 지점 안내 게시물, 운톡 앱에서 확인할 수 있습니다.' },
      ],
    },
    {
      id: 'how',
      name: '이용 방법',
      items: [
        { id: 'faq-q4', question: 'Q4. PT, 필라테스 등 부가서비스도 이용할 수 있나요?', answer: 'A. 기본 헬스시설 이용권이며, PT, 필라테스 등 부가서비스는 별도 계약이 필요합니다.' },
        { id: 'faq-q5', question: 'Q5. 출입은 어떻게 하나요?', answer: 'A. 운톡 회원관리 앱 설치 후 회원가입, 지점 내 출입확인장치(키오스크 또는 출입게이트)로 간편 출입 가능합니다.' },
        { id: 'faq-q6', question: 'Q6. 주 이용지점이란 무엇인가요?', answer: 'A. 계약 관리 및 고객 응대를 담당하는 기본 지점으로, 온라인 구매 시 반드시 선택해야 합니다.' },
      ],
    },
    {
      id: 'buy',
      name: '전환/구매',
      items: [
        { id: 'faq-q7', question: 'Q7. 기존 회원인데 헬보올패스로 전환할 수 있나요?', answer: 'A. 통합 이용권 결제 후 기존 회원권 환불 절차를 거쳐야 하며, 위약금 없이 진행됩니다.' },
        { id: 'faq-q8', question: 'Q8. 기존 월 5회 입장 패스권은 판매 중단되었나요?', answer: 'A. 네, 현재는 횟수 제한 없는 통합 회원권만 판매 중입니다.' },
        { id: 'faq-q9', question: 'Q9. 결제는 온라인으로도 가능한가요?', answer: 'A. 네, 온라인 결제 가능하며 결제 후 주 이용지점 방문해 계약서를 작성해야 합니다.' },
      ],
    },
    {
      id: 'branch',
      name: '지점 이용',
      items: [
        { id: 'faq-q10', question: 'Q10. 자주 가는 지점 등급이 변경되면 어떻게 하나요?', answer: 'A. 지점 등급 변동 시 지점에 문의해 원하는 등급으로 재구매 후 조정할 수 있습니다.' },
        { id: 'faq-q11', question: 'Q11. 주 이용지점 등급이 변경되어도 이용할 수 있나요?', answer: 'A. 네, 주 이용지점 설정 시 보유 등급과 달라도 이용 가능합니다.' },
      ],
    },
    {
      id: 'etc',
      name: '기타',
      items: [
        { id: 'faq-notice-1', question: 'Q. 온라인 구매 후 어떻게 해야 하나요?', answer: 'A. 온라인 구매 후 반드시 주 이용지점을 방문하여 지류 계약서를 작성하셔야 합니다.' },
        { id: 'faq-notice-2', question: 'Q. 이용 횟수에 제한이 있나요?', answer: 'A. 월 이용 횟수 제한이 없으나, 한 지점당 하루에 한 번만 입장 가능합니다.' },
        { id: 'faq-notice-3', question: 'Q. 지점 등급이 변경될 수 있나요?', answer: 'A. 네, 지점 등급은 변경될 수 있으며, 변경 1개월 전에 운톡 앱 알림 및 지점 안내 게시물을 통해 미리 고지됩니다.' },
      ],
    },
  ],
  notices: [
    '온라인 구매 후 반드시 주 이용지점 방문해 계약서 작성 필수',
    '월 이용 횟수 제한 없으나, 한 지점당 1일 1회 입장 가능',
    '지점 등급 변경 시 1개월 전 운톡 앱 알림 및 안내 게시물로 고지',
  ],
};

const faqRef = () => doc(db, 'settings', 'faq');

export function newId(prefix = 'id'): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `${prefix}-${crypto.randomUUID()}`;
  } catch { /* ignore */ }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const emptyFaqItem = (): FaqItem => ({ id: newId('faq'), question: '', answer: '' });
export const emptyFaqCategory = (): FaqCategory => ({ id: newId('cat'), name: '', items: [emptyFaqItem()] });

function normalizeItem(x: unknown): FaqItem | null {
  const o = (x ?? {}) as Partial<FaqItem>;
  if (!o.id || typeof o.id !== 'string') return null;
  return { id: o.id, question: typeof o.question === 'string' ? o.question : '', answer: typeof o.answer === 'string' ? o.answer : '' };
}

function normalizeCategory(x: unknown): FaqCategory | null {
  const o = (x ?? {}) as Partial<FaqCategory>;
  if (!o.id || typeof o.id !== 'string') return null;
  const items = Array.isArray(o.items) ? o.items.map(normalizeItem).filter((i): i is FaqItem => i !== null) : [];
  return { id: o.id, name: typeof o.name === 'string' ? o.name : '', items };
}

export function normalizeFaq(data: Partial<FaqData> | null | undefined): FaqData {
  const categories = Array.isArray(data?.categories)
    ? data!.categories.map(normalizeCategory).filter((c): c is FaqCategory => c !== null)
    : [];
  const notices = Array.isArray(data?.notices) ? data!.notices.filter((n): n is string => typeof n === 'string') : [];
  if (categories.length === 0) return { categories: DEFAULT_FAQ.categories, notices: notices.length ? notices : DEFAULT_FAQ.notices };
  return { categories, notices };
}

export function subscribeFaq(cb: (d: FaqData) => void, onError?: (e: Error) => void): () => void {
  return onSnapshot(
    faqRef(),
    (snap) => cb(normalizeFaq(snap.exists() ? (snap.data() as Partial<FaqData>) : null)),
    (e) => onError?.(e)
  );
}

export async function getFaq(): Promise<FaqData> {
  try {
    const snap = await getDoc(faqRef());
    return normalizeFaq(snap.exists() ? (snap.data() as Partial<FaqData>) : null);
  } catch {
    return normalizeFaq(null);
  }
}

export async function saveFaq(d: FaqData): Promise<void> {
  await setDoc(faqRef(), { ...d, updatedAt: serverTimestamp() });
}
