'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Dumbbell, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  Search, 
  MessageCircle, 
  Clock, 
  Calendar,
  Sparkles,
  Target,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const packages = [
  {
    id: 'start-1',
    name: 'START 1',
    description: '기구 사용법 기초 완벽 마스터',
    composition: '올패스 1개월 + PT 1회',
    price: '89,500',
    recommendation: '기구 사용법만이라도 제대로 배우고 싶을 때',
    tag: '가벼운 시작',
    link: 'https://bmarket.broj.co.kr/products/334405' // 예시 링크
  },
  {
    id: 'start-2',
    name: 'START 2',
    description: '내 몸에 맞는 맞춤 루틴 세팅',
    composition: '올패스 1개월 + PT 2회',
    price: '129,500',
    recommendation: '내 몸에 맞는 루틴과 자세 교정이 필요할 때',
    tag: '인기 최고',
    link: 'https://bmarket.broj.co.kr/products/334405'
  },
  {
    id: 'start-3',
    name: 'START 3',
    description: '3주간의 확실한 운동 습관 형성',
    composition: '올패스 1개월 + PT 3회',
    price: '169,500',
    recommendation: '초반 3주, 확실한 운동 습관을 만들고 싶을 때',
    tag: '강력 추천',
    link: 'https://bmarket.broj.co.kr/products/334405'
  }
];

const faqs = [
  {
    q: "1개월만 써보고 연장할 수 있나요?",
    a: "물론입니다! 1개월 이용 후 만족도가 높으시면 연장 혜택과 함께 정규 PT 프로그램으로 전환이 가능합니다."
  },
  {
    q: "PT 선생님은 지정되나요?",
    a: "지점 방문 시 상담을 통해 회원님의 운동 목적에 가장 적합한 전문 트레이너를 매칭해 드립니다."
  },
  {
    q: "운동복이나 수건도 포함인가요?",
    a: "지점별 운영 방침이 상이하므로, 선택하신 지점의 상세 페이지를 꼭 확인해 주세요."
  }
];

export default function FebruaryPromoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-black text-white text-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://picsum.photos/seed/feb-promo/1920/1080"
              alt="Fitness determination"
              fill
              className="object-cover opacity-40"
              data-ai-hint="gym training"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
          </div>
          
          <div className="container relative z-10 px-4 md:px-6">
            <Button variant="outline" asChild className="mb-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
              </Link>
            </Button>
            
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary text-primary-foreground text-sm font-bold animate-fade-in">
              2월 한정 스타터 패키지 제안
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
              2월이니까, 시작은 가볍게<br />
              <span className="text-primary">전문성은 확실하게</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-300 mb-8 leading-relaxed">
              헬스장 등록만 하면 안 나갈까 봐 걱정되시나요? <br className="hidden sm:block" />
              1개월 올패스권으로 자유롭게 이용하고, <br className="hidden sm:block" />
              PT로 내 몸에 맞는 운동법을 세팅하세요.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-lg font-bold">
                <Link href="#packages">패키지 선택하기</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg font-bold bg-white/10 border-white/30 text-white">
                <Link href="/branch-locator">지점 먼저 찾기</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section id="packages" className="py-20 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">나에게 꼭 맞는 '첫 달' 선택하기</h2>
              <p className="text-muted-foreground">1개월 이용권에 꼭 필요한 만큼의 PT만 골라 담으세요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="relative flex flex-col border-2 border-border/50 hover:border-primary transition-all duration-300 shadow-xl overflow-hidden group">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground font-bold">{pkg.tag}</Badge>
                  </div>
                  <CardHeader className="pt-10 pb-6 text-center">
                    <CardTitle className="text-3xl font-black mb-2">{pkg.name}</CardTitle>
                    <CardDescription className="text-base text-primary font-semibold">{pkg.composition}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-6">
                    <div className="text-center">
                      <p className="text-4xl font-black text-foreground">
                        <span className="text-xl font-bold">₩</span>{pkg.price}
                      </p>
                    </div>
                    <div className="space-y-3 py-6 border-y border-border/50">
                      <p className="text-sm font-medium leading-relaxed text-center italic text-muted-foreground">
                        "{pkg.recommendation}"
                      </p>
                    </div>
                    <Button asChild className="w-full h-12 text-base font-bold group-hover:scale-105 transition-transform" data-gtm-id={`promo-feb-purchase-${pkg.id}-click`}>
                      <Link href={pkg.link} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="mr-2 h-5 w-5" /> 예약 및 결제하기
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button asChild variant="outline" size="lg" className="h-12 border-primary text-primary hover:bg-primary/5">
                <Link href="/branch-locator">
                  <Search className="mr-2 h-5 w-5" /> 내 근처 지점 찾고 패키지 예약하기
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why One Month Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">왜 '1개월 결합'인가요?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">부담 없는 기간</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    1년 계약의 압박 없이,<br />딱 1개월만 먼저 경험해 보세요.
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">방황 없는 시작</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    PT를 통해 도착하자마자<br />무엇을 해야 할지 정해드립니다.
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">검증된 가성비</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    올패스 49,500원에 PT 4만원 결합은<br />오직 2월 스타터에게만 제공됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PT Promises Section */}
        <section className="py-20 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">헬보 PT만의 3가지 약속</h2>
              <p className="text-muted-foreground">1~3회 공통으로 제공되는 프리미엄 케어 서비스</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { 
                  title: "인바디 기반 맞춤 상담", 
                  desc: "단순 운동 지도가 아닌, 현재 체형과 체력 수준을 정밀 분석합니다.",
                  icon: BarChart3 
                },
                { 
                  title: "독자 생존 루틴 전수", 
                  desc: "PT가 없는 날에도 혼자서 즐길 수 있게 '개인 운동 숙제'를 드립니다.",
                  icon: Dumbbell 
                },
                { 
                  title: "부상 방지 가이드", 
                  desc: "무작정 무거운 무게가 아닌, 관절을 보호하는 정확한 각도를 알려드립니다.",
                  icon: ShieldCheck 
                }
              ].map((promise, i) => (
                <Card key={i} className="bg-card">
                  <CardContent className="p-6 space-y-4">
                    <div className="p-3 bg-primary/10 rounded-lg w-fit">
                      <promise.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{promise.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{promise.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Policy Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" /> 운영 정책 및 주의사항
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p><strong className="text-foreground">판매 기간:</strong> 2026년 2월 1일 ~ 2월 28일</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p><strong className="text-foreground">PT 이용권 유효기간:</strong> 올패스 1개월권 이용 기간 내 사용 (구매일로부터 30일 이내 권장)</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p><strong className="text-foreground">예약 노쇼 정책:</strong> 수업 24시간 전 취소/변경 가능 (당일 취소 시 1회 차감)</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p><strong className="text-foreground">환불 규정:</strong> 1개월 이용권 및 PT 회차별 정상가를 기준으로 잔여 금액 환불 (지점별 상세 규정 참조)</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-secondary/20">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">궁금해하실 점들</h2>
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-none bg-card rounded-lg px-6">
                  <AccordionTrigger className="text-left font-bold text-lg py-6 hover:no-underline">Q. {faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base pb-6">
                    A. {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">
              "등록하고 안 가는 헬스장은 이제 그만."
            </h2>
            <p className="text-lg md:text-xl mb-10 opacity-90">
              2월, 헬보 스타터 패키지로 당신의 운동 인생을 새로 쓰세요.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Button asChild size="lg" className="h-14 px-8 text-lg font-bold bg-white text-primary hover:bg-white/90">
                <Link href="#packages">지금 바로 신청하기</Link>
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
