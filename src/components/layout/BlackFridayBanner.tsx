
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BlackFridayBanner() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(true);

  const startDate = new Date(new Date().getFullYear(), 10, 17, 0, 0, 0); // November 17th, 00:00
  const deadline = new Date(new Date().getFullYear(), 10, 30, 23, 59, 59); // November 30th, 23:59:59

  useEffect(() => {
    const calculateState = () => {
      const now = new Date();
      
      // --- Time Left Calculation ---
      const totalSeconds = (deadline.getTime() - now.getTime()) / 1000;
      if (totalSeconds > 0) {
        setTimeLeft({
          days: Math.floor(totalSeconds / (3600 * 24)),
          hours: Math.floor((totalSeconds / 3600) % 24),
          minutes: Math.floor((totalSeconds / 60) % 60),
          seconds: Math.floor(totalSeconds % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }

      // --- Remaining Quantity Calculation ---
      const totalEventSeconds = (deadline.getTime() - startDate.getTime()) / 1000;
      const elapsedSeconds = Math.max(0, (now.getTime() - startDate.getTime()) / 1000);
      const progress = Math.min(1, elapsedSeconds / totalEventSeconds);

      const initialStock = 300;
      const consumed = initialStock * Math.pow(progress, 1.5);
      
      let calculatedRemaining = initialStock - consumed;
      
      const randomFactor = (Math.sin(elapsedSeconds / 3600) * 2) + (Math.cos(elapsedSeconds / 1800) * 1);
      calculatedRemaining += randomFactor;

      if (progress < 0.9) {
        calculatedRemaining = Math.max(calculatedRemaining, 10);
      } else {
        calculatedRemaining = Math.max(calculatedRemaining, 5);
      }
      
      if (now < startDate) {
        setRemaining(300);
      } else if (now > deadline) {
        setRemaining(0);
      } else {
        setRemaining(Math.floor(Math.max(5, calculatedRemaining)));
      }
    };

    calculateState();
    const interval = setInterval(calculateState, 1000); 

    return () => clearInterval(interval);
  }, []); // Empty dependency array to run only once

  const formatTime = (time: number) => time.toString().padStart(2, '0');
  
  if (!isVisible || remaining === null) {
      return null;
  }


  return (
    <div className="bg-gradient-to-r from-red-600 via-neutral-900 to-black text-white animate-in fade-in duration-500 relative">
      <a href="/promo/black-friday" className="group w-full h-full block z-10 relative" data-gtm-id="black-friday-banner-click">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center h-12 gap-2 md:gap-4">
            <div className="relative">
                <Flame className="h-6 w-6 text-destructive group-hover:scale-110 transition-transform animate-pulse" style={{filter: 'drop-shadow(0 0 5px hsl(var(--destructive)))'}} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-center text-shadow flex items-center gap-2 md:gap-4">
              <span className="font-black tracking-wider text-destructive" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>BLACK FRIDAY</span>
              {remaining !== null && <span className="hidden sm:inline bg-black/30 px-2 py-1 rounded-md">남은 수량: <span className={cn("font-black", remaining < 50 ? "text-destructive" : "text-white")}>{remaining.toLocaleString()}</span>개</span>}
              <span className="hidden md:flex items-center bg-black/30 px-2 py-1 rounded-md">
                <Clock className="mr-1.5 h-3 w-3" />
                남은 기간: {timeLeft.days > 0 && `${timeLeft.days}일 `}{formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
              </span>
            </p>
            <ArrowRight className="h-5 w-5 hidden md:block group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </a>
    </div>
  );
}

    