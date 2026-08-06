
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Crown, Gem, Medal, BarChart3, Heart, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/sections/Reveal';

const passTiersData: {
  name: string;
  koreanName: string;
  icon: LucideIcon;
  summary: string;
  color: string;
  iconBg: string;
  bar: string;
  glow: string;
}[] = [
  {
    name: 'S-PREMIUM',
    koreanName: 'S-프리미엄',
    icon: Crown,
    summary: '모든 지점 이용 가능',
    color: 'text-red-500',
    iconBg: 'bg-red-500/10',
    bar: 'from-red-500 to-red-400',
    glow: 'hover:shadow-red-500/25',
  },
  {
    name: 'PREMIUM',
    koreanName: '프리미엄',
    icon: Gem,
    summary: 'S-프리미엄 등급 제외 이용',
    color: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    bar: 'from-blue-500 to-sky-400',
    glow: 'hover:shadow-blue-500/25',
  },
  {
    name: 'GOLD',
    koreanName: '골드',
    icon: Medal,
    summary: 'Gold, Silver, Black 이용',
    color: 'text-yellow-500',
    iconBg: 'bg-yellow-500/10',
    bar: 'from-yellow-500 to-amber-400',
    glow: 'hover:shadow-yellow-500/25',
  },
  {
    name: 'SILVER',
    koreanName: '실버',
    icon: BarChart3,
    summary: 'Silver, Black 이용',
    color: 'text-slate-400',
    iconBg: 'bg-slate-400/10',
    bar: 'from-slate-400 to-slate-300',
    glow: 'hover:shadow-slate-400/25',
  },
  {
    name: 'BLACK',
    koreanName: '블랙',
    icon: Heart,
    summary: 'Black 등급 지점만 이용',
    color: 'text-neutral-400',
    iconBg: 'bg-neutral-400/10',
    bar: 'from-neutral-500 to-neutral-400',
    glow: 'hover:shadow-neutral-400/25',
  },
];

export function PassDetailsSection() {
  return (
    <section id="pass-details" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
      <div className="container px-4 md:px-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
        <Reveal className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
            내게 맞는 <span className="text-primary">헬보올패스</span> 등급 찾기
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            라이프스타일에 맞춰 5가지 등급 중 가장 적합한 플랜을 선택하세요.
          </p>
        </Reveal>
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {passTiersData.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <Reveal key={tier.name} delay={index * 90} className="h-full">
              <Card className={`group relative h-full overflow-hidden bg-card text-card-foreground border-border/50 shadow-md text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${tier.glow}`}>
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tier.bar} opacity-70 transition-opacity duration-300 group-hover:opacity-100`} />
                <CardHeader>
                  <div className="flex justify-center items-center">
                    <div className={`rounded-2xl p-3 ${tier.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`h-9 w-9 ${tier.color}`} />
                    </div>
                  </div>
                  <CardTitle className={`text-xl font-bold ${tier.color}`}>{tier.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tier.summary}</p>
                </CardContent>
              </Card>
              </Reveal>
            );
          })}
        </div>
        <div className="text-center mt-12">
          <Button asChild size="lg" data-gtm-id="pass-details-more-click">
            <Link href="/tier-guide" prefetch={false}>
              더 자세한 등급 보기 <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
