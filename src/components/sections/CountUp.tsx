'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 화면에 들어올 때 0 → end 로 올라가는 숫자(의존성 없음).
 * 모션 최소화 설정 시 즉시 최종값 표시.
 */
export function CountUp({ end, duration = 1300, className }: { end: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVal(end);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const t0 = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - t0) / duration);
              const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
              setVal(Math.round(end * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  return <span ref={ref} className={className}>{val.toLocaleString()}</span>;
}
