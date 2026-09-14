
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, QrCode, UserCheck, AlertTriangle, Info, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: '체크인 가이드',
  description: '헬보올패스 지점 체크인 방법을 단계별로 안내합니다.',
};

export default function CheckinGuidePage() {
  const checkinSteps = [
    {
      step: 1,
      title: '운톡 앱 실행',
      description: '스마트폰에서 \'운톡\' 앱을 실행합니다. (아직 설치하지 않았다면 스토어에서 다운로드 해주세요)',
      imageSrc: 'https://placehold.co/600x400.png',
      imageHint: 'app launch screen',
      icon: Smartphone,
    },
    {
      step: 2,
      title: 'QR 코드 스캔 또는 회원번호 입력',
      description: '앱 메인 화면에서 \'체크인\' 버튼을 누르고, 지점 데스크에 비치된 QR코드를 스캔하거나 회원번호를 직접 입력합니다.',
      imageSrc: 'https://placehold.co/600x400.png',
      imageHint: 'qr code scan app',
      icon: QrCode,
    },
    {
      step: 3,
      title: '체크인 완료 및 시설 이용',
      description: '정상적으로 인증되면 체크인이 완료됩니다. 이제 자유롭게 시설을 이용하세요!',
      imageSrc: 'https://placehold.co/600x400.png',
      imageHint: 'checkin success message',
      icon: UserCheck,
    },
  ];

  const preparations = [
    { text: '본인 명의의 스마트폰', icon: Smartphone },
    { text: '운톡 앱 설치', icon: QrCode },
  ];

  const notices = [
    { text: '1일 1회 입장이 원칙입니다.', icon: AlertTriangle },
    { text: '타인에게 회원번호 및 QR코드를 양도할 수 없습니다.', icon: AlertTriangle },
    { text: '앱 사용이 어려운 경우 데스크에 문의해주세요.', icon: Info },
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
            헬스보이짐 & 필라걸 체크인 방법 안내
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            헬보올패스 회원님을 위한 간편 체크인 절차를 안내해 드립니다.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">준비물</h2>
            <Card className="bg-card text-card-foreground border-border/50">
              <CardContent className="p-6 grid gap-3">
                {preparations.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <Icon className="h-6 w-6 text-accent flex-shrink-0" />
                      <span className="text-card-foreground/90">{item.text}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">체크인 순서</h2>
            <div className="space-y-8">
              {checkinSteps.map((item) => {
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
            <h2 className="text-2xl font-semibold text-foreground mb-4">주의사항</h2>
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
                  체크인 관련 문제가 발생하거나 궁금한 점이 있으시면 언제든지 가까운 지점 데스크 또는 아래 고객센터로 문의해주세요.
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
