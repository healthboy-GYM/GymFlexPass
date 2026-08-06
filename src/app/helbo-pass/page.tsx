
'use client';

import { useState, useEffect, useMemo } from 'react';
import { subscribePricing, DEFAULT_PRODUCTS, type Product } from '@/lib/pricing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Crown, Gem, Medal, BarChart3, Heart, CheckCircle, XCircle, MapPin, ShoppingCart, ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import gymsData from '@/data/gyms_update.json';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';


const passTiersData = [
  {
    id: 's-premium',
    name: 'S-PREMIUM',
    koreanName: 'S-프리미엄 올패스',
    tier: 'S Premium',
    icon: Crown,
    badge: { text: '👑 All Access' },
    summary: '모든 지점 이용 가능',
    availableTiers: ['S Premium', 'Premium', 'Gold', 'Silver', 'Black'],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    koreanName: '프리미엄 올패스',
    tier: 'Premium',
    icon: Gem,
    badge: { text: '⭐ 추천' },
    summary: 'S-Premium 등급 제외 이용',
    availableTiers: ['Premium', 'Gold', 'Silver', 'Black'],
  },
  {
    id: 'gold',
    name: 'GOLD',
    koreanName: '골드 올패스',
    tier: 'Gold',
    icon: Medal,
    badge: { text: '👥 가장 인기' },
    summary: 'Gold, Silver, Black 이용',
    availableTiers: ['Gold', 'Silver', 'Black'],
  },
  {
    id: 'silver',
    name: 'SILVER',
    koreanName: '실버 올패스',
    tier: 'Silver',
    icon: BarChart3,
    badge: { text: '👍 가성비' },
    summary: 'Silver, Black 이용',
    availableTiers: ['Silver', 'Black'],
  },
  {
    id: 'black',
    name: 'BLACK',
    koreanName: '블랙 올패스',
    tier: 'Black',
    icon: Heart,
    badge: { text: '입문용' },
    summary: 'Black 등급 지점만 이용',
    availableTiers: ['Black'],
  },
];

// 등급 표시명: 상품명에서 ' 올패스' 접미사 제거(예: '프리미엄 올패스' → '프리미엄').
const shortTierName = (name: string) => name.replace(/\s*올패스$/, '').trim();

// 업그레이드 표에 노출할 등급 조합(상품 id 기준 → 상품명을 바꿔도 안전).
// 가격은 CMS 상품가의 차액으로 자동 계산(상위등급가 - 하위등급가).
const UPGRADE_PAIRS: { from: string; to: string }[] = [
  { from: 'black', to: 'premium' },
  { from: 'black', to: 'gold' },
  { from: 'black', to: 'silver' },
  { from: 'silver', to: 'premium' },
  { from: 'silver', to: 'gold' },
  { from: 'gold', to: 'premium' },
];

interface UpgradeRow {
  from: string; to: string;
  fromP1: number; fromP3: number; fromP6: number;
  addP1: number; addP3: number; addP6: number;
}


const tierOrder = ['S Premium', 'Premium', 'Gold', 'Silver', 'Black'];
const sortedPassTiers = passTiersData.sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));

const tierNormalizationMap: { [key: string]: string } = {
  'S-PREMIUM': 'S Premium', 'PREMIUM': 'Premium', 'GOLD': 'Gold', 'SILVER': 'Silver', 'BLACK': 'Black',
};

const normalizeTier = (tier: string): string => {
  const upperTier = tier.toUpperCase().replace(/\s+/g, '-');
  return tierNormalizationMap[upperTier] || tier;
};

const shortenRegionName = (region: string) => {
    switch(region) {
        case '서울특별시': return '서울';
        case '대전광역시': return '대전';
        case '부산광역시': return '부산';
        case '경기도': return '경기';
        case '충청남도': return '충남';
        case '충청북도': return '충북';
        case '울산광역시': return '울산';
        case '경상남도': return '경남';
        case '전라북도': return '전북';
        case '대구광역시': return '대구';
        default: return region;
    }
};

const uniqueGymsMap = new Map<string, any>();
(gymsData as any[]).forEach(gym => {
  if (!uniqueGymsMap.has(gym.c)) {
    uniqueGymsMap.set(gym.c, gym);
  }
});
const uniqueGymsData = Array.from(uniqueGymsMap.values());


