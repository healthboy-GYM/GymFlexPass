
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { CreditCard, PenSquare, Smartphone, ArrowRight, Search } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

const howToUseSteps = [
  {
    icon: Search,
    title: '웹페이지에서 상품과 지점 정보 확인 후 ‘결제하기’ 클릭',
  },
  {
    icon: CreditCard,
    title: '운톡 앱에서 회원가입/로그인 후 결제 진행',
  },
  {
    icon: PenSquare,
    title: '주 이용지점 방문하여 계약서 작성',
  },
  {
    icon: Smartphone,
    title: '운톡 앱으로 QR 체크인 후 전국 지점 자유 이용',
  },
];

export function HowToUseSection() {
  return (
    <section id="how-to-use" className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground">
      <div className="container px-4 md:px-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
            헬보올패스 이용 프로세스, <br className="sm:hidden" /><span className="text-primary">지금 바로 시작하세요!</span>
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            간편한 절차로 헬보올패스의 모든 혜택을 누리세요!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {howToUseSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="p-1 h-full">
                  <Card className="flex flex-col h-full bg-secondary/50 border-border/50 shadow-md hover:shadow-primary/20 hover:-translate-y-1 transition-all">
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                          <Icon className="h-7 w-7"/>
                        </div>
                        <span className="text-4xl font-black text-muted-foreground/30">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 flex-grow flex flex-col">
                      <CardTitle className="text-lg md:text-xl font-bold mb-2">{step.title}</CardTitle>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
        </div>
        
        <div className="text-center mt-16">
            <Button asChild size="lg" variant="default" data-gtm-id="how-to-use-more-click">
                <Link href="/usage-guide" prefetch={false}>
                    더 자세한 이용 방법 보기
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>

      </div>
    </section>
  );
}
