
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export function CTASection() {
  return (
    <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 text-center animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
        <span className="inline-block mb-3 text-xs font-bold tracking-[0.16em] uppercase text-primary-foreground/70">
          Make Your Move
        </span>
        <h2 className="text-4xl font-black tracking-tighter md:text-5xl lg:text-6xl mb-4 leading-[1.05]">
          지금 바로 경험하세요!
        </h2>
        <p className="max-w-2xl mx-auto text-base md:text-lg mb-8 text-primary-foreground/90">
          헬보올패스로 당신의 운동 라이프를 한 단계 업그레이드하세요!
        </p>
        <div className="flex justify-center">
          <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/80 h-12 px-6 text-base md:text-lg font-bold shadow-lg h-12 px-6 md:h-14 md:px-8" asChild data-gtm-id="cta-purchase-click">
            <Link href="/purchase" prefetch={false}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              헬보올패스 구매하기
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
