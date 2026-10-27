/**
 * 헬보올패스 상품/가격 설정 (단일 문서 settings/pricing).
 * 관리자가 상품(등급)을 추가/삭제/수정하고, 상품별 이름·설명·기간별 가격·결제링크를 편집.
 * 구매 페이지가 이를 실시간 반영.
 * - 읽기: 공개, 쓰기: 관리자만 (firestore.rules의 settings/{docId} 규칙)
 * - 문서가 없거나 비어 있으면 DEFAULT_PRODUCTS로 폴백 → 사이트가 항상 안전하게 동작.
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

/** 이용 기간(개월) — 고정. */
export const DURATIONS = ['1', '3', '6'] as const;
export type Duration = (typeof DURATIONS)[number];

export const DURATION_LABELS: Record<Duration, string> = { '1': '1개월', '3': '3개월', '6': '6개월' };

export interface PriceEntry {
  price: number; // 결제 금액(원)
  link: string;  // 외부 결제(운톡) 링크
}

export type PriceMap = Record<Duration, PriceEntry>;

export interface Product {
  id: string;            // 안정적 식별자
  name: string;          // 상품명(예: 프리미엄 올패스)
  description?: string;  // 설명 문구(구매 페이지 카드에 표시, 선택)
  prices: PriceMap;      // 기간별 가격·링크
}

export interface PricingConfig {
  products: Product[];
}

/** 현재 운영 중인 기본 상품/가격/링크(폴백). 관리자가 저장하기 전에도 이 값으로 표시된다. */
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 's-premium',
    name: 'S-프리미엄 올패스',
    description: '',
    prices: {
      '1': { price: 180000, link: 'https://bmarket.broj.co.kr/products/253448' },
      '3': { price: 405000, link: 'https://bmarket.broj.co.kr/products/253364' },
      '6': { price: 600000, link: 'https://bmarket.broj.co.kr/products/253280' },
    },
  },
  {
    id: 'premium',
    name: '프리미엄 올패스',
    description: '',
    prices: {
      '1': { price: 152000, link: 'https://bmarket.broj.co.kr/products/253852' },
      '3': { price: 365000, link: 'https://bmarket.broj.co.kr/products/253775' },
      '6': { price: 547000, link: 'https://bmarket.broj.co.kr/products/253690' },
    },
  },
  {
    id: 'gold',
    name: '골드 올패스',
    description: '',
    prices: {
      '1': { price: 124000, link: 'https://bmarket.broj.co.kr/products/254133' },
      '3': { price: 298000, link: 'https://bmarket.broj.co.kr/products/254064' },
      '6': { price: 446000, link: 'https://bmarket.broj.co.kr/products/253995' },
    },
  },
  {
    id: 'silver',
    name: '실버 올패스',
    description: '',
    prices: {
      '1': { price: 110000, link: 'https://bmarket.broj.co.kr/products/254326' },
      '3': { price: 264000, link: 'https://bmarket.broj.co.kr/products/254298' },
      '6': { price: 396000, link: 'https://bmarket.broj.co.kr/products/254243' },
    },
  },
  {
    id: 'black',
    name: '블랙 올패스',
    description: '',
    prices: {
      '1': { price: 99000, link: 'https://bmarket.broj.co.kr/products/254414' },
      '3': { price: 211000, link: 'https://bmarket.broj.co.kr/products/254392' },
      '6': { price: 317000, link: 'https://bmarket.broj.co.kr/products/254370' },
    },
  },
];

const pricingRef = () => doc(db, 'settings', 'pricing');

/** 새 상품 생성용 빈 가격 맵. */
export function emptyPriceMap(): PriceMap {
  return {
    '1': { price: 0, link: '' },
    '3': { price: 0, link: '' },
    '6': { price: 0, link: '' },
  };
}

/** 안전한 고유 id 생성(브라우저). */
export function newProductId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `p-${crypto.randomUUID()}`;
    }
  } catch {
    /* ignore */
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 하나의 가격 항목을 안전하게 정규화. */
function normalizeEntry(e: unknown): PriceEntry {
  const obj = (e ?? {}) as Partial<PriceEntry>;
  const price = typeof obj.price === 'number' && obj.price >= 0 ? obj.price : 0;
  const link = typeof obj.link === 'string' ? obj.link : '';
  return { price, link };
}

/** 하나의 상품을 안전하게 정규화(모든 기간 키 보장). */
function normalizeProduct(p: unknown): Product | null {
  const obj = (p ?? {}) as Partial<Product>;
  if (!obj.id || typeof obj.id !== 'string') return null;
  const prices = {} as PriceMap;
  for (const d of DURATIONS) {
    prices[d] = normalizeEntry(obj.prices?.[d]);
  }
  return {
    id: obj.id,
    name: typeof obj.name === 'string' ? obj.name : '',
    description: typeof obj.description === 'string' ? obj.description : '',
    prices,
  };
}

/**
 * 저장된 데이터를 정규화해 항상 완전한 상품 목록을 만든다.
 * 상품이 하나도 없으면 DEFAULT_PRODUCTS로 폴백 → 구매 페이지가 절대 비지 않음.
 */
export function normalizeConfig(data: Partial<PricingConfig> | null | undefined): Product[] {
  const raw = Array.isArray(data?.products) ? data!.products : [];
  const products = raw.map(normalizeProduct).filter((p): p is Product => p !== null);
  return products.length > 0 ? products : DEFAULT_PRODUCTS.map((p) => ({ ...p, prices: { ...p.prices } }));
}

/** 실시간 구독. 항상 정규화된 상품 목록을 콜백으로 전달. */
export function subscribePricing(
  cb: (products: Product[]) => void,
  onError?: (e: Error) => void
): () => void {
  return onSnapshot(
    pricingRef(),
    (snap) => cb(normalizeConfig(snap.exists() ? (snap.data() as Partial<PricingConfig>) : null)),
    (e) => onError?.(e)
  );
}

export async function getPricing(): Promise<Product[]> {
  try {
    const snap = await getDoc(pricingRef());
    return normalizeConfig(snap.exists() ? (snap.data() as Partial<PricingConfig>) : null);
  } catch {
    return normalizeConfig(null);
  }
}

export async function savePricing(products: Product[]): Promise<void> {
  // 배열 필드는 merge로 부분 병합되지 않고 통째로 교체되어야 하므로 merge:false로 저장.
  await setDoc(pricingRef(), { products, updatedAt: serverTimestamp() });
}
