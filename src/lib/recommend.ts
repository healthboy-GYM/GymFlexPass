/**
 * 동선 진단 등급 추천 — 순수 계산(등급·거리·선호도). 서버 비밀 불필요.
 * 지도(BranchLocator)의 라이브 지점 데이터를 그대로 받아 계산하므로,
 * 정적 JSON과 라이브 Firestore가 달라도 항상 일치한다.
 */
export interface RecoGym {
  c: string;
  name: string;
  tier: string;
  lat: number;
  lng: number;
  종목?: string;
  GX프로그램?: string;
  무료주차시간?: string | null;
  부대시설?: string;
  안마의자_유무?: boolean;
  웨이트브랜드?: string;
}

export interface GymRecommendationInput {
  selectedGymIds: string[];
  preferences?: { sports?: string[]; amenities?: string[]; brands?: string[] };
}

export interface AvailabilityInfo {
  gymName: string;
  tier: string;
  availabilityNote: string;
  matchReasons: string[];
}

export interface GymRecommendationOutput {
  recommendedTier: string;
  reason: string;
  availability: AvailabilityInfo[];
  limitations: string;
}

const tierOrder = ['S Premium', 'Premium', 'Gold', 'Silver', 'Black'];
const tierNormalizationMap: Record<string, string> = {
  'S-PREMIUM': 'S Premium',
  PREMIUM: 'Premium',
  GOLD: 'Gold',
  SILVER: 'Silver',
  BLACK: 'Black',
};
const normalizeTier = (tier: string): string => {
  const upperTier = (tier || '').toUpperCase().replace(/\s+/g, '-');
  return tierNormalizationMap[upperTier] || tier;
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export function recommendGymPass(
  input: GymRecommendationInput,
  gyms: RecoGym[]
): GymRecommendationOutput {
  const { selectedGymIds, preferences = {} } = input;
  if (selectedGymIds.length === 0) throw new Error('No gyms selected.');

  const allGyms = (gyms || []).map((g) => ({ ...g, id: g.c }));
  const selectedGyms = allGyms
    .filter((gym) => selectedGymIds.includes(gym.c))
    .map((gym) => ({ ...gym, tier: normalizeTier(gym.tier) }))
    .sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));

  if (selectedGyms.length === 0) {
    throw new Error('No gyms found for the provided IDs.');
  }

  const scoreGym = (gym: RecoGym): number => {
    let score = 0;
    const normalizedGymTier = normalizeTier(gym.tier);
    score += (tierOrder.length - tierOrder.indexOf(normalizedGymTier)) * 10;
    if (preferences.sports) {
      const sportsOffered = gym.종목?.split('·') || [];
      if (preferences.sports.some((s) => sportsOffered.includes(s))) score += 30;
    }
    if (preferences.amenities) {
      if (preferences.amenities.includes('parking') && gym['무료주차시간'] && gym['무료주차시간'] !== 'X') score += 20;
      if (preferences.amenities.includes('sauna') && gym.부대시설?.includes('사우나')) score += 20;
      if (preferences.amenities.includes('relax_zone') && gym.안마의자_유무) score += 15;
    }
    if (preferences.brands && gym.웨이트브랜드) {
      if (preferences.brands.some((b) => gym.웨이트브랜드!.toLowerCase().includes(b.toLowerCase()))) score += 25;
    }
    const centerPoint = selectedGyms.reduce((acc, g) => ({ lat: acc.lat + g.lat, lng: acc.lng + g.lng }), { lat: 0, lng: 0 });
    centerPoint.lat /= selectedGyms.length;
    centerPoint.lng /= selectedGyms.length;
    score -= getDistance(centerPoint.lat, centerPoint.lng, gym.lat, gym.lng);
    return score;
  };

  const scoredGyms = allGyms.map((gym) => ({ ...gym, score: scoreGym(gym) }));
  const highestTierFromSelection = selectedGyms[0].tier;
  const recommendedTierIndex = tierOrder.indexOf(highestTierFromSelection);

  const potentialUpgrades = scoredGyms
    .filter((gym) => tierOrder.indexOf(normalizeTier(gym.tier)) <= recommendedTierIndex)
    .sort((a, b) => b.score - a.score);

  const bestGym = potentialUpgrades[0];
  const recommendedTier = bestGym ? normalizeTier(bestGym.tier) : highestTierFromSelection;

  let reason = `선택하신 지점들을 모두 이용하려면 최소 '${highestTierFromSelection}' 등급이 필요합니다. `;
  if (recommendedTier !== highestTierFromSelection) {
    reason += `하지만 회원님의 선호도(${[...(preferences.sports || []), ...(preferences.amenities || [])].join(', ')})를 분석한 결과, '${recommendedTier}' 등급의 '${bestGym.name}'이 최적의 경험을 제공할 것으로 보입니다. '${recommendedTier}' 패스로 업그레이드하면 더 많은 프리미엄 시설을 이용할 수 있습니다.`;
  } else {
    reason += `또한 이 등급은 회원님의 운동 목표와 선호도에 가장 부합하는 최적의 선택입니다.`;
  }

  let limitations = '';
  const finalRecommendedTierIndex = tierOrder.indexOf(recommendedTier);
  const lowerTierIndex = finalRecommendedTierIndex + 1;
  if (lowerTierIndex < tierOrder.length) {
    const lowerTier = tierOrder[lowerTierIndex];
    const inaccessibleGyms = selectedGyms
      .filter((g) => tierOrder.indexOf(g.tier) === finalRecommendedTierIndex)
      .map((g) => g.name)
      .join(', ');
    limitations = inaccessibleGyms
      ? `만약 한 등급 낮은 '${lowerTier}' 패스를 선택하시면, 선택하신 지점 중 ${inaccessibleGyms} 지점은 이용할 수 없게 됩니다.`
      : `'${lowerTier}' 패스를 선택하셔도 현재 선택하신 모든 지점을 이용하실 수 있습니다. 하지만 추천된 '${recommendedTier}' 패스가 제공하는 더 넓은 범위의 혜택은 누릴 수 없습니다.`;
  } else {
    limitations = '추천된 패스가 가장 낮은 등급이므로 더 낮은 등급의 패스는 없습니다.';
  }

  const availability = selectedGyms.map((gym) => {
    const gymTierIndex = tierOrder.indexOf(normalizeTier(gym.tier));
    const note =
      gymTierIndex >= finalRecommendedTierIndex
        ? `이 패스로 이용 가능합니다.`
        : `이 패스로는 이용이 제한됩니다. '${normalizeTier(gym.tier)}' 등급 이상의 패스가 필요합니다.`;
    const matchReasons: string[] = [];
    if (preferences.sports) {
      const sportsOffered = gym.종목?.split('·') || [];
      preferences.sports.forEach((s) => { if (sportsOffered.includes(s)) matchReasons.push(`${s} 가능`); });
    }
    if (preferences.amenities) {
      if (preferences.amenities.includes('parking') && gym['무료주차시간'] && gym['무료주차시간'] !== 'X') matchReasons.push(`무료주차 (${gym['무료주차시간']})`);
      if (preferences.amenities.includes('sauna') && gym.부대시설?.includes('사우나')) matchReasons.push('사우나 이용 가능');
      if (preferences.amenities.includes('relax_zone') && gym.안마의자_유무) matchReasons.push('안마의자/힐링존');
    }
    if (preferences.brands && gym.웨이트브랜드) {
      preferences.brands.forEach((b) => { if (gym.웨이트브랜드!.toLowerCase().includes(b.toLowerCase())) matchReasons.push(`${b} 기구 보유`); });
    }
    return { gymName: gym.name, tier: normalizeTier(gym.tier), availabilityNote: note, matchReasons };
  });

  return { recommendedTier, reason, limitations, availability };
}
