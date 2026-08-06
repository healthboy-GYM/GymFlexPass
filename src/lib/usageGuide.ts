/**
 * 이용안내(이용 프로세스) 콘텐츠 (단일 문서 settings/usageGuide).
 * 관리자가 단계(제목/내용/팁)와 하단 안내 카드 2종을 편집. /usage-guide 페이지가 실시간 반영.
 * - 읽기 공개 / 쓰기 관리자 (firestore.rules settings/{docId})
 * - 문서가 없으면 DEFAULT_USAGE_GUIDE로 폴백(현재 사이트 내용 유지).
 * - 내용 줄(content)·카드 줄(lines)은 **굵게** 마크다운 지원.
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export interface GuideStep {
  id: string;
  title: string;
  content: string[]; // 단계 설명 줄(각 줄 = 체크 항목), **굵게** 지원
  tip?: string;      // 선택 팁
}

export interface GuideCard {
  title: string;
  lines: string[];
}

export interface UsageGuideData {
  steps: GuideStep[];
  benefit: GuideCard; // 헬보올패스만의 특별 혜택
  caution: GuideCard; // 꼭 확인해주세요!
}

export const DEFAULT_USAGE_GUIDE: UsageGuideData = {
  steps: [
    {
      id: 'step-1',
      title: '웹페이지 정보 확인 및 구매 시작',
      content: [
        '헬보올패스 웹페이지에서 회원님께 딱 맞는 상품과 전국 80여개 지점의 상세 정보를 충분히 확인합니다.',
        '‘결제하기’ 버튼을 클릭하면 운톡 결제 페이지로 자동 이동됩니다.',
      ],
    },
    {
      id: 'step-2',
      title: '운톡 결제 페이지에서 회원가입/로그인 및 결제 완료',
      content: [
        '운톡 결제 페이지에서 회원가입 또는 기존 계정으로 로그인 후 결제를 진행합니다.',
        '결제가 완료되면 기본적인 회원 정보가 등록됩니다.',
      ],
      tip: '올패스 이용 시작 날짜는 주 이용지점 방문 전 계약서 작성 시 최종 조정할 수 있습니다.',
    },
    {
      id: 'step-3',
      title: '주 이용지점 방문 및 계약서 작성 (필수!)',
      content: [
        '결제 완료 후 **반드시** 선택하신 주 이용지점에 방문하여 지류 계약서를 작성해야 합니다.',
        '계약서 작성은 회원님의 이용 권한을 공식 등록하고, 구매 정보를 시스템에 최종 반영하는 **필수 절차**입니다.',
        '주 이용지점은 계약 관리 및 고객 응대(환불, 문의, 트레이너 배정 등)를 담당하는 중요한 거점입니다.',
      ],
    },
    {
      id: 'step-4',
      title: '신규 / 기존회원 기준 사용 안내',
      content: [
        '지점 회원권 필수 보유 조건으로 가입이 가능하며, 헬스 종목만 해당됩니다.',
        '전국 80여개 지점 중 회원님이 구매한 등급과 그 하위 등급 지점에서 자유롭게 이용가능합니다.',
        '멤버십 연기 및 양도는 불가능합니다.',
        '가입 시점의 지점 회원권 보유 기간과 동일하게 적용됩니다.',
      ],
    },
    {
      id: 'step-5',
      title: '운톡 앱에서 연동 확인 및 지점 이용',
      content: [
        '계약서 작성 후 운톡 앱 ‘마이페이지’에서 헬보올패스 상품이 정상 활성화되었는지 확인합니다.',
        '전국 헬스보이짐 지점 방문 시, 운톡 앱의 QR 코드 또는 안면인식으로 간편하게 출입할 수 있습니다.',
        '안면인식이 어려운 경우 QR 체크인으로 출입 가능합니다.',
        '월 횟수 제한 없이 이용 가능하며, **한 지점당 1일 1회 입장이 원칙**입니다.',
      ],
    },
  ],
  benefit: {
    title: '헬보올패스만의 특별 혜택',
    lines: [
      '골프, 필라테스 등 특정 종목 등록 시에도 헬스시설은 전국 80여개 지점에서 헬보올패스로 자유롭게 이용 가능합니다.',
      '단, PT, 필라테스 등 부가 서비스는 각 지점에서 별도 계약이 필요합니다.',
    ],
  },
  caution: {
    title: '꼭 확인해주세요!',
    lines: [
      '헬스보이짐 각 지점 등급은 운영 상황에 따라 변경될 수 있으며, 등급 변경 1개월 전 운톡 앱 알림, 웹사이트 공지, 지점 안내 게시물로 사전 안내됩니다.',
      '궁금한 점이나 변경 사항 발생 시 주 이용지점 또는 헬스보이짐 고객센터로 문의해 주세요.',
    ],
  },
};

const guideRef = () => doc(db, 'settings', 'usageGuide');

export function newStepId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `step-${crypto.randomUUID()}`;
  } catch { /* ignore */ }
  return `step-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const emptyStep = (): GuideStep => ({ id: newStepId(), title: '', content: [''] });

function normalizeCard(x: unknown, fallback: GuideCard): GuideCard {
  const o = (x ?? {}) as Partial<GuideCard>;
  return {
    title: typeof o.title === 'string' ? o.title : fallback.title,
    lines: Array.isArray(o.lines) ? o.lines.filter((l): l is string => typeof l === 'string') : fallback.lines,
  };
}

function normalizeStep(x: unknown): GuideStep | null {
  const o = (x ?? {}) as Partial<GuideStep>;
  if (!o.id || typeof o.id !== 'string') return null;
  return {
    id: o.id,
    title: typeof o.title === 'string' ? o.title : '',
    content: Array.isArray(o.content) ? o.content.filter((c): c is string => typeof c === 'string') : [],
    tip: typeof o.tip === 'string' && o.tip.trim() ? o.tip : undefined,
  };
}

export function normalizeGuide(data: Partial<UsageGuideData> | null | undefined): UsageGuideData {
  const steps = Array.isArray(data?.steps) ? data!.steps.map(normalizeStep).filter((s): s is GuideStep => s !== null) : [];
  return {
    steps: steps.length ? steps : DEFAULT_USAGE_GUIDE.steps,
    benefit: normalizeCard(data?.benefit, DEFAULT_USAGE_GUIDE.benefit),
    caution: normalizeCard(data?.caution, DEFAULT_USAGE_GUIDE.caution),
  };
}

export function subscribeGuide(cb: (d: UsageGuideData) => void, onError?: (e: Error) => void): () => void {
  return onSnapshot(
    guideRef(),
    (snap) => cb(normalizeGuide(snap.exists() ? (snap.data() as Partial<UsageGuideData>) : null)),
    (e) => onError?.(e)
  );
}

export async function getGuide(): Promise<UsageGuideData> {
  try {
    const snap = await getDoc(guideRef());
    return normalizeGuide(snap.exists() ? (snap.data() as Partial<UsageGuideData>) : null);
  } catch {
    return normalizeGuide(null);
  }
}

export async function saveGuide(d: UsageGuideData): Promise<void> {
  await setDoc(guideRef(), { ...d, updatedAt: serverTimestamp() });
}
