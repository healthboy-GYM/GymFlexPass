
'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ShoppingCart, 
  CheckCircle, 
  Search, 
  MessageCircle, 
  Clock, 
  Sparkles,
  Target,
  Zap,
  RotateCcw,
  MapPin,
  CreditCard,
  UserCheck,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ClientBranchLocator = dynamic(
  () => import('@/components/sections/BranchLocator').then((mod) => mod.BranchLocator),
  {
    ssr: false,
    loading: () => (
        <div className="w-full h-[500px] flex items-center justify-center bg-secondary/30 rounded-lg">
            <div className="text-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground font-medium">지도를 불러오는 중입니다...</p>
            </div>
        </div>
    ),
  }
);

const packages = [
  {
    id: 'light-reset',
    name: 'LIGHT RESET',
    description: 'Vibe & Outcome | 방향 설정',
    composition: '올패스 1개월 + PT 1회',
    price: '89,500',
    recommendation: '“센터 도착 후 멈칫하는 시간”을 줄이고 바로 운동 시작하게 만드는 세팅',
    details: [
      '현재 상태 체크 (목표/운동경험/생활 패턴)',
      '센터에서 가장 자주 쓰는 핵심 동작 안내',
      '기구 사용법 및 효율적인 동선 세팅'
    ],
    tag: '가벼운 시작',
  },
  {
    id: 'focus-reset',
    name: 'FOCUS RESET',
    description: 'Vibe & Outcome | 자세 교정',
    composition: '올패스 1개월 + PT 2회',
    price: '129,500',
    recommendation: '“운동은 하는데 변화가 없다”는 구간을 줄이는 집중 세팅',
    details: [
      '상체/하체/코어 중 원하는 타겟 정밀 티칭',
      '정석 폼 + 확실한 자극점 찾기',
      '운동 효율을 극대화하는 1:1 자세 교정'
    ],
    tag: '가장 추천',
  },
  {
    id: 'habit-reset',
    name: 'HABIT RESET',
    description: 'Vibe & Outcome | 루틴 정착',
    composition: '올패스 1개월 + PT 3회',
    price: '169,500',
    recommendation: '“3월 이후에도 계속할 수 있는 루틴”에 초점을 둔 정착형 구성',
    details: [
      '개인별 4주 운동 흐름(빈도/분할/강도) 설계',
      '혼자 할 때도 흐트러지지 않는 운동 순서 정립',
      '중량 및 휴식 기준 등 실전 데이터 세팅'
    ],
    tag: '확실한 변화',
  }
];

const steps = [
  {
    icon: Sparkles,
    title: "패키지 선택",
    desc: "나에게 필요한 리셋 깊이 선택"
  },
  {
    icon: MapPin,
    title: "지점 찾기",
    desc: "가장 가까운 헬스보이짐 검색"
  },
  {
    icon: CreditCard,
    title: "예약 및 결제",
    desc: "비마켓 온라인 특별가 결제"
  },
  {
    icon: UserCheck,
    title: "리셋 시작",
    desc: "전문 트레이너와 1:1 상담 후 시작"
  }
];

