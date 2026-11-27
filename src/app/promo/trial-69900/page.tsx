import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertCircle, CircleCheck, MapPin, UserCheck, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const SITE = 'https://healthboypass.co.kr';
// 가격 관리 CMS에 만들 체험 상품명 — CTA는 이 상품이 선택된 구매 페이지로 보낸다.
const PRODUCT_NAME = '체험 10일+PT 2회';
const CTA_LINK = `/purchase?product=${encodeURIComponent(PRODUCT_NAME)}`;
// 히어로 배경 영상 + 포스터 이미지(영상 로드 전/자동재생 차단 시 노출). public/promo/trial-69900/
const HERO_VIDEO = '/promo/trial-69900/pt-hero.mp4';
// poster = 영상 첫 프레임(영상 재생 전/자동재생 차단 시 노출). 영상과 동일 장면이라 깜빡임·옛 이미지 없음.
const HERO_DESKTOP = '/promo/trial-69900/pt-hero-poster.webp';

const PRICE = 69900;
const LIST_PRICE = 176000; // 정가(표시광고 기준 실제 판매가로 확인 필요)
const DISCOUNT = Math.round((1 - PRICE / LIST_PRICE) * 100);

export const metadata: Metadata = {
  title: '연속 10일 + PT 2회 69,900원 체험 이벤트 | 헬보올패스',
  description:
    '첫 1주일이 모든 것을 결정합니다. 헬스 연속 10일 + 1:1 PT 2회를 69,900원에 — 커리큘럼 6종 중 선택. 신규 회원 한정, 선착순 100명.',
  alternates: { canonical: `${SITE}/promo/trial-69900` },
  openGraph: {
    title: '연속 10일 + PT 2회 69,900원 체험 이벤트',
    description: '헬스 연속 10일 + 1:1 PT 2회 69,900원 · 커리큘럼 6종 중 선택 · 신규 회원 한정.',
    type: 'website',
    locale: 'ko_KR',
    url: `${SITE}/promo/trial-69900`,
    siteName: '헬보 올패스',
  },
};

const IMG = '/promo/trial-69900';
const curriculum: { title: string; icon: string; img: string; s1: [string, string]; s2: [string, string]; target: string }[] = [
  {
    title: '체중감량 가이드',
    icon: 'fi-sr-treadmill',
    img: `${IMG}/pt-weight-loss.webp`,
    s1: ['진단 + 서킷', '체성분 분석, 근력 서킷 체험과 강도 조절'],
    s2: ['인터벌 + 습관', '인터벌 유산소 설계, 운동·식사 기록 피드백'],
    target: '체지방은 빼고 싶은데 뭐부터 할지 막막하다면',
  },
  {
    title: '운동기구 사용 가이드',
    icon: 'fi-sr-gym',
    img: `${IMG}/pt-equipment.webp`,
    s1: ['유산소·하체', '유산소 기구와 하체 머신 세팅·실습'],
    s2: ['상체·케이블', '상체 머신·케이블, 셀프 루틴 구성'],
    target: '기구에 앉아도 어디부터 조절할지 모르겠다면',
  },
  {
    title: '운동루틴 설계',
    icon: 'fi-sr-list-check',
    img: `${IMG}/pt-routine.webp`,
    s1: ['평가 + 루틴 A', '동작 평가, 첫 번째 루틴 수행'],
    s2: ['루틴 B + 규칙', '두 번째 루틴, 중량·횟수 진행 규칙'],
    target: '갈 때마다 어떤 운동을 할지 고민된다면',
  },
  {
    title: '프리웨이트 입문',
    icon: 'fi-sr-dumbbell-weightlifting',
    img: `${IMG}/pt-free-weights.webp`,
    s1: ['스쿼트·힌지', '브레이싱, 하체 두 패턴 익히기'],
    s2: ['프레스·로우', '상체 두 패턴, 바벨 기초 소개'],
    target: '머신만 쓰다가 바벨·덤벨은 겁난다면',
  },
  {
    title: '부위별 재활가이드',
    icon: 'fi-sr-meditation',
    img: `${IMG}/pt-mobility.webp`,
    s1: ['평가·안정화', '문진·가동범위·불편 동작 확인, 안정화 운동'],
    s2: ['교정 루틴', '센터·홈에서 할 교정운동 루틴 구성'],
    target: '통증·불편한 곳이 있어 조심히 시작하고 싶다면',
  },
  {
    title: '시니어 측정케어',
    icon: 'fi-sr-measuring-tape',
    img: `${IMG}/pt-senior.webp`,
    s1: ['체력 측정', '악력·의자 일어서기·균형·보행 측정'],
    s2: ['기능 운동', '측정 결과 기반 하체·균형 운동'],
    target: '체력부터 재보고 차근차근 시작하고 싶다면',
  },
];

