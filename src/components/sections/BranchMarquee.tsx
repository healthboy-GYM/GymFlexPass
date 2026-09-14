'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BRANCH_PHOTOS, BRANCH_PHOTO_BY_NAME, type BranchPhoto } from '@/lib/branchImages';
import { subscribeGyms, type Gym } from '@/lib/gyms';
import { storage, ref as storageRef, getDownloadURL } from '@/lib/firebase';
import { Reveal } from '@/components/sections/Reveal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Video, Loader2, PlayCircle } from 'lucide-react';

const shortName = (n: string) => n.replace('헬스보이짐', '').trim();

// 드론영상 경로 정규화(파일명 → assets/파일명). 전체 URL이면 그대로 사용.
const normalizeAssetPath = (p?: string | null): string | null => {
  if (!p) return null;
  const clean = p.replace(/^\/+/, '');
  return clean.startsWith('assets/') ? clean : `assets/${clean}`;
};

interface MarqueeItem extends BranchPhoto {
  drone?: string;
}

function Tile({ p, load, onClick }: { p: MarqueeItem; load: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`헬스보이짐 ${p.label} 상세 보기`}
      className="group relative mx-1.5 aspect-[4/3] w-[200px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-800 md:w-[260px]"
    >
      {load && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.src}
          alt={`헬스보이짐 ${p.label}`}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
      {/* 재생 아이콘(호버 시 강조) */}
      <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <PlayCircle className="h-10 w-10 text-white/90 drop-shadow-lg" />
      </span>
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 p-3">
        <span className="h-3.5 w-1 rounded-full bg-primary" />
        <span className="text-sm font-bold text-white drop-shadow-md md:text-base">{p.label}</span>
      </div>
    </button>
  );
}

export function BranchMarquee() {
  const ref = useRef<HTMLElement>(null);
  const [load, setLoad] = useState(false);
  const [gyms, setGyms] = useState<Gym[] | null>(null);

  // 상세 영상 모달 상태
  const [active, setActive] = useState<MarqueeItem | null>(null);
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const unsub = subscribeGyms((data) => setGyms(data), { onError: () => setGyms(null) });
    return () => unsub();
  }, []);

  const photos: MarqueeItem[] = useMemo(() => {
    if (!gyms || gyms.length === 0) return BRANCH_PHOTOS;
    const rows: MarqueeItem[] = [];
    for (const g of gyms) {
      const src = (g.imageUrl && g.imageUrl.trim()) || BRANCH_PHOTO_BY_NAME[g.name];
      if (src) rows.push({ label: shortName(g.name), src, name: g.name, drone: g.droneVideoUrl });
    }
    return rows.length > 0 ? rows : BRANCH_PHOTOS;
  }, [gyms]);

  const rowA = photos.filter((_, i) => i % 2 === 0);
  const rowB = photos.filter((_, i) => i % 2 === 1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setLoad(true); io.disconnect(); } },
      { rootMargin: '300px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const openBranch = (item: MarqueeItem) => { setActive(item); setOpen(true); };

  // 선택 지점의 드론영상 URL 로드
  useEffect(() => {
    if (!open || !active) return;
    let cancelled = false;
    setVideoUrl(null);
    setVideoError(false);
    setVideoLoading(true);
    const raw = active.drone?.trim();
    if (!raw) { setVideoError(true); setVideoLoading(false); return; }
    if (/^https?:\/\//.test(raw)) { setVideoUrl(raw); setVideoLoading(false); return; }
    const path = normalizeAssetPath(raw)!;
    getDownloadURL(storageRef(storage, path))
      .then((url) => { if (!cancelled) { setVideoUrl(url); setVideoLoading(false); } })
      .catch(() => { if (!cancelled) { setVideoError(true); setVideoLoading(false); } });
    return () => { cancelled = true; };
  }, [open, active]);

  return (
    <section ref={ref} className="w-full overflow-hidden bg-background py-12 md:py-24">
      <style>{`
        @keyframes hb-marq-l { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes hb-marq-r { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .hb-track { display: flex; width: max-content; will-change: transform; }
        .hb-l { animation: hb-marq-l 70s linear infinite; }
        .hb-r { animation: hb-marq-r 70s linear infinite; }
        .hb-marquee:hover .hb-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .hb-l, .hb-r { animation: none; }
          .hb-marquee { overflow-x: auto; }
        }
      `}</style>

      <div className="container mb-8 px-4 text-center md:mb-10 md:px-6">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            전국 <span className="text-primary">80여개 지점</span>, 어디서든
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground md:text-lg">
            지점을 눌러 <span className="font-semibold text-foreground">드론 영상</span>으로 미리 둘러보세요.
          </p>
        </Reveal>
      </div>

      <div className="hb-marquee mb-3">
        <div className="hb-track hb-l">
          {[...rowA, ...rowA].map((p, i) => <Tile key={`a-${i}`} p={p} load={load} onClick={() => openBranch(p)} />)}
        </div>
      </div>
      <div className="hb-marquee">
        <div className="hb-track hb-r">
          {[...rowB, ...rowB].map((p, i) => <Tile key={`b-${i}`} p={p} load={load} onClick={() => openBranch(p)} />)}
        </div>
      </div>

      {/* 지점 드론영상 모달 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
          <DialogHeader className="p-4 pb-3 text-left">
            <DialogTitle className="pr-6 text-base md:text-lg">{active?.name ?? '지점'}</DialogTitle>
            <DialogDescription className="text-xs">드론으로 촬영한 매장 전경입니다.</DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full bg-black">
            {videoLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : videoUrl ? (
              <video key={active?.name} src={videoUrl} controls autoPlay loop playsInline className="h-full w-full object-contain" />
            ) : (
              <div className="relative h-full w-full">
                {active?.src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={active.src} alt="" className="h-full w-full object-cover opacity-30" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                  <Video className="h-9 w-9 text-white/80" />
                  <p className="text-sm font-semibold text-white">드론 영상 준비 중입니다</p>
                  <p className="text-xs text-white/70">이 지점 영상은 곧 촬영해 업데이트할 예정입니다.</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