export default function MarchPromoPage() {
  const scrollToLocator = () => {
    const element = document.getElementById('branch-search');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-black text-white text-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://picsum.photos/seed/march-reset/1920/1080"
              alt="March Reset"
              fill
              className="object-cover opacity-40"
              data-ai-hint="fitness reset"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
          </div>
          
          <div className="container relative z-10 px-4 md:px-6">
            <Button variant="outline" asChild className="mb-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
              </Link>
            </Button>
            
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary text-primary-foreground text-sm font-bold animate-fade-in uppercase tracking-wider">
              2026 MARCH RESET
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
              새해 결심이 흐트러졌다면,<br />
              <span className="text-primary">3월이 진짜 시작입니다.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-300 mb-8 leading-relaxed">
              1~2월은 시도였다면, 3월은 정착의 시간입니다. <br />
              날이 풀리기 시작하는 지금, 몸도 루틴도 가볍게 다시 세팅해보세요. <br />
              올패스 1개월권과 1:1 PT 리셋이 결합된 3월 한정 패키지.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg font-bold" onClick={scrollToLocator}>
                리셋 패키지 선택하기
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold bg-white/10 border-white/30 text-white" onClick={scrollToLocator}>
                <Search className="mr-2 h-4 w-4" /> 지점 먼저 찾기
              </Button>
            </div>
          </div>
        </section>

        {/* Why Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">왜 하필 ‘3월’이고, 왜 ‘결합’인가요?</h2>
              <p className="text-center text-muted-foreground mb-12">운동이 실패하는 이유는 의지보다 초반 방향이 없어서인 경우가 많습니다.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-card border-none shadow-sm">
                  <CardContent className="pt-8 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <RotateCcw className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">REAL START</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      1~2월 시행착오를 바탕으로,<br />내 몸에 맞는 강도와 루틴을<br />다시 설계합니다.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-none shadow-sm">
                  <CardContent className="pt-8 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">NO WASTE</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      헤매는 시간을 줄이고,<br />‘오늘 뭐하지?’ 고민을 없애는<br />확실한 시작 세팅.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-none shadow-sm">
                  <CardContent className="pt-8 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">EASY TO CONTINUE</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      1개월로 가볍게 시작하고,<br />만족하면 연장하는<br />현실적인 루틴 설계.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section id="packages" className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">3월 리셋 3종 패키지</h2>
              <p className="text-muted-foreground">단순한 횟수 선택이 아니라, 내가 원하는 변화의 깊이를 선택하세요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="relative flex flex-col border-2 border-border/50 hover:border-primary transition-all duration-300 shadow-xl overflow-hidden group">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground font-bold">{pkg.tag}</Badge>
                  </div>
                  <CardHeader className="pt-10 pb-6 text-center">
                    <CardTitle className="text-3xl font-black mb-2 tracking-tighter">{pkg.name}</CardTitle>
                    <CardDescription className="text-base text-primary font-semibold">{pkg.composition}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-6">
                    <div className="text-center">
                      <p className="text-4xl font-black text-foreground">
                        <span className="text-xl font-bold">₩</span>{pkg.price}
                      </p>
                    </div>
                    
                    <div className="space-y-4 py-6 border-y border-border/50">
                      <p className="text-sm font-bold text-center text-foreground">{pkg.description}</p>
                      <ul className="space-y-2">
                        {pkg.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs font-medium leading-relaxed text-center italic text-muted-foreground px-4">
                      "{pkg.recommendation}"
                    </p>

                    <Button className="w-full h-12 text-base font-bold group-hover:scale-105 transition-transform" onClick={scrollToLocator}>
                      <ShoppingCart className="mr-2 h-5 w-5" /> 예약 및 결제하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Participation Process Section */}
        <section className="py-20 bg-secondary/20">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">참여 프로세스</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto relative">
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
              
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-4 bg-background p-6 rounded-xl border shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-tight">{step.desc}</p>
                    </div>
                    <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-black text-muted-foreground border">
                      {i + 1}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Integrated Branch Locator Section */}
        <section id="branch-search" className="py-20 scroll-mt-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-primary text-primary px-4 py-1">STEP 2</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">리셋을 시작할 지점을 선택하세요</h2>
              <p className="text-muted-foreground">가장 가까운 헬스보이짐을 찾아 패키지 가격과 혜택을 확인해보세요.</p>
            </div>
            <div className="rounded-2xl overflow-hidden border shadow-2xl">
              <ClientBranchLocator hideNavigation={true} />
            </div>
          </div>
        </section>

        {/* Policy Section */}
        <section className="py-20 bg-secondary/50">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" /> 투명한 운영 정책
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p><strong className="text-foreground">판매 기간:</strong> 2026년 3월 1일 ~ 3월 31일</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p><strong className="text-foreground">사용 기준:</strong> 결제일 기준, 올패스 이용 기간 내 PT 소진 권장</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p><strong className="text-foreground">예약/변경:</strong> 원활한 운영을 위해 수업 24시간 전까지 변경/예약 권장 (지점 기준 우선)</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p><strong className="text-foreground">환불 안내:</strong> 이용권/수업 환불 규정은 지점별 운영 기준에 따르며 결제 전 고지됩니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">
              "가장 빠른 시작은 바로 지금입니다."
            </h2>
            <p className="text-lg md:text-xl mb-10 opacity-90">
              3월은 다시 움직이기 가장 좋은 시기입니다. <br />
              당신의 루틴을 다시 세팅하는 일, 헬스보이짐이 함께하겠습니다.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-white text-primary hover:bg-white/90 shadow-xl" onClick={scrollToLocator}>
                지금 바로 지점 선택하고 신청하기
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-white text-white hover:bg-white/10">
                <Link href="http://pf.kakao.com/_zxaMxmn/chat" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" /> 카톡으로 상담하기
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
