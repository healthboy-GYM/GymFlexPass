
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Flame, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LimitedOfferBanner() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const calculateRemaining = () => {
      const now = new Date();
      // For testing: const now = new Date('2025-10-15T14:30:00');
      const deadline = new Date(now.getFullYear(), 9, 31, 23, 59, 59); // October is 9

      if (now > deadline) {
        setIsVisible(false);
        return;
      }
      
      setIsVisible(true);

      const dayOfMonth = now.getDate(); // 1-31
      const hourOfDay = now.getHours(); // 0-23
      const totalHoursIntoMonth = (dayOfMonth - 1) * 24 + hourOfDay;

      const initialStock = 987;
      // Reduce by about 1 per hour on average, with some non-linearity
      const hourlyReduction = 0.8 + Math.pow(totalHoursIntoMonth / 744, 1.2); // 744 hours in Oct

      // Add some pseudo-random fluctuation based on the hour
      const randomFactor = (Math.sin(totalHoursIntoMonth * 0.5) * 3) + (Math.cos(totalHoursIntoMonth) * 2);

      let calculatedRemaining = initialStock - (totalHoursIntoMonth * hourlyReduction) + randomFactor;
      
      // Ensure it doesn't go below a certain threshold until near the end of the month
      if (dayOfMonth < 28) {
        calculatedRemaining = Math.max(calculatedRemaining, 990 - (totalHoursIntoMonth * 1.25));
      } else {
        // Drop faster at the very end
        calculatedRemaining = Math.max(calculatedRemaining, (31 - dayOfMonth) * 24 - hourOfDay);
      }

      setRemaining(Math.floor(Math.max(5, calculatedRemaining))); // Never show less than 5 and ensure integer
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000 * 60 * 5); // Recalculate every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || remaining === null) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white animate-in fade-in duration-500 relative">
      <Link href="/promo/october" className="group w-full h-full block z-10 relative" data-gtm-id="limited-offer-banner-click">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-center h-12 gap-4">
            <div className="relative">
                <Flame className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                <Flame className="h-6 w-6 text-yellow-300 absolute top-0 left-0 animate-ping opacity-70" />
            </div>
            <p className="text-sm sm:text-base font-bold text-center">
              <span className="hidden sm:inline">10월 한정 특가! 프리미엄 1개월권 </span>
              <span className="sm:hidden">프리미엄 1개월권 </span>
              <span className="bg-white/20 px-2 py-1 rounded-md">남은 수량: <span className={cn(remaining < 100 && "text-yellow-200 font-black")}>{remaining.toLocaleString()}</span>장</span>
            </p>
            <ArrowRight className="h-5 w-5 hidden md:block group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}
