
'use client';

import Link from 'next/link';
import { ArrowRight, Gift } from 'lucide-react';

export function NewYearCountdownBanner() {
  return (
    <div className="bg-gradient-to-r from-destructive via-red-500 to-orange-400 text-white animate-in fade-in duration-500 relative">
      <Link href="/promo/new-year" className="group w-full h-full block z-10 relative" data-gtm-id="new-year-banner-click">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center h-12 gap-2 md:gap-4">
            <Gift className="h-6 w-6 text-white group-hover:scale-110 transition-transform animate-pulse" />
            <p className="text-xs sm:text-sm font-bold text-center text-shadow">
              <span className="font-black tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>새해 작심3일 챌린지!</span>
              <span className="hidden sm:inline"> 3일 이용권 3,300원! (~1/30)</span>
            </p>
            <ArrowRight className="h-5 w-5 hidden md:block group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}