const allGyms = uniqueGymsData.map(gym => ({
  ...gym,
  id: gym.c,
  tier: normalizeTier(gym.tier),
  name: gym.name.replace('헬스보이짐', '').trim()
}));

const tierSummaryData = [
    {
        tier: "Black",
        name: "블랙",
        count: allGyms.filter(g => g.tier === 'Black').length,
        description: "BLACK 지점만 이용가능",
        availableIcons: ["B"],
        color: "bg-neutral-800",
        gymsByRegion: {
            "서울": ["가양역점"],
            "경기": ["비전점", "철산점", "평택역점"],
            "대전": ["가오점"],
            "충북": ["복대점"],
            "부산": ["당리점", "서면점", "하단점"],
            "경남": ["창원중앙점"],
        }
    },
    {
        tier: "Silver",
        name: "실버",
        count: allGyms.filter(g => g.tier === 'Silver').length,
        description: "BLACK+SILVER 이용가능",
        availableIcons: ["B", "S"],
        color: "bg-slate-500",
        gymsByRegion: {
             "서울": ["당산역점", "문래역점","강남역점", "가산역점","불광점", "서울시청점", "신논현점", "을지로점", "장안점", "학동역점"],
            "경기": ["상현점", "죽전점", "영통판타지움점", "상록수역점","고양행신점", "병점점", "부천역점", "안산중앙점", "배곧점", "일산주엽점"],
            "대전": ["둔산점", "대전시청점", "탄방점", "대전터미널점", "목원대점", "월평점", "NC대전유성점", "관저점"],
            "충남": ["쌍용점"],
        }
    },
    {
        tier: "Gold",
        name: "골드",
        count: allGyms.filter(g => g.tier === 'Gold').length,
        description: "BLACK+SILVER+GOLD 이용가능",
        availableIcons: ["B", "S", "G"],
        color: "bg-yellow-500",
        gymsByRegion: {
            "서울": ["상암mbc점", "선릉점", "양천향교역점", "영등포점", "홍대점", "여의도점"],
            "경기": ["광교점", "권선점", "망포점", "미금점", "수내점", "수지점", "인계점", "정자점", "천천점"],
            "대전": ["도안점", "태평점", "테크노밸리점"],
            "충남": ["신부점"],
            "울산": ["삼산점"],
            "대구": ["롯데대구역점"],
        }
    },
    {
        tier: "Premium",
        name: "프리미엄",
        count: allGyms.filter(g => g.tier === 'Premium').length,
        description: "BLACK+SILVER+GOLD+P 이용가능",
        availableIcons: ["B", "S", "G", "P"],
        color: "bg-blue-500",
        gymsByRegion: {
            "서울": ["강남고속터미널점", "건대스타시티몰점", "문정역점", "여의도역점", "잠실점"],
            "경기": ["매탄점", "판교역점"],
            "대전": ["송촌점"],
        }
    },
    {
        tier: "S Premium",
        name: "S-프리미엄",
        count: allGyms.filter(g => g.tier === 'S Premium').length,
        description: "해당 지점 포함 전 등급 이용 가능",
        availableIcons: ["B", "S", "G", "P", "S"],
        color: "bg-red-500",
        gymsByRegion: {
            "서울": ["신촌점", "가락점"],
            "전북": ["전주송천점"],
        }
    },
];

const RegionBadge = ({ region }: { region: string }) => {
    let colorClass = 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
     switch (region) {
        case '서울': colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'; break;
        case '경기': colorClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'; break;
        case '대전': colorClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'; break;
        case '부산': colorClass = 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200'; break;
        case '충청':
        case '충북':
        case '충남':
             colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'; break;
        case '경남':
        case '경상':
        case '대구':
             colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'; break;
        case '울산': colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'; break;
        case '전북': colorClass = 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'; break;
    }
    return <Badge variant="outline" className={`border-transparent ${colorClass}`}>{region}</Badge>
}


