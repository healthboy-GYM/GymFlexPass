
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FebStarterBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const checkDate = () => {
      const now = new Date();
      // Event: Feb 1st to Feb 28th
      const startDate = new Date(2026, 1, 1, 0, 0, 0); 
      const endDate = new Date(2026, 1, 28, 23, 59, 59);
      
      if (now >= startDate && now <= endDate) {
        setIsVisible(true);
        // Fake remaining count logic for marketing effect
        const dayProgress = now.getDate() / 28;
        const count = Math.max(12, Math.floor(150 - (138 * dayProgress)));
        setRemaining(count);
      } else {
        setIsVisible(false);
      }
    };

    checkDate();
    const interval = setInterval(checkDate, 1000 * 60 * 60); // Check every hour
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-[#FF4D00] via-[#FF8A00] to-[#FFB800] text-white animate-in fade-in duration-500 relative">
      <Link href="/promo/february" className="group w-full h-full block z-10 relative" data-gtm-id="feb-starter-banner-click">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center h-12 gap-2 md:gap-4">
            <Flame className="h-5 w-5 text-white animate-pulse" />
            <p className="text-xs sm:text-sm font-bold text-center text-shadow flex items-center gap-2 md:gap-4">
              <span className="font-black tracking-wider uppercase" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Feb Starter Pack</span>
              <span className="hidden sm:inline">커피 몇 잔 값으로 배우는 평생 운동 기술! 1개월+PT 패키지</span>
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
