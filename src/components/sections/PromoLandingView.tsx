'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { splitLines, parseBenefits, discountPercent, type EventDoc } from '@/lib/events';

/**
 * 이벤트(프로모션) 랜딩 본문. /promo/[slug] 페이지와 관리자 미리보기가 공유한다.
 * - preview=true: 링크 이동 없이 시각적 미리보기만(관리자 다이얼로그용).
 */
export function PromoLandingView({ event, preview = false }: { event: EventDoc; preview?: boolean }) {
  const period = [event.startDate, event.endDate].filter(Boolean).join(' ~ ');
  const isExternal = /^https?:\/\//.test(event.ctaLink ?? '');
  const badges = splitLines(event.badges);
  const benefits = parseBenefits(event.benefits);
  const conditions = (event.conditions ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
  const pct = discountPercent(event.originalPrice, event.salePrice);
  const hasPrice = event.salePrice != null || event.originalPrice != null;
  const hasNotice = conditions.length > 0 || !!event.noticeBoxTitle || !!event.noticeBoxBody;
  const isPromoLayout = hasPrice || benefits.length > 0 || hasNotice;

  const CtaButton = ({ className, variant, label }: { className?: string; variant?: 'secondary'; label?: string }) => {
    if (!event.ctaLink) return null;
    const content = (
      <>
        {label || event.ctaText || '자세히 보기'} <ArrowRight className="ml-2 h-5 w-5" />
      </>
    );
    if (preview) {
      return <Button type="button" size="lg" variant={variant} className={className}>{content}</Button>;
    }
    return (
      <Button asChild size="lg" variant={variant} className={className}>
        {isExternal ? (
          <a href={event.ctaLink} target="_blank" rel="noopener noreferrer">{content}</a>
        ) : (
          <Link href={event.ctaLink}>{content}</Link>
        )}
      </Button>
    );
  };

  const PriceBlock = () => (
    <div className="flex items-baseline justify-center gap-3 flex-wrap">
      {event.originalPrice != null && event.salePrice != null && (
        <span className="text-lg font-semibold text-muted-foreground line-through">
          {event.originalPrice.toLocaleString()}원
        </span>
      )}
      <span className="text-5xl md:text-6xl font-black tracking-tighter text-primary">
        {(event.salePrice ?? event.originalPrice ?? 0).toLocaleString()}원
      </span>
      {pct != null && (
        <span className="rounded-lg bg-primary px-2.5 py-1 text-sm font-black text-primary-foreground">{pct}%↓</span>
      )}
    </div>
  );

  return (
    <>
      {/* 히어로 */}
      <section
        className={
          isPromoLayout && !event.imageUrl
            ? 'relative overflow-hidden px-4 py-16 md:py-24 text-center'
            : 'relative w-full min-h-[45vh] flex items-center justify-center overflow-hidden text-center text-white'
        }
      >
        {/* 배경 */}
        {event.imageUrl ? (
          <div aria-hidden className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/40" />
          </div>
        ) : isPromoLayout ? (
          <div aria-hidden className="absolute inset-0 z-0 overflow-hidden bg-background">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(115% 85% at 78% -12%, hsl(var(--primary)/0.22), transparent 55%), radial-gradient(90% 80% at 8% 112%, hsl(var(--primary)/0.10), transparent 55%)',
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
                backgroundSize: '44px 44px',
                WebkitMaskImage: 'radial-gradient(120% 100% at 50% 0%, black, transparent 72%)',
                maskImage: 'radial-gradient(120% 100% at 50% 0%, black, transparent 72%)',
              }}
            />
            <div
              className="absolute -inset-x-1/4 inset-y-0 opacity-50"
              style={{ background: 'repeating-linear-gradient(115deg, transparent 0 88px, hsl(var(--primary)/0.05) 88px 90px)' }}
            />
            <svg
              className="absolute -right-10 -top-10 h-[380px] w-[380px] text-primary opacity-[0.08] md:h-[460px] md:w-[460px]"
              viewBox="0 0 200 210" aria-hidden
            >
              <path d="M74,90 C66,64 74,46 100,46 C126,46 134,64 126,90" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" />
              <path d="M100,82 C64,82 50,116 50,146 C50,176 72,196 100,196 C128,196 150,176 150,146 C150,116 136,82 100,82 Z" fill="currentColor" />
            </svg>
            <div
              className="absolute inset-x-0 bottom-0 h-40"
              style={{ background: 'linear-gradient(to top, hsl(var(--background)), transparent)' }}
            />
          </div>
        ) : (
          <div aria-hidden className="absolute inset-0">
            <div className="h-full w-full bg-gradient-to-br from-primary to-orange-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/40" />
          </div>
        )}

        <div className={`relative z-10 px-2 py-4 max-w-3xl mx-auto space-y-4 ${event.imageUrl ? 'text-white' : ''}`}>
          {event.highlightText && (
            <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">{event.highlightText}</Badge>
          )}
          <h1
            className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] [text-wrap:balance] [word-break:keep-all]"
            style={event.imageUrl ? { textShadow: '0 2px 8px rgba(0,0,0,0.6)' } : undefined}
          >
            {event.title || '(제목을 입력하세요)'}
          </h1>
          {event.subtitle && (
            <p
              className={`mx-auto max-w-[44ch] md:text-lg [text-wrap:balance] [word-break:keep-all] ${event.imageUrl ? 'text-white/90' : 'text-muted-foreground'}`}
              style={event.imageUrl ? { textShadow: '0 1px 4px rgba(0,0,0,0.6)' } : undefined}
            >
              {event.subtitle}
            </p>
          )}
          {period && (
            <p className={`inline-flex items-center gap-1.5 text-sm ${event.imageUrl ? 'text-white/85' : 'text-muted-foreground'}`}>
              <CalendarDays className="h-4 w-4" /> {period}
            </p>
          )}

          {hasPrice && (
            <div className="pt-4">
              <div className="mx-auto inline-flex flex-col items-center gap-1.5 rounded-2xl border border-primary/25 bg-primary/[0.06] px-6 py-4 md:px-9 md:py-5">
                <PriceBlock />
                {event.priceCaption && (
                  <p className={`text-sm ${event.imageUrl ? 'text-white/85' : 'text-muted-foreground'}`}>{event.priceCaption}</p>
                )}
              </div>
            </div>
          )}

          {badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {badges.map((b) => (
                <span key={b} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {b}
                </span>
              ))}
            </div>
          )}

          {event.ctaLink && (
            <div className="pt-4">
              <CtaButton className="h-14 px-10 text-lg font-bold shadow-xl" />
            </div>
          )}
        </div>
      </section>

      {/* 혜택 카드 */}
      {benefits.length > 0 && (
        <section className="px-4 py-16 md:py-20">
          <div className="container max-w-5xl">
            <div className="mb-10 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Benefits</span>
              <h2 className="mt-2 text-2xl md:text-4xl font-black tracking-tighter">이벤트 혜택</h2>
            </div>
            <div className={`grid gap-4 sm:grid-cols-2 ${benefits.length === 3 || benefits.length >= 5 ? 'lg:grid-cols-3' : ''}`}>
              {benefits.map((b, i) => (
                <div
                  key={`${b.title}-${i}`}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/30 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60"
                >
                  <span className="pointer-events-none absolute -right-1 top-0 select-none text-6xl font-black leading-none tabular-nums text-primary/10">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="relative">
                    <div className="mb-4 h-1 w-8 rounded-full bg-primary" />
                    <h3 className="text-lg font-bold [word-break:keep-all]">{b.title}</h3>
                    {b.desc && <p className="mt-2 text-sm leading-relaxed text-muted-foreground [word-break:keep-all]">{b.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 본문 */}
      {event.body && (
        <section className="border-t border-border/40 px-4 py-12 md:py-16">
          <div className="container max-w-2xl">
            <p className="whitespace-pre-line text-base md:text-lg leading-relaxed text-foreground/90">
              {event.body}
            </p>
          </div>
        </section>
      )}

      {/* 유의사항 및 안내 */}
      {hasNotice && (
        <section className="border-t border-border/40 px-4 py-14 md:py-20">
          <div className="container max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" /> 유의사항 및 안내
            </h2>
            <div className="space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
              {(event.noticeBoxTitle || event.noticeBoxBody) && (
                <div className="rounded-xl border border-border/60 border-l-[3px] border-l-primary bg-card p-5 md:p-6">
                  {event.noticeBoxTitle && <p className="text-foreground font-bold mb-2">{event.noticeBoxTitle}</p>}
                  {event.noticeBoxBody && <p className="whitespace-pre-line [word-break:keep-all]">{event.noticeBoxBody}</p>}
                </div>
              )}
              {conditions.length > 0 && (
                <ul className="space-y-2.5">
                  {conditions.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 [word-break:keep-all]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 클로징 CTA */}
      {event.ctaLink && isPromoLayout && (
        <section className="bg-primary text-primary-foreground px-4 py-16 text-center">
          <div className="container max-w-2xl space-y-5">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.1] [text-wrap:balance] [word-break:keep-all]">
              {event.title}
            </h2>
            {badges.length > 0 && <p className="font-bold text-primary-foreground/80">{badges.join(' · ')}</p>}
            <CtaButton
              variant="secondary"
              className="h-14 px-10 text-lg font-bold bg-background text-primary hover:bg-background/90"
              label={event.ctaText || '지금 시작하기'}
            />
          </div>
        </section>
      )}

      {!preview && (
        <div className="py-12 text-center">
          <Button asChild variant="outline"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기</Link></Button>
        </div>
      )}
    </>
  );
}
