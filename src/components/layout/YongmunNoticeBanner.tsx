'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { subscribeBanner, FALLBACK_BANNER as FALLBACK, type NoticeBanner } from '@/lib/banner';

export function BranchNoticeBanner() {
  const [banner, setBanner] = useState<NoticeBanner | null>(FALLBACK);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const unsub = subscribeBanner(
      (b) => setBanner(b ?? FALLBACK), // 문서 없으면 폴백 유지
      () => setBanner(FALLBACK)         // 오류 시에도 폴백
    );
    return () => unsub();
  }, []);

  if (closed || !banner || !banner.enabled || !banner.text?.trim()) return null;

  const isWarning = banner.variant !== 'info';
  const Icon = isWarning ? AlertTriangle : Info;
  const styles = isWarning
    ? 'bg-yellow-500 text-black border-yellow-600'
    : 'bg-blue-600 text-white border-blue-700';

  const label = (
    <div className="text-xs sm:text-sm font-bold text-center leading-relaxed">
      <p className="inline-block">{banner.text}</p>
    </div>
  );

  return (
    <div className={cn('animate-in fade-in duration-500 relative border-b shadow-sm', styles)}>
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-center min-h-12 py-2 gap-2 md:gap-4">
          <Icon className="h-5 w-5 flex-shrink-0" />
          {banner.link ? (
            <Link href={banner.link} className="hover:underline">{label}</Link>
          ) : (
            label
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setClosed(true)}
            className="h-6 w-6 rounded-full hover:bg-black/10 flex-shrink-0"
            aria-label="안내 배너 닫기"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
