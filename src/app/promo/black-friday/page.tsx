
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Flame, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Percent, 
  ShieldCheck, 
  Zap, 
  ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function BlackFridayPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // 검토를 위해 타이머가 동작하는 것처럼 보이게 설정 (현재 시간으로부터 3일 후)
  useEffect(() => {
    const mockDeadline = new Date();
    mockDeadline.setDate(mockDeadline.getDate() + 3);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = mockDeadline.getTime() - now.getTime();
      
      if (diff <= 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden border-b border-neutral-800">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://picsum.photos/seed/blackfriday/1920/1080"
              alt="Black Friday Background"
              fill
              className="object-cover opacity-30"
              data-ai-hint="gym darkness"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          </div>
          
          <div className="container relative z-10 px-4 md:px-6 text-center">
            <Button variant="outline" asChild className="mb-8 bg-white/5 border-white/20 text-white hover:bg-white/10">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
              </Link>
            </Button>
            
            <div className="inline-block px-4 py-1.5 mb-6 rounded-md bg-destructive text-white text-sm font-black tracking-widest uppercase animate-pulse">
              Year's Biggest Sale
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 italic">
              BLACK <span className="text-destructive">FRIDAY</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-neutral-400 mb-12 font-medium">
              1년에 단 한 번, 헬보올패스 프리미엄을 <br className="sm:hidden" />
              역대급 할인가로 소유하세요.
            </p>

            {/* Countdown Timer */}
            <div className="flex justify-center gap-4 mb-12">
              {[
                { label: 'DAYS', value: timeLeft.days },
                { label: 'HOURS', value: timeLeft.hours },
                { label: 'MINS', value: timeLeft.minutes },
                { label: 'SECS', value: timeLeft.seconds },
              ].map((unit) => (
                <div key={unit.label} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-2xl md:text-5xl font-black font-mono text-destructive">
                      {formatTime(unit.value)}
                    </span>
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-neutral-500 tracking-widest">{unit.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Card Section */}
        <section className="py-20 container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-neutral-950 border-2 border-destructive shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden">
              <div className="bg-destructive text-white py-3 text-center text-sm font-black tracking-widest">
                ONLY FOR BLACK FRIDAY
              </div>
              <CardHeader className="text-center pt-12 pb-8">
                <CardTitle className="text-3xl md:text-4xl font-black mb-2 text-white">프리미엄 올패스 1개월권</CardTitle>
                <CardDescription className="text-neutral-400 text-lg">
                  전국 80여개 프리미엄/골드/실버/블랙 지점 자유 이용
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-10 px-6 md:px-12 pb-12">
                <div className="flex flex-col items-center justify-center py-8 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-2xl font-bold text-neutral-500 line-through mb-2">152,000원</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl md:text-8xl font-black text-white">49,000</span>
                    <span className="text-2xl md:text-4xl font-bold text-white">원</span>
                  </div>
                  <Badge className="mt-6 bg-destructive text-white text-lg py-1 px-4 rounded-full font-black">
                    68% OFF
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold flex items-center gap-2">
                      <Zap className="h-5 w-5 text-destructive fill-destructive" />
                      폭폭적인 혜택
                    </h4>
                    <ul className="space-y-3 text-neutral-400">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-destructive shrink-0" />
                        <span>전국 80여개 지점 무제한 교차 이용</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-destructive shrink-0" />
                        <span>하루 이용 횟수 제한 없음 (지점당 1일 1회)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-destructive shrink-0" />
                        <span>신규 및 기존 회원 모두 전환 가능</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-destructive" />
                      안전한 보장
                    </h4>
                    <ul className="space-y-3 text-neutral-400">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-destructive shrink-0" />
                        <span>구매 후 3개월 내 언제든 시작일 설정 가능</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-destructive shrink-0" />
                        <span>미등록 시 14일 이내 100% 전액 환불</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <Button asChild size="lg" className="w-full h-20 text-2xl font-black bg-destructive hover:bg-destructive/90 text-white rounded-xl shadow-lg shadow-destructive/20 group">
                    <Link href="https://bmarket.broj.co.kr/products/334405" target="_blank">
                      <ShoppingCart className="mr-3 h-7 w-7" />
                      지금 바로 구매하기
                      <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <p className="text-center text-neutral-500 text-sm mt-4 italic">
                    * 선착순 300명 한정 수량 소진 시 조기 종료됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Important Notes */}
        <section className="py-20 bg-neutral-900/50">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" /> 유의사항 및 안내
            </h2>
            <div className="space-y-6 text-sm text-neutral-400 leading-relaxed">
              <div className="p-4 bg-black rounded-lg border border-neutral-800">
                <p className="text-white font-bold mb-2">이용 가능 등급 안내</p>
                <p>본 상품은 '프리미엄' 등급권으로, 헬스보이짐의 프리미엄, 골드, 실버, 블랙 등급의 모든 지점을 이용할 수 있습니다. 단, 'S-프리미엄' 등급 지점(신촌점, 가락점, 전주송천점 등)은 이용이 제한됩니다.</p>
              </div>
              <ul className="list-disc pl-5 space-y-2">
                <li>본 상품은 헬보올패스 최초 구매 회원 및 기존 회원 모두 1인 1회에 한해 구매 가능합니다.</li>
                <li>온라인 결제 완료 후, 선택하신 주 이용지점에 방문하여 지류 계약서를 작성해야 최종 활성화됩니다.</li>
                <li>타 이벤트 및 지점 자체 할인 혜택과 중복 적용되지 않습니다.</li>
                <li>구매한 이용권의 양도 및 연기는 불가능합니다.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
