
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, QrCode, ScanLine, UserCheck, AlertTriangle, Info, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'QR 입장 가이드',
  description: '운톡 앱 QR 코드로 헬보올패스 지점에 입장하는 방법을 안내합니다.',
};

export default function QrEntryGuidePage() {
  const qrSteps = [
    {
      step: 1,
      title: "운톡 앱 실행",
      description: "스마트폰에서 '운톡' 앱을 실행합니다.",
      imageSrc: "https://placehold.co/600x400.png",
      imageHint: "app launch screen",
      icon: Smartphone,
    },
    {
      step: 2,
      title: "출입 QR 선택",
      description: "앱 하단 메뉴의 '출입 QR'을 선택합니다.",
      imageSrc: "https://placehold.co/600x400.png",
      imageHint: "app qr menu",
      icon: QrCode,
    },
    {
      step: 3,
      title: "QR 코드 스캔",
      description: "생성된 QR코드를 데스크 리더기에 스캔합니다.",
      imageSrc: "https://placehold.co/600x400.png",
      imageHint: "qr code scanner",
      icon: ScanLine,
    },
    {
      step: 4,
      title: "입장 완료",
      description: "정상 인증 시 \"QR 인증되었습니다\" 음성 안내와 함께 입장이 완료됩니다.",
      imageSrc: "https://placehold.co/600x400.png",
      imageHint: "entry success confirmation",
      icon: UserCheck,
    },
  ];

  const notices = [
    { text: 'QR코드는 1회용이며, 생성 후 일정 시간(예: 30초) 동안 유효합니다.', icon: AlertTriangle },
    { text: '본인 외 타인에게 QR코드를 양도하거나 공유할 수 없습니다.', icon: AlertTriangle },
    { text: 'QR코드 인식이 반복적으로 실패할 경우 데스크에 문의해주세요.', icon: Info },
    { text: '안면인식 시스템이 정상 작동할 경우, 안면인식을 우선으로 이용해주시기 바랍니다.', icon: Info },
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
            QR 코드 입장 안내
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            안면인식 시스템 오류 또는 기타 사유로 입장이 어려울 경우, QR 코드를 통해 간편하게 입장하실 수 있습니다.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">QR 입장 방법</h2>
            <div className="space-y-8">
              {qrSteps.map((item) => {
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
                  QR 입장 관련 문제가 지속되거나 궁금한 점이 있으시면 언제든지 가까운 지점 데스크로 문의해주세요.
                </p>
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
