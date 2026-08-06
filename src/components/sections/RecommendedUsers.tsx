
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Briefcase, Zap, UserCheck, Gem } from 'lucide-react';
import Image from "next/image";

const userTypes = [
  {
    icon: Briefcase,
    title: '잦은 출장/이동으로 운동 루틴 유지가 어려운 직장인',
    image: 'https://firebasestorage.googleapis.com/v0/b/gymflex-pass-fgz47.firebasestorage.app/o/assets%2Fpeople1.png?alt=media',
    imageHint: 'man with briefcase',
  },
  {
    icon: Zap,
    title: '다양한 환경에서 운동하며 새로운 자극을 얻고 싶은 분',
    image: 'https://firebasestorage.googleapis.com/v0/b/gymflex-pass-fgz47.firebasestorage.app/o/assets%2Fpeople2.png?alt=media',
    imageHint: 'energetic person jumping',
  },
  {
    icon: UserCheck,
    title: '시간과 장소에 구애받지 않고 자유롭게 운동하고 싶은 MZ세대',
    image: 'https://firebasestorage.googleapis.com/v0/b/gymflex-pass-fgz47.firebasestorage.app/o/assets%2Fpeople3.png?alt=media',
    imageHint: 'young person with phone',
  },
  {
    icon: Gem,
    title: '헬스보이짐의 프리미엄 서비스를 전국 어디서나 경험하고 싶은 분',
    image: 'https://firebasestorage.googleapis.com/v0/b/gymflex-pass-fgz47.firebasestorage.app/o/assets%2Fpeople4.png?alt=media',
    imageHint: 'person looking at diamond',
  },
];

export function RecommendedUsers() {
  return (
    <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-secondary text-secondary-foreground">
      <div className="container px-4 md:px-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
            헬보올패스,<br className="sm:hidden" /> <span className="text-primary">당신을 위한 선택</span>입니다!
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            당신의 운동 고민, 헬보올패스가 간편하게 해결해 드립니다.
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-4 grid-cols-1 sm:grid-cols-2">
          {userTypes.map((user, index) => {
            const Icon = user.icon;
            return (
              <Card key={index} className="bg-card text-card-foreground border-border/50 shadow-md h-full">
                <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                  <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">{user.title}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
