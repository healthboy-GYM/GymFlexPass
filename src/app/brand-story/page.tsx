
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Gem, HandCoins, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const coreValues = [
  {
    icon: MapPin,
    title: '전국 어디서나',
    description: '전국 80여개 단일 브랜드 지점 운영',
  },
  {
    icon: Gem,
    title: '프리미엄 클래스',
    description: '헬스/필라테스/골프/수영/GX 모두 체계적인 트레이너 교육 시스템',
  },
  {
    icon: HandCoins,
    title: '합리적인 가격',
    description: '고정가 정책 도입으로 투명한 가격 제공',
  },
];

export const metadata = {
  title: '브랜드 스토리',
  description: '운동을 일상처럼, 프리미엄하게. 헬스보이짐과 헬보올패스가 만들어가는 이야기.',
};

export default function BrandStoryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[350px] w-full flex items-center justify-center text-center text-white">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/gymflex-pass-fgz47.firebasestorage.app/o/assets%2Fhero.jpg?alt=media"
              alt="헬스보이짐 내부 전경"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 p-4 animate-in fade-in duration-1000">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              대한민국 대표 피트니스 브랜드, 헬스보이짐
            </h1>
            <p className="text-2xl md:text-4xl font-bold text-primary" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              "운동은 헬스보이짐!"
            </p>
          </div>
        </section>
        
        <div className="container py-16 md:py-24 px-4 md:px-6 space-y-20">
          <div className="max-w-5xl mx-auto">
            <Button variant="outline" asChild className="mb-8 hover:bg-primary hover:text-primary-foreground" data-gtm-id="brand-story-back-home-click">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
                </Link>
            </Button>
          </div>

          {/* Sub Message Section */}
          <section className="max-w-3xl mx-auto text-center animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">운동을 일상처럼, 프리미엄하게</h2>
            <p className="text-muted-foreground leading-relaxed">
              헬스보이짐은 20대~40대를 중심으로 한 생활 밀착형 피트니스 브랜드입니다.
              <br />
              전국 어디서나 꾸준히 운동할 수 있도록 80개 이상의 지점을 운영하며,
              헬스뿐 아니라 필라테스, 골프, 수영까지 통합 프리미엄 운동 서비스를 제공합니다.
            </p>
          </section>

          {/* Core Values Section */}
          <section className="max-w-5xl mx-auto animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-foreground">
                    브랜드 핵심 가치
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {coreValues.map((value) => {
                const Icon = value.icon;
                return (
                    <Card key={value.title} className="bg-card text-card-foreground border-border/50 shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="flex flex-col items-center gap-4 pb-4">
                            <div className="flex-shrink-0">
                                <div className="p-3 bg-primary/10 rounded-full text-primary">
                                    <Icon className="h-7 w-7" />
                                </div>
                            </div>
                            <CardTitle className="text-xl font-bold">{value.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                           <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                        </CardContent>
                    </Card>
                );
              })}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">헬스보이짐과 함께 건강한 변화를 시작하세요.</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
              운동이 일상이 되고, 건강한 삶이 자연스러운 습관이 됩니다.
              <br />
              전국 어디서나, 언제든지 헬스보이짐과 함께라면 당신의 운동은 멈추지 않습니다.
            </p>
            <Button asChild size="lg" data-gtm-id="brand-story-cta-purchase-click">
              <Link href="/purchase">헬보올패스 구매하고 함께하기</Link>
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
