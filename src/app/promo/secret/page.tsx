
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, AlertCircle, ShoppingCart, CheckCircle, MapPin, XCircle, UserPlus, Percent } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import gymsData from '@/data/gyms_update.json';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const tierOrder = ['S Premium', 'Premium', 'Gold', 'Silver', 'Black'];

const tierNormalizationMap: { [key: string]: string } = {
  'S-PREMIUM': 'S Premium', 'PREMIUM': 'Premium', 'GOLD': 'Gold', 'SILVER': 'Silver', 'BLACK': 'Black',
};

const normalizeTier = (tier: string) => {
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

const secretPromoData = {
    tier: 'Premium',
    duration: '1',
    price: 49500,
    originalPrice: 152000,
    link: 'https://bmarket.broj.co.kr/products/334405',
};

export default function SecretPromoPage() {
  type Gym = (typeof allGyms)[number];
  const premiumTierIndex = tierOrder.indexOf('Premium');
  const availableGyms = allGyms.filter(gym => tierOrder.indexOf(gym.tier) >= premiumTierIndex);

  const gymsByRegion = availableGyms.reduce<Record<string, Gym[]>>((acc, gym) => {
    const region = shortenRegionName(gym.region);
    if (!acc[region]) acc[region] = [];
    acc[region].push(gym);
    return acc;
  }, {});

  const sortedGymsByRegion = Object
   .entries(gymsByRegion)
   .sort(([, a], [, b]) => b.length - a.length);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" asChild className="mb-8 hover:bg-primary hover:text-primary-foreground" data-gtm-id="promo-secret-back-home-click">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
            </Link>
          </Button>

          <div className="text-center mb-10">
             <div className="inline-block bg-gradient-to-br from-primary/90 to-primary text-primary-foreground rounded-full p-4 mb-4">
                <Star className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight tracking-tighter">
              시크릿 특가: 프리미엄 1개월권
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              프리미엄 올패스를 <strong className="text-primary">67% 할인</strong>된 특별한 가격에 만나보세요!
            </p>
          </div>

          <Alert variant="destructive" className="mb-8 bg-destructive/10 border-destructive/20 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">주의!</AlertTitle>
            <AlertDescription>
              이 페이지는 특별 할인 링크입니다. 페이지를 벗어나면 이 가격으로 다시 구매하기 어려울 수 있습니다.
            </AlertDescription>
          </Alert>
          
          <Card className="mb-8 bg-card shadow-lg border-2 border-primary">
            <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-3">
                    <p className="text-2xl md:text-3xl font-bold text-muted-foreground line-through">{secretPromoData.originalPrice.toLocaleString()}원</p>
                    <p className="text-4xl md:text-5xl font-black text-primary">{secretPromoData.price.toLocaleString()}원</p>
                </div>
                 <div className="mt-2 inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
                    <Percent className="mr-1.5 h-4 w-4" /> 67% 할인
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <ul className="text-sm text-muted-foreground space-y-2 bg-secondary/50 p-4 rounded-md border">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> <strong>상품명:</strong> 헬스보이짐 프리미엄 올패스 (1개월)</li>
                    <li className="flex items-center"><UserPlus className="h-4 w-4 mr-2 text-primary" /> <strong>대상:</strong> 헬보올패스 최초 구매 회원 한정</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> <strong>혜택:</strong> 프리미엄, 골드, 실버, 블랙 등급 전국 지점 이용 가능</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-primary" /> <strong>제한:</strong> 1인 1회만 구매 가능, 온라인 전용 상품</li>
                </ul>
                <div className="flex items-start p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <XCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                    <span><strong className="font-semibold">이용 불가 지점:</strong> 신촌점, 가락점, 송천점 (S-프리미엄 등급)</span>
                </div>
                <Button asChild size="lg" className="w-full h-14 text-lg mt-4" data-gtm-id="promo-secret-purchase-click">
                    <Link href={secretPromoData.link} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        특가로 구매하기
                    </Link>
                </Button>
            </CardContent>
          </Card>


          <section className="mt-16" id="available-gyms">
             <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter flex items-center justify-center gap-2">
                    <MapPin className="h-7 w-7 text-primary" />
                    이용 가능 지점 (총 {availableGyms.length}개)
                </h2>
                <p className="text-muted-foreground mt-2 text-base md:text-lg">프리미엄 패스로 아래의 모든 지점을 자유롭게 이용할 수 있습니다.</p>
             </div>
             <Card className="bg-secondary/50">
                  <CardContent className="p-4">
                    {sortedGymsByRegion.length > 0 ? (
                      <Tabs defaultValue={sortedGymsByRegion[0]?.[0]} className="w-full">
                        <ScrollArea className="w-full whitespace-nowrap">
                          <TabsList className="h-auto justify-start p-1 bg-transparent">
                            {sortedGymsByRegion.map(([region, gyms]) => (
                              <TabsTrigger key={region} value={region} data-gtm-id={`promo-secret-region-tab-${region}-click`}>
                                {region} ({gyms.length})
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          <ScrollBar orientation="horizontal" className="mt-2"/>
                        </ScrollArea>
                        {sortedGymsByRegion.map(([region, gyms]) => (
                          <TabsContent key={region} value={region} className="mt-4">
                            <ScrollArea className="h-48">
                              <div className="flex flex-wrap gap-1.5 pr-3">
                                {gyms.sort((a, b) => a.name.localeCompare(b.name)).map(gym => {
                                  const isPremium = gym.tier === 'Premium';
                                  return (
                                    <Badge 
                                      key={gym.id} 
                                      variant={isPremium ? "default" : "secondary"}
                                      className={cn("font-normal", isPremium && "text-primary-foreground bg-primary")}
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
                      <p className="text-center text-muted-foreground py-4">이용 가능한 지점이 없습니다.</p>
                    )}
                  </CardContent>
                </Card>
          </section>

          <section className="mt-16">
              <Card className="bg-card text-card-foreground border-border/50">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl"><AlertCircle className="h-6 w-6 text-destructive" />꼭 확인해주세요!</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-3">
                       <p className="text-card-foreground/90 leading-relaxed text-sm md:text-base">
                        • 본 특가 상품은 시크릿 페이지를 통해서만 접속 가능하며, 페이지 이탈 시 재접근이 어려울 수 있습니다.
                      </p>
                      <p className="text-card-foreground/90 leading-relaxed text-sm md:text-base">
                        • 본 상품은 온라인 전용 상품으로, 헬보올패스 최초 구매 회원에 한해 1인 1회만 구매 가능합니다.
                      </p>
                       <p className="text-card-foreground/90 leading-relaxed text-sm md:text-base">
                        • 구매 후 3개월 내 주 이용지점에 방문하여 등록해야 하며, 미등록 시 14일 이내 위약금 없이 전액 환불됩니다.
                      </p>
                      <p className="text-card-foreground/90 leading-relaxed text-sm md:text-base">
                          • 월 이용 횟수에는 제한이 없지만, 한 지점당 하루에 한 번만 입장 가능합니다.
                      </p>
                  </CardContent>
              </Card>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