const conditions = [
  '신규 회원 한정 · 1인 1회',
  '선착순 100명, 소진 시 조기 마감될 수 있습니다',
  '결제 후 선택하신 주 이용지점 방문 시 활성화 · 양도 불가',
  'PT 2회는 반드시 체험 기간(연속 10일) 내에 예약·사용해야 하며, 기간 종료 후에는 사용할 수 없습니다',
];

const trustBadges: { icon: LucideIcon; t: string; s: string }[] = [
  { icon: MapPin, t: '전국 70여개 지점', s: '헬스보이짐 네트워크' },
  { icon: UserCheck, t: '1:1 전문 PT 2회', s: '회당 50분 · 담당 트레이너' },
  { icon: Sparkles, t: '신규 회원 한정', s: '1인 1회 · 선착순 100' },
  { icon: ShieldCheck, t: '지점 방문 시 활성화', s: '주 이용지점에서 이용' },
];

const faqs: { q: string; a: string }[] = [
  { q: '기존 회원도 신청할 수 있나요?', a: '신규 회원 한정 상품으로, 1인 1회 신청할 수 있습니다. 이미 가입 이력이 있는 기존·휴면 회원은 대상에서 제외됩니다.' },
  { q: "'연속 10일'은 어떻게 계산되나요?", a: '결제 후 선택하신 주 이용지점에 처음 방문해 활성화한 날부터 연속 10일간 이용합니다.' },
  { q: 'PT 2회는 어떻게 받나요?', a: '담당 트레이너 배정 후 예약제로 진행되며, 위 6가지 커리큘럼 중 원하는 방향으로 받습니다. PT 2회는 반드시 체험 기간(연속 10일) 내에 받아야 하며, 기간이 끝나면 사용할 수 없습니다.' },
  { q: '어느 지점에서 이용하나요?', a: '결제 시 선택하신 주 이용지점에서 헬스 이용과 PT를 받습니다.' },
  { q: '양도나 환불이 되나요?', a: '구매한 이용권의 양도는 불가합니다. 환불은 관련 법령 및 센터 규정에 따라 처리됩니다.' },
  { q: '결제는 어떻게 하나요?', a: "'지금 체험 시작하기'를 누르고 이름·연락처·주 이용지점을 입력한 뒤 결제로 진행됩니다." },
];