export default function HelboPassPage() {
  // 관리자 '가격 관리'에서 설정한 상품/가격을 실시간 반영(없으면 기본값 폴백).
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  useEffect(() => {
    const unsub = subscribePricing(setProducts, () => setProducts(DEFAULT_PRODUCTS));
    return () => unsub();
  }, []);

  // 기본 가격표: 상품 목록에서 직접 파생.
  const basicRows = useMemo(
    () => products.map((p) => ({
      tier: shortTierName(p.name),
      price1: p.prices['1'].price,
      price3: p.prices['3'].price,
      price6: p.prices['6'].price,
    })),
    [products]
  );

  // 업그레이드 비용: 상품가의 차액으로 계산(양수인 행만 노출).
  const upgradeRows = useMemo<UpgradeRow[]>(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return UPGRADE_PAIRS.map((pair) => {
      const from = byId.get(pair.from);
      const to = byId.get(pair.to);
      if (!from || !to) return null;
      const addP1 = to.prices['1'].price - from.prices['1'].price;
      const addP3 = to.prices['3'].price - from.prices['3'].price;
      const addP6 = to.prices['6'].price - from.prices['6'].price;
      if (addP1 <= 0 && addP3 <= 0 && addP6 <= 0) return null;
      return {
        from: shortTierName(from.name),
        to: shortTierName(to.name),
        fromP1: from.prices['1'].price, fromP3: from.prices['3'].price, fromP6: from.prices['6'].price,
        addP1, addP3, addP6,
      };
    }).filter((r): r is UpgradeRow => r !== null);
  }, [products]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" asChild className="mb-8 hover:bg-primary hover:text-primary-foreground" data-gtm-id="helbo-pass-back-home-click">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
            </Link>
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight tracking-tighter">
              나에게 맞는 헬스보이짐<br className="sm:hidden" /> 헬보올패스 찾기
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              전국 80여개 지점을 자유롭게, 내 라이프스타일에 맞는 플랜을 선택하세요.
            </p>
          </div>
          
          <section className="my-16" id="tier-summary">
             <Separator className="my-10" />
             <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">헬보올패스 등급별 매장 안내</h2>
                <p className="text-muted-foreground mt-2 text-base md:text-lg">내 지점 등급을 확인해보세요</p>
             </div>
              <Carousel
                opts={{ align: 'start' }}
                className="w-full max-w-4xl mx-auto"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {tierSummaryData.map((tier, index) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 group">
                      <Card className="h-full flex flex-col bg-card border shadow-lg transition-all duration-300 group-hover:border-primary/50">
                        <CardHeader className="text-center items-center p-4">
                          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-3xl mb-2", tier.color)}>
                            {tier.tier === 'S Premium' ? <Crown /> : tier.availableIcons[tier.availableIcons.length -1]}
                          </div>
                          <CardTitle className="text-2xl font-bold">{tier.tier}</CardTitle>
                          <p className="text-sm text-muted-foreground">{tier.name} {tier.count}지점</p>
                        </CardHeader>
                        <CardContent className="flex-grow p-4 pt-0 space-y-3">
                          <div className="text-center">
                            <div className="flex justify-center items-center gap-1 mb-1">
                              {tier.availableIcons.map((icon, i) => (
                                <span key={`${icon}-${i}`} className="text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground">{icon}</span>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">{tier.description}</p>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                             {Object.entries(tier.gymsByRegion).map(([region, gyms]) => (
                               <div key={region} className="text-sm">
                                 <RegionBadge region={region} />
                                 <span className="text-muted-foreground text-xs">{(gyms as string[]).join(', ')}</span>
                               </div>
                             ))}
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
              </Carousel>
               <p className="text-xs text-muted-foreground text-center mt-4">
                * 지점 등급은 3개월 단위로 변경될 수 있으며, 지점 등급 변경에 따라 이용 가능 지점이 변경될 수 있음. (주 이용지점은 이용 가능)
               </p>
          </section>

          <section className="space-y-4" id="pass-details">
             <Separator className="my-10" />
             <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter">등급별 상세 정보</h2>
                <p className="text-muted-foreground mt-2 text-base md:text-lg">각 패스로 이용할 수 있는 상세 혜택과 지점을 확인해보세요.</p>
             </div>
             <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={passTiersData[0].id}>
               {sortedPassTiers.map((pass) => {
                 const passTierIndex = tierOrder.indexOf(pass.tier);
                 const availableGyms = allGyms.filter(gym => tierOrder.indexOf(gym.tier) >= passTierIndex);
                 const gymsByRegion = availableGyms.reduce<Record<string, typeof allGyms>>((acc, gym) => {
                    const region = shortenRegionName(gym.region);
                    if (!acc[region]) acc[region] = [];
                    acc[region].push(gym);
                    return acc;
                 }, {});
                 const sortedGymsByRegion = Object.entries(gymsByRegion).sort(([, a], [, b]) => b.length - a.length);
                 
                 const availableRegions = sortedGymsByRegion.map(([region]) => region);
                 const regionSummary = `${availableRegions.slice(0, 3).join(', ')}${availableRegions.length > 3 ? ` 등` : ''} 총 ${availableGyms.length}개 지점`;

                 const restrictedTiers = tierOrder.filter(t => !pass.availableTiers.includes(t));
                 const Icon = pass.icon as LucideIcon;

                 const availabilityText = pass.tier === 'S Premium' 
                    ? `전체 지점 ${allGyms.length}곳 이용 가능`
                    : `${pass.availableTiers.join(', ')} 등급, 총 ${availableGyms.length}곳 이용 가능`;

                 const limitationsText = restrictedTiers.length > 0 
                    ? `${restrictedTiers.join(', ')} 등급 이용 불가`
                    : '제한 없음';
                 
                 return (
                   <AccordionItem value={pass.id} key={pass.id} id={`pass-${pass.id}`} className="border-border/50 bg-card rounded-lg overflow-hidden transition-colors data-[state=open]:bg-secondary/60 shadow-md">
                     <AccordionTrigger className="p-4 md:p-6 text-lg hover:no-underline text-left w-full" data-gtm-id={`helbo-pass-details-tier-${pass.id}-click`}>
                        <div className="flex flex-col gap-3 w-full">
                            <div className="flex items-center gap-4">
                               <Icon className="h-7 w-7 text-primary" />
                               <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                <h3 className="text-xl md:text-2xl font-bold">{pass.koreanName}</h3>
                                <Badge variant={pass.tier === 'S Premium' || pass.tier === 'Premium' ? 'default' : 'secondary'} className="w-fit mt-1 sm:mt-0">{pass.badge.text}</Badge>
                               </div>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1.5 mt-1 text-left">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>{availabilityText}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-destructive" />
                                    <span>{limitationsText}</span>
                                </div>
                            </div>
                        </div>
                     </AccordionTrigger>
                     <AccordionContent className="bg-background px-4 md:px-6 pb-6 space-y-4">
                        <Accordion type="single" collapsible className="w-full" defaultValue="gym-list">
                            <AccordionItem value="gym-list" className="border rounded-md">
                               <AccordionTrigger className="px-4 text-base hover:no-underline" data-gtm-id={`helbo-pass-details-gym-list-${pass.id}-click`}>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-muted-foreground"/>
                                        <span>이용 가능 지점 <span className="font-semibold text-primary">({regionSummary})</span></span>
                                    </div>
                               </AccordionTrigger>
                               <AccordionContent className="px-4 pb-4">
                                  {availableGyms.length > 0 ? (
                                    <Tabs defaultValue={sortedGymsByRegion[0]?.[0]} className="w-full mt-2">
                                      <ScrollArea className="w-full whitespace-nowrap">
                                        <TabsList className="h-auto justify-start p-0 bg-transparent space-x-2">
                                            {sortedGymsByRegion.map(([region, gyms]) => (
                                                <TabsTrigger key={region} value={region} data-gtm-id={`helbo-pass-details-region-tab-${pass.id}-${region}-click`}>
                                                    {region} ({gyms.length})
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        <ScrollBar orientation="horizontal" className="mt-2"/>
                                      </ScrollArea>
                                      {sortedGymsByRegion.map(([region, gyms]) => (
                                          <TabsContent key={region} value={region} className="mt-4">
                                              <ScrollArea className="h-40">
                                                  <div className="flex flex-wrap gap-1.5 pr-3">
                                                      {gyms.sort((a, b) => a.name.localeCompare(b.name)).map(gym => {
                                                        const isExclusive = gym.tier === pass.tier;
                                                        return (
                                                          <Badge 
                                                            key={gym.id} 
                                                            variant={isExclusive ? "default" : "secondary"}
                                                            className={cn("font-normal", isExclusive && "text-primary-foreground bg-primary")}
                                                          >
                                                            {gym.name}
                                                          </Badge>
                                                        )
                                                      })}
                                                  </div>
                                              </ScrollArea>
                                          </TabsContent>
                                      ))}
                                    </Tabs>
                                  ) : (
                                    <p className="text-center text-muted-foreground pt-4">이용 가능한 지점이 없습니다.</p>
                                  )}
                               </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                     </AccordionContent>
                   </AccordionItem>
                 );
               })}
             </Accordion>
          </section>

          <section className="mt-16" id="pricing">
             <Separator className="my-10" />
             <Card className="bg-card text-card-foreground border-border/50 shadow-lg overflow-hidden">
                <CardHeader className="text-center bg-secondary/30 p-6">
                    <Badge variant="default" className="w-fit mx-auto mb-3 text-sm py-1 bg-foreground text-background">HEALBO ALL-PASS PRICING</Badge>
                    <CardTitle className="text-xl md:text-3xl font-bold">헬보올패스 회원권 가격</CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-2 leading-relaxed">
                        <strong className="text-primary font-bold">기존 회원가 그대로!</strong> 한 지점 등록 가격으로 <strong className="font-bold">전국 80여개 지점 자유이용</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                   <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="basic" data-gtm-id="helbo-pass-pricing-tab-basic-click">기본 가격표</TabsTrigger>
                        <TabsTrigger value="upgrade" data-gtm-id="helbo-pass-pricing-tab-upgrade-click">업그레이드 비용</TabsTrigger>
                      </TabsList>
                      <TabsContent value="basic" className="mt-4">
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary hover:bg-secondary">
                                        <TableHead className="w-[100px] font-semibold text-left">등급</TableHead>
                                        <TableHead className="text-right font-semibold">1개월</TableHead>
                                        <TableHead className="text-right font-semibold">3개월</TableHead>
                                        <TableHead className="text-right font-semibold">6개월</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {basicRows.map((item, index) => {
                                        const isPremiumRow = item.tier === '프리미엄';
                                        return (
                                        <TableRow key={item.tier} className={cn(index % 2 === 0 ? 'bg-card' : 'bg-secondary/30', "hover:bg-primary/10", isPremiumRow && 'bg-amber-500/5')}>
                                            <TableCell className="font-medium text-left">{item.tier}</TableCell>
                                            <TableCell className={cn("text-right font-semibold", isPremiumRow ? "text-amber-600" : "text-primary")}>₩{item.price1.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-primary font-semibold">₩{item.price3.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-primary font-semibold">₩{item.price6.toLocaleString()}</TableCell>
                                        </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                      </TabsContent>
                      <TabsContent value="upgrade" className="mt-4">
                        <div className="w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                     <TableRow className="bg-secondary hover:bg-secondary">
                                        <TableHead className="w-[150px] font-semibold text-left">업그레이드</TableHead>
                                        <TableHead className="text-right font-semibold">1개월</TableHead>
                                        <TableHead className="text-right font-semibold">3개월</TableHead>
                                        <TableHead className="text-right font-semibold">6개월</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upgradeRows.map((item, index) => {
                                      return (
                                        <TableRow key={index} className={cn(index % 2 === 0 ? 'bg-card' : 'bg-secondary/30', "hover:bg-primary/10")}>
                                            <TableCell className="font-medium text-left">
                                                <div>
                                                    <span className="font-semibold">{item.from} → {item.to}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-muted-foreground">기존 ₩{item.fromP1.toLocaleString()}</span>
                                                    <span className="text-primary font-semibold">+ ₩{item.addP1.toLocaleString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                 <div className="flex flex-col items-end">
                                                    <span className="text-xs text-muted-foreground">기존 ₩{item.fromP3.toLocaleString()}</span>
                                                    <span className="text-primary font-semibold">+ ₩{item.addP3.toLocaleString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                 <div className="flex flex-col items-end">
                                                    <span className="text-xs text-muted-foreground">기존 ₩{item.fromP6.toLocaleString()}</span>
                                                    <span className="text-primary font-semibold">+ ₩{item.addP6.toLocaleString()}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-right">* 위 표의 금액은 추가금액입니다.</p>
                      </TabsContent>
                   </Tabs>
                </CardContent>
             </Card>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
