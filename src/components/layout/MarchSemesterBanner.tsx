'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MarchSemesterBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const checkDate = () => {
      const now = new Date();
      // 이벤트 기간: 2026년 3월 1일 00:00:00 ~ 3월 31일 23:59:59
      const startDate = new Date(2026, 2, 1, 0, 0, 0); 
      const endDate = new Date(2026, 2, 31, 23, 59, 59);
      
      if (now >= startDate && now <= endDate) {
        setIsVisible(true);
        // 마케팅 효과를 위한 가짜 남은 수량 로직
        const dayProgress = now.getDate() / 31;
        const count = Math.max(8, Math.floor(120 - (112 * dayProgress)));
        setRemaining(count);
      } else {
        setIsVisible(false);
      }
    };

    checkDate();
    const interval = setInterval(checkDate, 1000 * 60 * 60); 
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-[#00C2FF] via-[#007AFF] to-[#5856D6] text-white animate-in fade-in duration-500 relative">
      <Link href="/promo/march" className="group w-full h-full block z-10 relative" data-gtm-id="march-semester-banner-click">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center h-12 gap-2 md:gap-4">
            <Rocket className="h-5 w-5 text-white animate-bounce" />
            <p className="text-xs sm:text-sm font-bold text-center text-shadow flex items-center gap-2 md:gap-4">
              <span className="font-black tracking-wider uppercase" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>2026 MARCH RESET</span>
              <span className="hidden sm:inline">3월, 일상을 다시 세팅할 시간! 헬보올패스 + PT 결합 리셋 패키지</span>
              {remaining !== null && (
                <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] sm:text-xs">
                  지점별 <span className="text-yellow-200">선착순 {remaining}명</span>
                </span>
              )}
            </p>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}