export default function Trial69900Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Flaticon UIcons(solid-rounded) — 커리큘럼 아이콘용. 이 페이지에만 로드 */}
      <link rel="preconnect" href="https://cdn-uicons.flaticon.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css"
      />
      <Header />
      <main className="flex-grow">
        {/* 히어로 — 실사 사진 배경 */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={HERO_DESKTOP}
            >
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
            {/* 왼쪽을 어둡게 — 좌측 텍스트 가독 (모바일은 하단까지 보강) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:via-transparent" />
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(70% 60% at 15% 30%, hsl(var(--primary)/0.14), transparent 60%)' }}
            />
          </div>
          <div className="relative z-10 container px-4 md:px-6 py-20 md:py-28 max-w-3xl text-white">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Welcome Care · 헬스 10일 + PT 2회
            </span>
            <p className="mt-3 text-xl md:text-2xl font-bold text-white/90 [word-break:keep-all]" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
              헬스장에 가면, 뭐부터 하지?
            </p>
            <h1 className="mt-1.5 text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] [text-wrap:balance] [word-break:keep-all]" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
              처음 두 번은<br />트레이너와 함께.
            </h1>
            <p className="mt-5 max-w-[48ch] text-base md:text-lg text-white/90 [word-break:keep-all]" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
              기구 사용법부터 내게 맞는 운동 순서까지 배우고, 혼자서도 해보세요. 지금 <b className="text-primary">69,900원</b>으로 시작하세요.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="h-14 px-10 text-lg font-bold shadow-xl" data-gtm-id="trial69900-hero-cta">
                <Link href={CTA_LINK}>지금 체험 시작하기 <ArrowRight className="ml-1.5 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 가격 카드 */}
        <section className="px-4 md:px-6 py-10 md:py-14">
          <div className="container max-w-4xl">
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-b from-card to-background p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-black text-primary-foreground">정가 대비 {DISCOUNT}% 할인</span>
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">신규 회원 한정</span>
                  </div>
                  <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight [word-break:keep-all] [text-wrap:balance]">헬스 10일 + 웰컴 PT 2회</h2>
                  <p className="mt-2 text-sm md:text-base text-muted-foreground [word-break:keep-all]">
                    50분 × 2회 1:1 PT + 헬스 <b className="text-foreground">연속 10일</b> 자유 이용 · 아래 커리큘럼 <b className="text-foreground">6종 중 선택</b>
                  </p>
                </div>
                <div className="shrink-0 md:text-right">
                  <div className="text-4xl md:text-5xl font-black tracking-tighter text-primary">{PRICE.toLocaleString()}원</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <span className="line-through">정가 {LIST_PRICE.toLocaleString()}원</span> · {DISCOUNT}% 할인
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button asChild size="lg" className="h-12 w-full md:w-auto px-10 text-base font-bold" data-gtm-id="trial69900-price-cta">
                  <Link href={CTA_LINK}>지금 체험 시작하기 <ArrowRight className="ml-1.5 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 신뢰 배지 스트립 */}
        <section className="px-4 md:px-6 pb-2">
          <div className="container max-w-4xl">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {trustBadges.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.t} className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-4 text-center sm:flex-row sm:gap-3 sm:px-4 sm:py-3 sm:text-left">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-tight [word-break:keep-all] [text-wrap:balance]">{b.t}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight [word-break:keep-all] [text-wrap:balance]">{b.s}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 처음 두 번, 이렇게 배워요 — 혼자서도 시작하는 법 */}
        <section className="px-4 md:px-6 pt-10 md:pt-14">
          <div className="container max-w-4xl">
            <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-8">
              <div className="mb-6 text-center md:mb-7">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">How It Works</span>
                <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-tight [word-break:keep-all]">처음 두 번, 이렇게 배워요</h2>
                <p className="mt-2 text-sm md:text-base text-muted-foreground [word-break:keep-all] [text-wrap:balance]">
                  혼자 하면 막막한 두 번을 트레이너와 함께 — 그다음부터는 혼자서도 할 수 있게.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/50 bg-background/50 p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-black text-primary-foreground">1</span>
                    <p className="font-bold [word-break:keep-all]">내 몸에 맞추기</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
                    기구를 내 몸에 맞게 세팅하고, 바른 자세와 알맞은 강도를 함께 잡습니다.
                  </p>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-black text-primary-foreground">2</span>
                    <p className="font-bold [word-break:keep-all]">혼자서도 해보기</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">
                    혼자 따라 할 운동 순서를 연습하고, 다음에 혼자 와도 막히지 않게 정리합니다.
                  </p>
                </div>
              </div>
              <p className="mt-5 text-center text-sm font-semibold text-foreground [word-break:keep-all] [text-wrap:balance]">
                두 번이면 <span className="text-primary">&lsquo;혼자서도 시작하는 법&rsquo;</span>이 생깁니다. 아래에서 원하는 분야를 고르세요.
              </p>
            </div>
          </div>
        </section>

        {/* 커리큘럼 선택 */}
        <section className="px-4 md:px-6 py-12 md:py-20">
          <div className="container max-w-5xl">
            <div className="mb-10 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Select Your Focus</span>
              <h2 className="mt-2 text-2xl md:text-4xl font-black tracking-tighter">원하는 PT 분야를 선택하세요</h2>
              <p className="mt-2 text-sm md:text-base text-muted-foreground [word-break:keep-all] [text-wrap:balance]">PT 2회를 아래 6가지 커리큘럼 중 원하는 방향으로 받습니다.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {curriculum.map((c, i) => {
                return (
                <div
                  key={c.title}
                  className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.img} alt={c.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
                    <span className="pointer-events-none absolute right-3 top-1 select-none text-5xl font-black leading-none tabular-nums text-white/25" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="p-5 md:p-6">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-110">
                        <i className={`${c.icon} text-2xl leading-none`} aria-hidden />
                      </div>
                      <h3 className="text-lg font-bold [word-break:keep-all]">{c.title}</h3>
                    </div>
                    <p className="mb-4 text-sm font-semibold text-primary [word-break:keep-all] [text-wrap:balance]">{c.target}</p>
                    <div className="space-y-2.5 border-t border-border/50 pt-4">
                      {[c.s1, c.s2].map((s, si) => (
                        <div key={si} className="flex gap-3">
                          <span className="mt-0.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">{si + 1}회차</span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold [word-break:keep-all]">{s[0]}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed [word-break:keep-all]">{s[1]}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 유의사항 */}
        <section className="border-t border-border/40 px-4 md:px-6 py-12 md:py-16">
          <div className="container max-w-3xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl md:text-3xl font-bold">
              <AlertCircle className="h-6 w-6 text-destructive" /> 유의사항 및 안내
            </h2>
            <div className="space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
              <div className="rounded-xl border border-border/60 border-l-[3px] border-l-primary bg-card p-5 md:p-6">
                <p className="mb-2 font-bold text-foreground">이용 안내</p>
                <p className="[word-break:keep-all]">
                  본 상품은 헬스장 &lsquo;연속 10일&rsquo; 이용권과 1:1 PT 2회(회당 50분)가 포함된 체험 상품입니다. 결제 후 선택하신 주 이용지점에 방문하면 활성화되며, 첫 방문일부터 연속 10일간 이용할 수 있습니다. PT는 담당 트레이너 배정 후 예약제로 진행되며, 위 6가지 커리큘럼 중 원하는 방향으로 받습니다. PT 2회는 반드시 연속 10일 체험 기간 내에 받아야 하며, 기간 종료 후에는 사용할 수 없습니다.
                </p>
              </div>
              <ul className="space-y-2.5">
                {conditions.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 [word-break:keep-all]">
                    <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/40 px-4 md:px-6 py-12 md:py-16">
          <div className="container max-w-3xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl md:text-3xl font-bold">
              <HelpCircle className="h-6 w-6 text-primary" /> 자주 묻는 질문
            </h2>
            <div className="divide-y divide-border/50 overflow-hidden rounded-xl border border-border/60 bg-card">
              {faqs.map((f) => (
                <details key={f.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm md:text-base font-semibold [word-break:keep-all]">
                    {f.q}
                    <span className="shrink-0 text-xl leading-none text-primary transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed [word-break:keep-all]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 아이콘 출처 표기 (Flaticon UIcons 무료 사용 조건) */}
        <div className="px-4 md:px-6 pb-8 pt-2 text-center">
          <p className="text-[11px] text-muted-foreground/70">
            일부 아이콘 제공:{' '}
            <a href="https://www.flaticon.com/uicons" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground">
              Flaticon
            </a>
          </p>
        </div>

        {/* 클로징 CTA */}
        <section className="bg-primary px-4 md:px-6 py-16 text-center text-primary-foreground">
          <div className="container max-w-2xl space-y-5">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.1] [text-wrap:balance] [word-break:keep-all]">
              69,900원으로<br />가장 가벼운 시작.
            </h2>
            <p className="font-bold text-primary-foreground/80">신규 회원 한정 · 선착순 100 · 1인 1회</p>
            <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold bg-background text-primary hover:bg-background/90" data-gtm-id="trial69900-bottom-cta">
              <Link href={CTA_LINK}>지금 체험 시작하기 <ArrowRight className="ml-1.5 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
