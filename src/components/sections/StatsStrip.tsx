'use client';

import { MapPin, Layers, Ticket } from 'lucide-react';
import { CountUp } from '@/components/sections/CountUp';
import { Reveal } from '@/components/sections/Reveal';

const stats = [
  { icon: MapPin, end: 80, suffix: '여개', label: '전국 헬스보이짐 지점' },
  { icon: Layers, end: 5, suffix: '가지', label: '라이프스타일 맞춤 등급' },
  { icon: Ticket, end: 1, suffix: '개', label: '지점 가격으로 전국 자유 이용' },
];

/** 히어로 하단의 핵심 지표 띠 — 스크롤 진입 시 숫자가 올라간다. */
export function StatsStrip() {
  return (
    <section className="w-full border-b border-border/50 bg-secondary/30">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={i} delay={i * 120} className="flex flex-col items-center text-center">
                <Icon className="mb-2 h-6 w-6 text-primary" />
                <p className="flex items-baseline justify-center font-black leading-none text-foreground">
                  <CountUp end={s.end} className="text-4xl md:text-5xl" />
                  <span className="ml-1 text-xl font-extrabold text-primary md:text-2xl">{s.suffix}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
