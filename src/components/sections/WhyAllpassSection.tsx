
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Reveal } from '@/components/sections/Reveal';

const problems = [
  {
    imageSrc: 'https://firebasestorage.googleapis.com/v0/b/gymflex-pass-fgz47.firebasestorage.app/o/assets%2Fcommute.jpg?alt=media',
    imageHint: 'commute workout',
    text: (
      <>
        <span className="hidden sm:block">
          평일엔 회사 앞, 주말엔 집 앞 헬스장이 멀어 운동을 쉬시나요?
        </span>
        <span className="block sm:hidden">
          평일엔 회사 앞 헬스장에서 운동했지만, <br />
          회사 앞 헬스장이 멀어서 주말엔 운동을 못하셨나요?
        </span>
      </>
    ),
  },
  {
    imageSrc: 'https://firebasestorage.googleapis.com/v0/b/gymflex-pass-fgz47.firebasestorage.app/o/assets%2Ftravel.jpg?alt=media',
    imageHint: 'travel workout',
    text: (
      <>
        <span className="hidden sm:inline">
          출장/여행 중에도 운동 루틴을 꾸준히 이어가고 싶으신가요?
        </span>
        <span className="inline sm:hidden">
          출장/여행 중에도
          <br />
          운동 루틴을 꾸준히 이어가고 싶으신가요?
        </span>
      </>
    ),
  },
  {
    imageSrc: 'https://firebasestorage.googleapis.com/v0/b/gymflex-pass-fgz47.firebasestorage.app/o/assets%2Fboring.jpg?alt=media',
    imageHint: 'boring routine',
    text: '늘 똑같은 운동 환경이 지루하게 느껴지진 않으셨나요?',
  },
];

export function WhyAllpassSection() {
  return (
    <section
      id="why-allpass"
      className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground"
    >
      <div className="container px-4 md:px-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
        <Reveal className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            당신의 운동, <br className="sm:hidden" />혹시 이런 고민 없으셨나요?
          </h2>
        </Reveal>
        <div className="mx-auto grid max-w-5xl items-start gap-6 sm:grid-cols-1 md:grid-cols-3 md:gap-8">
          {problems.map((problem, index) => (
            <Reveal key={index} delay={index * 120}>
            <Card
              className="relative overflow-hidden rounded-lg shadow-lg group h-72 md:h-80 border-border/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10"
            >
              <Image
                src={problem.imageSrc}
                alt={typeof problem.text === 'string' ? problem.text : 'Fitness problem'}
                data-ai-hint={problem.imageHint}
                priority={index === 0}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent" />
              <CardContent className="relative h-full flex flex-col justify-end p-6">
                <p className="text-xl font-semibold leading-relaxed text-white transition-transform duration-300 group-hover:-translate-y-1">
                  {problem.text}
                </p>
              </CardContent>
            </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
