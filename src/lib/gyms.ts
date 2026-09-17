/**
 * 지점(gym) 데이터 접근 계층.
 * 정적 JSON(src/data/gyms_update.json) → Firestore `gyms` 컬렉션으로 전환하기 위한
 * 단일 진입점. 공개 사이트와 관리자 페이지 모두 이 모듈만 사용한다.
 *
 * - 읽기: 공개(누구나) — 클라이언트 SDK
 * - 쓰기: 관리자만 (firestore.rules 의 isAdmin() 으로 제한)
 */

import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

const GYMS = 'gyms';

// ── 지점 스키마 (정리된 camelCase) ──────────────────────────────────────────
export interface Gym {
  id: string;               // Firestore 문서 ID
  name: string;             // 지점명 (예: '헬스보이짐 서울시청점')
  address: string;
  region: string;           // 예: '서울특별시'
  tier: string;             // 원본 표기 유지: 'S-PREMIUM' | 'PREMIUM' | 'GOLD' | 'SILVER' | 'BLACK'
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;
  transport?: string;
  description?: string;
  naverPlaceUrl?: string;
  freeParkingHours?: string; // 기존 '무료주차시간'
  is24h?: boolean;           // 기존 '24시간 운영여부'
  droneVideoUrl?: string;
  imageUrl?: string;         // 지점 대표 사진(전체 URL). 없으면 코드의 기본 사진(branchImages)로 폴백.
  isNew?: boolean;
  isActive: boolean;         // false 면 공개 사이트에서 숨김 (soft delete)
  order?: number;            // 정렬 순서 (작을수록 먼저)
}

export type GymInput = Omit<Gym, 'id'>;

// ── 읽기 ────────────────────────────────────────────────────────────────────

/** 지점 전체 조회. 기본은 활성 지점만(공개용). includeInactive=true 면 숨김 포함(관리자용). */
export async function fetchGyms(includeInactive = false): Promise<Gym[]> {
  const snap = await getDocs(query(collection(db, GYMS), orderBy('name')));
  const gyms = snap.docs.map((d) => ({ id: d.id, ...(d.data() as GymInput) }));
  return includeInactive ? gyms : gyms.filter((g) => g.isActive !== false);
}

/** 실시간 구독 (관리자 목록/공개 지도에서 사용). 반환값을 호출하면 구독 해제. */
export function subscribeGyms(
  onData: (gyms: Gym[]) => void,
  options: { includeInactive?: boolean; onError?: (e: Error) => void } = {}
): () => void {
  const q = query(collection(db, GYMS), orderBy('name'));
  return onSnapshot(
    q,
    (snap) => {
      const gyms = snap.docs.map((d) => ({ id: d.id, ...(d.data() as GymInput) }));
      onData(options.includeInactive ? gyms : gyms.filter((g) => g.isActive !== false));
    },
    (err) => options.onError?.(err)
  );
}

// ── 쓰기 (관리자) ───────────────────────────────────────────────────────────

export async function addGym(input: GymInput): Promise<string> {
  const ref = await addDoc(collection(db, GYMS), { ...input, updatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateGym(id: string, patch: Partial<GymInput>): Promise<void> {
  await updateDoc(doc(db, GYMS, id), { ...patch, updatedAt: serverTimestamp() });
}

/** 완전 삭제. 회원 이력 보호를 위해 보통은 setGymActive(id,false)(숨김)를 권장. */
export async function deleteGym(id: string): Promise<void> {
  await deleteDoc(doc(db, GYMS, id));
}

/** 숨김/표시 토글 (soft delete). */
export async function setGymActive(id: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, GYMS, id), { isActive, updatedAt: serverTimestamp() });
}

// ── 마이그레이션 (기존 JSON → Firestore) ────────────────────────────────────

/** 기존 gyms_update.json 한 레코드(원본 필드명)를 새 스키마로 변환. */
export function mapLegacyGym(raw: any): GymInput {
  return {
    name: (raw.name ?? raw.c ?? '').trim(),
    address: raw.address ?? '',
    region: raw.region ?? '',
    tier: raw.tier ?? '',
    lat: Number(raw.lat) || 0,
    lng: Number(raw.lng) || 0,
    phone: raw.phone ?? '',
    hours: raw.hours ?? '',
    transport: raw.transport ?? '',
    description: raw.description ?? '',
    naverPlaceUrl: raw['naverplace URL'] ?? raw.naverplaceUrl ?? raw.naverplaceURL ?? '',
    freeParkingHours: raw['무료주차시간'] ?? '',
    is24h: raw['24시간 운영여부'] === 'O' || raw['24시간 운영여부'] === true,
    droneVideoUrl: raw.droneVideoUrl ?? '',
    imageUrl: raw.imageUrl ?? '',
    isNew: !!raw.isNew,
    isActive: true,
    order: 0,
  };
}

/**
 * 기존 JSON 배열을 Firestore 로 일괄 이관 (관리자 "가져오기" 버튼에서 호출).
 * 기본은 안전을 위해 컬렉션이 비어 있을 때만 실행(중복 방지). force=true 면 덮어씀.
 * @returns 실제로 기록한 지점 수 (0이면 이미 데이터가 있어 건너뜀)
 */
export async function importLegacyGyms(rawList: any[], force = false): Promise<number> {
  const existing = await getDocs(collection(db, GYMS));
  if (!existing.empty && !force) return 0;

  const batch = writeBatch(db);
  rawList.forEach((raw) => {
    const mapped = mapLegacyGym(raw);
    // 지점명을 문서 ID로 사용 → 재실행해도 중복 생성되지 않음(idempotent).
    const id = mapped.name || doc(collection(db, GYMS)).id;
    batch.set(doc(db, GYMS, id), { ...mapped, updatedAt: serverTimestamp() });
  });
  await batch.commit();
  return rawList.length;
}
