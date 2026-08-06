
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Gem } from 'lucide-react';
import Image from 'next/image';
import { Reveal } from '@/components/sections/Reveal';

const coreValues = [
  {
    icon: MapPin,
    title: '자유로운 이동성 & 편의성',
    description: [
      '전국 80여개 지점, 어디서든 당신의 헬스장이 됩니다.',
      '평일엔 회사 앞, 주말엔 집 앞, 출장 중에도 자유롭게!',
    ],
  },
  {
    icon: Clock,
    title: '내 일상에 맞춘 유연함',
    description: [
      '시간과 장소에 구애받지 않고, 원하는 때 원하는 곳에서 운동하세요.',
      '운동이 내 삶에 자연스럽게 스며듭니다.',
    ],
  },
  {
    icon: Gem,
    title: '프리미엄 경험 보장',
    description: [
      '일관된 고품격 서비스와 시설을 전국 어디서나 누리세요.',
      '헬보올패스가 당신의 운동을 한 단계 업그레이드합니다.',
    ],
  },
];

export function CoreValuesSection() {
  return (
    <section id="core-values" className="relative w-full py-12 md:py-24 lg:py-32 bg-secondary text-secondary-foreground overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
            <Image
                src="https://picsum.photos/seed/koreamap/1920/1080"
                alt="Korea map with interconnected gyms"
                fill
                className="object-cover"
                data-ai-hint="korea map network"
            />
            <div className="absolute inset-0 bg-secondary/80"></div>
        </div>
      <div className="container relative z-10 px-4 md:px-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
        <Reveal className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-foreground">
            헬보올패스,<br className="sm:hidden" /> <span className="text-primary">당신의 운동을 혁신합니다!</span>
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            내가 가는 곳이 헬스장이 된다, 헬보올패스
          </p>
        </Reveal>
        <div className="mx-auto grid max-w-5xl items-stretch gap-6 lg:grid-cols-3 md:gap-8">
          {coreValues.map((value, index) => {
            const Icon = value.icon;
            return (
              <Reveal key={index} delay={index * 140} className="h-full">
              <Card className="group flex h-full flex-col bg-card/80 text-card-foreground border-border/50 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-primary/10">
                <CardHeader className="flex flex-col items-center text-center p-6">
                  <div className="mb-4 rounded-full bg-primary/20 p-4 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/30">
                    <Icon className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-xl font-semibold leading-snug text-foreground">{value.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 text-center text-muted-foreground space-y-3">
                  {value.description.map((desc, i) => (
                    <p key={i} className="text-sm">{desc}</p>
                  ))}
                </CardContent>
              </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
