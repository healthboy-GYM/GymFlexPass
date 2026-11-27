'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export function QuitSmokingBanner() {
  const [isVisible, setIsVisible] = useState(false);

  // Memoize dates to prevent infinite loops in useEffect
  const startDate = useMemo(() => new Date(new Date().getFullYear(), 11, 15, 0, 0, 0), []); // December 15th
  const endDate = useMemo(() => new Date(new Date().getFullYear() + (new Date().getMonth() > 10 ? 1 : 0), 0, 31, 23, 59, 59), []); // January 31st

  useEffect(() => {
    const checkDate = () => {
      const now = new Date();
      if (now >= startDate && now <= endDate) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    checkDate();
    const interval = setInterval(checkDate, 1000 * 60 * 60); // Check every hour

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-700 via-emerald-800 to-black text-white animate-in fade-in duration-500 relative">
      <Link href="/promo/quit-smoking" className="group w-full h-full block z-10 relative" data-gtm-id="quit-smoking-banner-click">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center h-12 gap-2 md:gap-4">
             <div className="relative w-20 h-5">
                <Image
                    src="https://placehold.co/80x20/png?text=GOV"
                    alt="보건복지부 로고"
                    fill
                    className="object-contain invert brightness-0 saturate-200 contrast-200"
                    data-ai-hint="government logo"
                />
             </div>
            <p className="text-xs sm:text-sm font-bold text-center text-shadow flex items-center gap-2 md:gap-4">
              <span className="hidden sm:inline">보건복지부와 함께하는</span>
              <span className="font-black tracking-wider text-green-300" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>금연 챌린지</span>
            </p>
            <ArrowRight className="h-5 w-5 hidden md:block group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}
