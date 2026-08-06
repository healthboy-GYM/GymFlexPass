'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { subscribeEvents, type EventDoc } from '@/lib/events';
import { CalendarDays, ArrowRight } from 'lucide-react';

/**
 * 홈에 "진행 중인 이벤트"를 자동 노출.
 * 관리자가 만든 활성 이벤트 중 아직 종료되지 않은 것을 카드로 표시.
 * 진행 중 이벤트가 없으면 아무것도 렌더링하지 않음(섹션 숨김).
 */
export function EventShowcase() {
  const [events, setEvents] = useState<EventDoc[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const unsub = subscribeEvents(
      (all) => {
        // 활성(subscribeEvents 기본) + 종료일이 없거나 오늘 이후인 것만
        const ongoing = all.filter((e) => !e.endDate || e.endDate >= today);
        setEvents(ongoing);
      },
      { onError: () => setEvents([]) }
    );
    return () => unsub();
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="w-full py-12 md:py-20 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">진행 중인 이벤트</h2>
          <p className="text-muted-foreground mt-2">지금 참여할 수 있는 헬보올패스 이벤트를 확인하세요.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {events.map((e) => (
            <Link
              key={e.slug}
              href={`/promo/${e.slug}`}
              className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg"
              data-gtm-id={`home-event-${e.slug}-click`}
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                {e.imageUrl ? (
                  <img src={e.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary to-orange-500" />
                )}
                {e.highlightText && (
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow">
                    {e.highlightText}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="line-clamp-1 text-lg font-bold text-foreground">{e.title}</h3>
                {e.subtitle && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.subtitle}</p>}
                {(e.startDate || e.endDate) && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {[e.startDate, e.endDate].filter(Boolean).join(' ~ ')}
                  </p>
                )}
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  자세히 보기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
