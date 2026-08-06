'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Timer, Users, MapPin, CalendarDays, PlusCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface BodyChallengePopupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDontShowToday: () => void;
  // 관리자 '팝업 관리'에서 편집 가능한 값(미지정 시 기본값 사용).
  edition?: string;   // 기수 (예: '35기')
  subtitle?: string;  // 부제 (예: '10주간의 놀라운 변화')
  prize?: string;     // 대상 상금 (예: '1,000만원')
  deadline?: string;  // 접수 마감일 (YYYY-MM-DD)
  applyUrl?: string;  // 신청 링크
  imageUrl?: string;  // 헤더 이미지
}

const DEFAULT_APPLY_URL = 'https://healthboybodychallenge.co.kr/';
const DEFAULT_DEADLINE = '2026-09-27';

// 헤더 배경 실사 이미지 (역동적인 운동 사진 — Storage assets/ 에 업로드 후 URL만 변경)
const HEADER_IMAGE_URL =
  'https://firebasestorage.googleapis.com/v0/b/gymflex-pass-fgz47.firebasestorage.app/o/assets%2Fchallenge-hero.png?alt=media';

// 'YYYY-MM-DD' → 마감일 표시 텍스트('2026.09.27(일)').
function formatDeadline(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return `${m[1]}.${m[2]}.${m[3]}(${days[d.getDay()]})`;
}

// 실제 신청 사이트(healthboybodychallenge.co.kr) 기준 핵심 스탯
const stats = [
  { icon: Timer, value: '10', unit: '주', label: '집중 프로그램' },
  { icon: Users, value: '4', unit: '개', label: '참가 부문' },
  { icon: MapPin, value: '80', unit: '여개', label: '전국 지점' },
];

// 전체 일정 (부가 정보 - 기본 접힘)
const fullSchedule = [
  { label: '바디챌린지 기간', value: '09.28(월) ~ 12.06(일)' },
  { label: '온라인 참가 신청서 접수', value: '~ 10.04(일)' },
  { label: '1주차 서류 제출', value: '09.28(월) ~ 10.04(일)' },
  { label: '5주차 서류 제출', value: '10.26(월) ~ 11.01(일)' },
  { label: '10주차 서류 제출', value: '11.30(월) ~ 12.08(화)' },
  { label: '릴스 영상 제출', value: '11.30(월) ~ 12.08(화)' },
  { label: '1차 심사', value: '12.10(목)' },
  { label: '2차 심사', value: '12.14(월)' },
  { label: '온라인 투표', value: '12.21(월) ~ 12.28(월)' },
  { label: '최종 우승자 발표', value: '12.30(수)' },
];

// 월계관 장식 (부문별 시상 좌우)
function Laurel({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 40 48"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden
    >
      <path d="M33 5 C 21 12, 13 26, 15 44" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <g fill="currentColor">
        <ellipse cx="30" cy="11" rx="4.2" ry="2" transform="rotate(-42 30 11)" />
        <ellipse cx="24.5" cy="17" rx="4.2" ry="2" transform="rotate(-30 24.5 17)" />
        <ellipse cx="20" cy="24" rx="4.2" ry="2" transform="rotate(-16 20 24)" />
        <ellipse cx="16.8" cy="32" rx="4.2" ry="2" transform="rotate(-4 16.8 32)" />
        <ellipse cx="15.5" cy="40" rx="4" ry="1.9" transform="rotate(10 15.5 40)" />
      </g>
    </svg>
  );
}

