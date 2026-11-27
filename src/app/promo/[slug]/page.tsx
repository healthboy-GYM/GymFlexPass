'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getEventBySlug, type EventDoc } from '@/lib/events';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { PromoLandingView } from '@/components/sections/PromoLandingView';
import { Loader2, ArrowLeft } from 'lucide-react';

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <PromoLandingView event={event} />
      </main>
      <Footer />
    </div>
  );
}
