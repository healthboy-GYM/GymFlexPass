'use server';

import gymsData from '@/data/gyms_update.json';

export type GeocodeResult = { lat: number; lng: number } | { error: string };

/**
 * 주소 → 위경도 (네이버 클라우드 Geocoding, 서버 전용).
 * 필요한 서버 환경변수(클라이언트에 노출 금지):
 *   NAVER_GEOCODE_CLIENT_ID     (X-NCP-APIGW-API-KEY-ID)
 *   NAVER_GEOCODE_CLIENT_SECRET (X-NCP-APIGW-API-KEY)
 * 그리고 네이버 클라우드 콘솔에서 Maps > Geocoding 서비스가 활성화되어 있어야 함.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const id = process.env.NAVER_GEOCODE_CLIENT_ID;
  const secret = process.env.NAVER_GEOCODE_CLIENT_SECRET;
  if (!id || !secret) {
    return { error: '지오코딩 API 키(NAVER_GEOCODE_CLIENT_ID/SECRET)가 서버에 설정되지 않았습니다.' };
  }
  const query = address?.trim();
  if (!query) return { error: '주소를 먼저 입력하세요.' };

  try {
    const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': id,
        'X-NCP-APIGW-API-KEY': secret,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      return { error: `지오코딩 요청 실패 (${res.status}). 키/서비스 활성화를 확인하세요.` };
    }
    const data: any = await res.json();
    const addr = data?.addresses?.[0];
    if (!addr) return { error: '해당 주소의 좌표를 찾지 못했습니다. 주소를 확인해 주세요.' };
    // 네이버 응답: x=경도(lng), y=위도(lat)
    return { lat: parseFloat(addr.y), lng: parseFloat(addr.x) };
  } catch (e: any) {
    return { error: '지오코딩 중 오류가 발생했습니다: ' + (e?.message ?? '') };
  }
}

// Data types
interface Gym {
  c: string; // name
  name: string;
  tier: string;
  lat: number;
  lng: number;
  region: string;
  종목?: string;
  GX프로그램?: string;
  "무료주차시간"?: string | null;
  부대시설?: string;
  안마의자_유무?: boolean;
  웨이트브랜드?: string;
}

interface AvailabilityInfo {
  gymName: string;
  tier: string;
  availabilityNote: string;
  matchReasons: string[];
}

export interface GymRecommendationInput {
  selectedGymIds: string[];
  preferences?: {
    sports?: string[];
    amenities?: string[];
    brands?: string[];
  };
}

export interface GymRecommendationOutput {
  recommendedTier: string;
  reason: string;
  availability: AvailabilityInfo[];
  limitations: string;
}

const allGyms: Gym[] = (gymsData as any[]).map((gym) => ({
  ...gym,
  id: gym.c,
}));

const tierOrder = ['S Premium', 'Premium', 'Gold', 'Silver', 'Black'];

const tierNormalizationMap: { [key: string]: string } = {
  'S-PREMIUM': 'S Premium',
  PREMIUM: 'Premium',
  GOLD: 'Gold',
  SILVER: 'Silver',
  BLACK: 'Black',
};

const normalizeTier = (tier: string): string => {
  const upperTier = tier.toUpperCase().replace(/\s+/g, '-');
  return tierNormalizationMap[upperTier] || tier;
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    }
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Main exported function
export async function recommendGymPass(
  input: GymRecommendationInput
): Promise<GymRecommendationOutput> {
  const { selectedGymIds, preferences = {} } = input;

  if (selectedGymIds.length === 0) {
    throw new Error('No gyms selected.');
  }

  const selectedGyms = allGyms
    .filter((gym) => selectedGymIds.includes(gym.c))
    .map((gym) => ({ ...gym, tier: normalizeTier(gym.tier) }))
    .sort(
      (a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
    );

  if (selectedGyms.length === 0) {
    throw new Error(
      `No gyms found for the provided IDs. This can happen if the gym data is out of sync.`
    );
  }

  // --- Start of New Recommendation Logic ---
  
  let recommendationReasoning = [];
  const scoreGym = (gym: Gym): number => {
    let score = 0;
    const normalizedGymTier = normalizeTier(gym.tier);
    
    // 1. Base score on tier (higher tier gets higher score)
    score += (tierOrder.length - tierOrder.indexOf(normalizedGymTier)) * 10;

    // 2. Preferences scoring
    if (preferences.sports) {
      const sportsOffered = gym.종목?.split('·') || [];
      if (preferences.sports.some(sport => sportsOffered.includes(sport))) {
        score += 30;
      }
    }
    if (preferences.amenities) {
      if (preferences.amenities.includes('parking') && gym['무료주차시간'] && gym['무료주차시간'] !== 'X') score += 20;
      if (preferences.amenities.includes('sauna') && gym.부대시설?.includes('사우나')) score += 20;
      if (preferences.amenities.includes('relax_zone') && gym.안마의자_유무) score += 15;
    }
    if (preferences.brands && gym.웨이트브랜드) {
        if (preferences.brands.some(brand => gym.웨이트브랜드!.toLowerCase().includes(brand.toLowerCase()))) {
            score += 25;
        }
    }
    
    // 3. Proximity to selected gyms
    const centerPoint = selectedGyms.reduce((acc, g) => ({ lat: acc.lat + g.lat, lng: acc.lng + g.lng }), { lat: 0, lng: 0 });
    centerPoint.lat /= selectedGyms.length;
    centerPoint.lng /= selectedGyms.length;
    const distance = getDistance(centerPoint.lat, centerPoint.lng, gym.lat, gym.lng);
    score -= distance; // Closer gyms get higher score

    return score;
  }
  
  const scoredGyms = allGyms.map(gym => ({...gym, score: scoreGym(gym)}));
  
  // Highest tier from the user's explicit selection remains the minimum requirement
  const highestTierFromSelection = selectedGyms[0].tier;
  const recommendedTierIndex = tierOrder.indexOf(highestTierFromSelection);

  // Filter for gyms that meet the minimum tier and sort by score
  const potentialUpgrades = scoredGyms
    .filter(gym => tierOrder.indexOf(normalizeTier(gym.tier)) <= recommendedTierIndex)
    .sort((a, b) => b.score - a.score);

  // The top-scored gym determines the recommended tier
  const bestGym = potentialUpgrades[0];
  const recommendedTier = bestGym ? normalizeTier(bestGym.tier) : highestTierFromSelection;
  
  // --- End of New Recommendation Logic ---

  // Generate Reason
  let reason = `선택하신 지점들을 모두 이용하려면 최소 '${highestTierFromSelection}' 등급이 필요합니다. `;
  
  if (recommendedTier !== highestTierFromSelection) {
    reason += `하지만 AI가 회원님의 선호도(${[...(preferences.sports||[]), ...(preferences.amenities||[])].join(', ')})를 분석한 결과, '${recommendedTier}' 등급의 '${bestGym.name}'이 최적의 경험을 제공할 것으로 보입니다. '${recommendedTier}' 패스로 업그레이드하면 이 지점을 포함한 더 많은 프리미엄 시설을 이용할 수 있습니다.`;
  } else {
    reason += `또한 이 등급은 회원님의 운동 목표와 선호도에 가장 부합하는 최적의 선택입니다.`;
  }


  // Generate Limitations
  let limitations = '';
  const finalRecommendedTierIndex = tierOrder.indexOf(recommendedTier);
  const lowerTierIndex = finalRecommendedTierIndex + 1;

  if (lowerTierIndex < tierOrder.length) {
      const lowerTier = tierOrder[lowerTierIndex];
      // 한 등급 낮은 패스로 내리면 이용할 수 없게 되는 지점 = 추천 등급과 정확히 동일한 등급의 지점
      // (추천 등급 인덱스 R 패스는 gymIndex >= R 접근 가능, 한 단계 낮추면 gymIndex >= R+1 만 접근 → gymIndex === R 지점이 제외됨)
      const inaccessibleGyms = selectedGyms
          .filter(g => tierOrder.indexOf(g.tier) === finalRecommendedTierIndex)
          .map(g => g.name)
          .join(', ');
      
      if(inaccessibleGyms) {
          limitations = `만약 한 등급 낮은 '${lowerTier}' 패스를 선택하시면, 선택하신 지점 중 ${inaccessibleGyms} 지점은 이용할 수 없게 됩니다.`;
      } else {
           limitations = `'${lowerTier}' 패스를 선택하셔도 현재 선택하신 모든 지점을 이용하실 수 있습니다. 하지만 추천된 '${recommendedTier}' 패스가 제공하는 더 넓은 범위의 지점과 혜택은 누릴 수 없습니다.`;
      }
  } else {
      limitations = '추천된 패스가 가장 낮은 등급이므로 더 낮은 등급의 패스는 없습니다.';
  }
    
  // Construct the availability details programmatically
  const availability = selectedGyms.map((gym) => {
    const gymTierIndex = tierOrder.indexOf(normalizeTier(gym.tier));
    
    let note = '';
    if (gymTierIndex >= finalRecommendedTierIndex) {
      note = `이 패스로 이용 가능합니다.`;
    } else {
      note = `이 패스로는 이용이 제한됩니다. '${normalizeTier(gym.tier)}' 등급 이상의 패스가 필요합니다.`;
    }

    const matchReasons: string[] = [];
    if (preferences.sports) {
        const sportsOffered = gym.종목?.split('·') || [];
        preferences.sports.forEach(sport => {
            if (sportsOffered.includes(sport)) {
                matchReasons.push(`${sport} 가능`);
            }
        });
    }
    if (preferences.amenities) {
        if (preferences.amenities.includes('parking') && gym['무료주차시간'] && gym['무료주차시간'] !== 'X') {
            matchReasons.push(`무료주차 (${gym['무료주차시간']})`);
        }
        if (preferences.amenities.includes('sauna') && gym.부대시설?.includes('사우나')) {
            matchReasons.push('사우나 이용 가능');
        }
        if (preferences.amenities.includes('relax_zone') && gym.안마의자_유무) {
            matchReasons.push('안마의자/힐링존');
        }
    }
     if (preferences.brands && gym.웨이트브랜드) {
        preferences.brands.forEach(brand => {
            if (gym.웨이트브랜드!.toLowerCase().includes(brand.toLowerCase())) {
                matchReasons.push(`${brand} 기구 보유`);
            }
        });
    }


    return {
      gymName: gym.name,
      tier: normalizeTier(gym.tier),
      availabilityNote: note,
      matchReasons,
    };
  });

  return {
    recommendedTier,
    reason,
    limitations,
    availability,
  };
}