export function BodyChallengePopup({
  isOpen, onOpenChange, onDontShowToday,
  edition = '35기', subtitle = '10주간의 놀라운 변화', prize = '1,000만원',
  deadline = DEFAULT_DEADLINE, applyUrl = DEFAULT_APPLY_URL, imageUrl = HEADER_IMAGE_URL,
}: BodyChallengePopupProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [dDay, setDDay] = useState<number | null>(null);
  const deadlineText = formatDeadline(deadline);

  useEffect(() => {
    const end = new Date(`${deadline}T23:59:59+09:00`).getTime();
    const diff = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
    setDDay(Number.isFinite(diff) ? diff : null);
  }, [deadline]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 border border-primary/40 bg-neutral-900 text-white w-[90vw] max-w-[360px] sm:max-w-[400px] rounded-2xl sm:rounded-3xl overflow-hidden max-h-[85dvh] overflow-y-auto shadow-[0_25px_80px_-20px_rgba(255,184,0,0.5)] ring-1 ring-primary/20">
        {/* HERO - 이미지 우측 블렌드 + 좌측 정렬 텍스트 */}
        <DialogHeader className="relative space-y-0 px-5 pt-6 pb-4 min-h-[210px] text-left sm:px-6 sm:pt-7 sm:pb-5 sm:min-h-[300px]">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <img src={imageUrl} alt="" className="h-full w-full object-cover object-[72%_top]" />
            {/* 좌측 다크 블렌드(텍스트 가독성) */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/85 to-neutral-900/5" />
            {/* 하단 → 본문으로 자연스럽게 */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-neutral-900 to-transparent" />
          </div>

          <div className="relative">
            <DialogTitle className="text-left leading-[1.04] tracking-tight">
              <span className="block text-xl font-black text-white sm:text-2xl">헬스보이짐</span>
              <span className="block text-[30px] font-black bg-gradient-to-b from-amber-200 via-primary to-amber-500 bg-clip-text text-transparent sm:text-[38px]">
                바디챌린지
              </span>
              <span className="block text-[30px] font-black text-white sm:text-[38px]">{edition}</span>
            </DialogTitle>

            <DialogDescription className="mt-2.5 space-y-0.5 text-left sm:mt-3">
              <span className="block text-[12px] font-extrabold tracking-[0.22em] text-white/85 sm:text-[13px]">CHALLENGE TO CHANGE</span>
              <span className="block text-[13px] font-bold text-white sm:text-sm">{subtitle}</span>
            </DialogDescription>

            {/* 상금 */}
            <div className="mt-4 sm:mt-6">
              <p className="text-xs font-bold text-white/70">대상 상금</p>
              <p className="flex items-end gap-1.5 leading-none">
                <span className="text-[40px] font-black leading-[0.82] text-white sm:text-[54px]">{prize}</span>
              </p>
              <div className="mt-2 h-[3px] w-40 rounded-full bg-gradient-to-r from-primary via-primary/70 to-transparent sm:w-44" />
            </div>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="space-y-3.5 bg-neutral-900 px-5 pb-5 pt-1">
          {/* 스탯 3열 */}
          <div className="grid grid-cols-3 rounded-2xl border border-white/10 bg-white/[0.04]">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`px-2 py-4 text-center ${i > 0 ? 'border-l border-white/10' : ''}`}>
                  <Icon className="mx-auto h-6 w-6 text-primary" strokeWidth={2} />
                  <p className="mt-2 text-lg font-black leading-none text-white">
                    {s.value}
                    <span className="text-xs font-bold">{s.unit}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-white/55">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* 부문별 시상 + 월계관 */}
          <div className="flex items-center justify-center gap-2">
            <Laurel className="h-5 w-5 text-primary" />
            <span className="text-[12px] font-semibold text-white/85">
              슈퍼바디 · 뷰티바디 · 마스터 · 헬팻 부문별 시상
            </span>
            <Laurel className="h-5 w-5 text-primary" flip />
          </div>

          {/* 접수 마감 */}
          <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-bold text-white">
              접수 마감 {deadlineText}
              {dDay !== null && dDay >= 0 && <span className="ml-1.5 text-primary">· D-{dDay}</span>}
            </p>
          </div>

          {/* CTA - 점선 골드 */}
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/60 py-3.5 text-base font-bold text-primary transition hover:bg-primary/10"
            data-gtm-id="popup-body-challenge-apply-click"
          >
            <PlusCircle className="h-5 w-5" />
            참가 신청하기
          </a>

          {/* 참가 방법 안내 */}
          <p className="flex items-center justify-center gap-1.5 px-2 text-center text-[11px] leading-relaxed text-white/50">
            <Info className="h-3.5 w-3.5 shrink-0" />
            35기부터는 지점 계약 후 담당 트레이너가 직접 온라인 신청을 진행합니다.
          </p>

          {/* 전체 일정 (펼침) */}
          {scheduleOpen && (
            <ul className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10">
              {fullSchedule.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="text-[13px] font-medium text-white/90">{item.label}</span>
                  <span className="whitespace-nowrap text-[13px] text-white/55">{item.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 하단 액션 */}
        <div className="grid grid-cols-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setScheduleOpen((v) => !v)}
            className="flex h-12 items-center justify-center gap-1.5 border-r border-white/10 text-sm text-white/70 transition hover:text-white"
            aria-expanded={scheduleOpen}
            data-gtm-id="popup-body-challenge-schedule-toggle-click"
          >
            전체 일정 보기
            {scheduleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onDontShowToday}
            className="h-12 text-sm text-white/70 transition hover:text-white"
            data-gtm-id="popup-body-challenge-dont-show-today-click"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
