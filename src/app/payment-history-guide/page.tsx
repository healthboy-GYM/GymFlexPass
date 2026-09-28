
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, UserCircle, ListChecks, Receipt, AlertTriangle, Info, ArrowLeft, CircleDot } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: '결제 내역 확인 가이드',
  description: '헬보올패스 결제 내역을 확인하는 방법을 안내합니다.',
};

export default function PaymentHistoryGuidePage() {
  const paymentSteps = [
    {
      step: 1,
      title: '운톡 앱 실행',
      description: '스마트폰에서 \'운톡\' 앱을 실행합니다.',
      imageSrc: 'https://placehold.co/600x400.png',
      imageHint: 'app launch screen',
      icon: Smartphone,
    },
    {
      step: 2,
      title: '마이페이지 선택',
      description: '앱 하단 또는 측면 메뉴에서 \'마이페이지\'를 선택합니다.',
      imageSrc: 'https://placehold.co/600x400.png',
      imageHint: 'app mypage menu',
      icon: UserCircle,
    },
    {
      step: 3,
      title: '결제내역 선택',
      description: '마이페이지 내 메뉴 중 \'결제내역\' 또는 \'이용권 관리\' > \'결제내역\'을 선택합니다.',
      imageSrc: 'https://placehold.co/600x400.png',
      imageHint: 'app payment history menu',
      icon: ListChecks,
    },
    {
      step: 4,
      title: '결제내역 확인',
      description: '선택한 기간 또는 전체 결제 내역을 확인할 수 있습니다.',
      imageSrc: 'https://placehold.co/600x400.png',
      imageHint: 'payment history list',
      icon: Receipt,
    },
  ];

  const checkableInfo = [
    '결제 일시',
    '상품명 (헬스보이짐 OO점 3개월 등)',
    '결제 금액',
    '결제 수단 (카드, 현금, 이체 등)',
    '결제 지점 정보',
    '거래 상태 (정상결제, 취소, 환불진행중 등)',
  ];

  const notices = [
    { text: '앱에서는 최근 1년간의 결제내역만 조회가 가능합니다.', icon: AlertTriangle },
    { text: '더 이전의 내역이나 상세 영수증 발급은 결제하신 지점 데스크로 문의해주세요.', icon: Info },
    { text: '결제 취소/환불 내역은 시스템에 반영되기까지 시간이 소요될 수 있습니다.', icon: Info },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container py-12 md:py-20 lg:py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <Button variant="outline" asChild className="mb-8 hover:bg-primary hover:text-primary-foreground">
            <Link href="/faq">
              <ArrowLeft className="mr-2 h-4 w-4" /> FAQ로 돌아가기
            </Link>
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            결제 내역 확인 방법 안내
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            운톡 앱에서 회원님의 모든 결제 정보를 한눈에 확인하세요.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">결제내역 확인 방법</h2>
            <div className="space-y-8">
              {paymentSteps.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.step} className="shadow-lg bg-card text-card-foreground border-border/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center gap-4 p-4 md:p-6 bg-secondary/50">
                      <div className="flex-shrink-0 bg-accent text-accent-foreground rounded-full p-3">
                        <Icon className="h-6 w-6 " />
                      </div>
                      <div>
                        <CardDescription className="text-sm text-muted-foreground">STEP {item.step}</CardDescription>
                        <CardTitle className="text-xl font-medium text-card-foreground">{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 space-y-4">
                      <p className="text-card-foreground/90 leading-relaxed">{item.description}</p>
                      <div className="aspect-[16/9] relative rounded-md overflow-hidden border border-border/30">
                        <Image
                          src={item.imageSrc}
                          alt={`${item.title} 이미지`}
                          data-ai-hint={item.imageHint}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">확인 가능한 정보</h2>
            <Card className="bg-card text-card-foreground border-border/50">
              <CardContent className="p-6 grid gap-3">
                {checkableInfo.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CircleDot className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-card-foreground/90">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">참고사항</h2>
            <Card className="bg-card text-card-foreground border-border/50">
              <CardContent className="p-6 grid gap-3">
                {notices.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${item.icon === AlertTriangle ? 'text-destructive' : 'text-accent'}`} />
                      <span className="text-card-foreground/90">{item.text}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">문의</h2>
            <Card className="bg-card text-card-foreground border-border/50">
              <CardContent className="p-6">
                <p className="text-card-foreground/90">
                  결제내역 관련 문의사항은 결제하신 지점 또는 아래 고객센터로 연락주시면 친절하게 안내해 드리겠습니다.
                </p>
                <p className="text-lg font-semibold text-accent mt-3">고객센터: 010-9032-6657</p>
              </CardContent>
            </Card>
          </section>

          <div className="mt-12 text-center">
            <Button variant="outline" asChild className="hover:bg-primary hover:text-primary-foreground">
              <Link href="/faq">
                <ArrowLeft className="mr-2 h-4 w-4" /> FAQ로 돌아가기
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
