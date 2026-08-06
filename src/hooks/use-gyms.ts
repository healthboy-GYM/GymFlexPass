'use client';

import { useEffect, useState } from 'react';
import gymsData from '@/data/gyms_update.json';
import { subscribeGyms, type Gym } from '@/lib/gyms';

/**
 * Firestore Gym(정리된 스키마) → 기존 gyms_update.json 필드 형태로 변환.
 * 공개 사이트의 기존 소비자들이 필드명을 그대로 쓸 수 있게 하여 변경을 최소화한다.
 */
function toLegacyShape(g: Gym): any {
  return {
    c: g.name,
    name: g.name,
    address: g.address,
    region: g.region,
    tier: g.tier,
    lat: g.lat,
    lng: g.lng,
    phone: g.phone ?? '',
    hours: g.hours ?? '',
    transport: g.transport ?? '',
    description: g.description ?? '',
    'naverplace URL': g.naverPlaceUrl ?? '',
    naverplaceUrl: g.naverPlaceUrl ?? '',
    isNew: g.isNew ?? false,
    '24시간 운영여부': g.is24h ? 'O' : 'X',
    '무료주차시간': g.freeParkingHours ?? '',
    droneVideoUrl: g.droneVideoUrl ?? '',
  };
}

/**
 * 공개 사이트용 지점 데이터 훅.
 *
 * 안전 설계:
 * - 초기값 = 정적 JSON → 첫 렌더에 빈 화면 없음. Firestore 장애/빈 컬렉션이어도 기존 데이터 표시 유지.
 * - Firestore 에 지점이 1개 이상 있으면 실시간 데이터로 교체 → 관리자 편집이 즉시 방문자에게 반영.
 *
 * 반환 형태는 기존 JSON 과 동일(레거시 필드명 포함)하여 소비자 코드 변경을 최소화한다.
 */
export function useGyms(): { gyms: any[]; loading: boolean } {
  const [gyms, setGyms] = useState<any[]>(gymsData as any[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeGyms(
      (fsGyms) => {
        // Firestore 에 데이터가 있을 때만 교체. 없으면 JSON 폴백 유지.
        if (fsGyms.length > 0) setGyms(fsGyms.map(toLegacyShape));
        setLoading(false);
      },
      {
        onError: (e) => {
          console.error('지점 데이터 구독 오류(폴백 JSON 사용):', e);
          setLoading(false);
        },
      }
    );
    return () => unsub();
  }, []);

  return { gyms, loading };
}
