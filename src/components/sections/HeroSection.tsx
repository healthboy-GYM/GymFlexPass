'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section id="hero" className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 z-0 w-full h-full">
        <video
          src="https://firebasestorage.googleapis.com/v0/b/gymflex-pass-fgz47.firebasestorage.app/o/assets%2FMain%20Video.mp4?alt=media&token=e9392c64-42f2-4c22-b52b-70b8686b24a3"
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
      </div>

      <div className="relative z-20 flex flex-col items-center px-4 text-white animate-in fade-in duration-1000">
        <Image 
          src="/logo.png" 
          alt="헬스보이짐 로고" 
          width={400} 
          height={100} 
          className="w-40 md:w-64 mb-6"
          style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}
          priority
        />
        <h1 
          className="font-bold tracking-tight mb-4"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
          <span className="block text-5xl md:text-7xl lg:text-8xl font-black">
            헬보<span className="text-primary font-black text-[1.1em]">ALL</span>패스
          </span>
          <span className="mt-4 block text-xl md:text-3xl lg:text-4xl">
            한 지점 등록 가격으로<br className="md:hidden" /> 전국 80여개 지점 자유 이용!
          </span>
        </h1>
        <p 
          className="max-w-3xl text-base md:text-lg text-neutral-100 mb-8 leading-relaxed"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          운동하고 싶을 땐 언제 어디서나! 올데이 올패스!
          <br />
          골프만 등록해도, 필라테스만 등록해도 헬보올패스 이용 가능!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg font-bold shadow-lg h-12 px-6 md:h-14 md:px-8" data-gtm-id="hero-details-click">
                <Link href="/helbo-pass">
                    헬보올패스 더 자세히 보기 <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base md:text-lg font-bold shadow-lg h-12 px-6 md:h-14 md:px-8 bg-transparent border-2 border-white text-white hover:bg-white/10" data-gtm-id="hero-branch-locator-click">
                <Link href="/branch-locator">
                    <Search className="mr-2 h-4 w-4" />
                    내 주변 지점 찾기
                </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
