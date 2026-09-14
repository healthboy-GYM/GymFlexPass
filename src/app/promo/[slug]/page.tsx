'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getEventBySlug, type EventDoc } from '@/lib/events';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarDays, ArrowLeft, ArrowRight } from 'lucide-react';

export default function EventPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : String(params?.slug ?? '');
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getEventBySlug(slug)
      .then((e) => { if (alive) { setEvent(e); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-bold">이벤트를 찾을 수 없습니다</h1>
          <p className="text-muted-foreground">종료되었거나 주소가 올바르지 않은 이벤트입니다.</p>
          <Button asChild variant="outline"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> 홈으로</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const period = [event.startDate, event.endDate].filter(Boolean).join(' ~ ');
  const isExternal = /^https?:\/\//.test(event.ctaLink ?? '');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* 히어로 */}
        <section className="relative w-full min-h-[45vh] flex items-center justify-center overflow-hidden text-center text-white">
          <div aria-hidden className="absolute inset-0">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary to-orange-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/40" />
          </div>
          <div className="relative px-4 py-16 max-w-2xl mx-auto space-y-4">
            {event.highlightText && (
              <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">{event.highlightText}</Badge>
            )}
            <h1 className="text-3xl md:text-5xl font-black leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              {event.title}
            </h1>
            {event.subtitle && (
              <p className="text-lg md:text-xl text-white/90" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                {event.subtitle}
              </p>
            )}
            {period && (
              <p className="inline-flex items-center gap-1.5 text-sm text-white/85">
                <CalendarDays className="h-4 w-4" /> {period}
              </p>
            )}
          </div>
        </section>

        {/* 본문 */}
        <section className="container px-4 md:px-6 py-12 md:py-16 max-w-2xl mx-auto">
          {event.body && (
            <p className="whitespace-pre-line text-base md:text-lg leading-relaxed text-foreground/90">
              {event.body}
            </p>
          )}

          {event.ctaLink && (
            <div className="mt-10 text-center">
              <Button asChild size="lg" className="h-14 px-10 text-lg font-bold shadow-xl">
                {isExternal ? (
                  <a href={event.ctaLink} target="_blank" rel="noopener noreferrer">
                    {event.ctaText || '자세히 보기'} <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                ) : (
                  <Link href={event.ctaLink}>
                    {event.ctaText || '자세히 보기'} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                )}
              </Button>
            </div>
          )}

          <div className="mt-12 text-center">
            <Button asChild variant="outline"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기</Link></Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
