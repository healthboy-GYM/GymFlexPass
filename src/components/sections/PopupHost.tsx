'use client';

import { useState, useEffect } from 'react';
import { EventWinnerPopup } from '@/components/sections/EventWinnerPopup';
import { BodyChallengePopup } from '@/components/sections/BodyChallengePopup';
import { CustomPopupDialog } from '@/components/sections/CustomPopupDialog';
import { subscribePopups, DEFAULT_ITEMS, type PopupItem } from '@/lib/popups';

const todayStr = () => new Date().toISOString().slice(0, 10);

/** 노출 빈도에 따라 이미 '보지 않기' 처리됐는지. */
function isDismissed(item: PopupItem): boolean {
  if (typeof window === 'undefined') return false;
  if (item.frequency === 'always') return false;
  if (item.frequency === 'daily') return localStorage.getItem(`popup_${item.id}_daily`) === todayStr();
  return localStorage.getItem(`popup_${item.id}_once`) === 'true';
}

/** 바디챌린지: 접수 마감일이 지나면 노출하지 않음(안전장치). */
function isExpired(item: PopupItem): boolean {
  if (item.kind !== 'bodyChallenge') return false;
  const end = new Date(`${item.deadline}T23:59:59+09:00`).getTime();
  return Number.isFinite(end) ? Date.now() > end : false;
}

/** 항목이 지금 노출 대상인지(켜짐 + 만료 안 됨 + 미열람 + 최소 내용). */
function isEligible(item: PopupItem): boolean {
  if (!item.enabled) return false;
  if (isExpired(item)) return false;
  if (isDismissed(item)) return false;
  if (item.kind === 'custom' && !item.title.trim()) return false;
  return true;
}

/**
 * 홈의 모든 팝업(통합 목록)을 관리한다.
 * 여러 개가 켜져 있어도 목록 순서(위 우선)로 '한 번에 하나만' 노출한다.
 */
export function PopupHost() {
  const [items, setItems] = useState<PopupItem[] | null>(null);
  const [active, setActive] = useState<PopupItem | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribePopups(setItems, () => setItems(DEFAULT_ITEMS));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!items) return;
    const chosen = items.find(isEligible) ?? null;
    if (!chosen) return;
    const timer = setTimeout(() => {
      setActive(chosen);
      setOpen(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [items]);

  if (!active) return null;

  const dismiss = () => {
    if (active.frequency === 'daily') localStorage.setItem(`popup_${active.id}_daily`, todayStr());
    else if (active.frequency === 'once') localStorage.setItem(`popup_${active.id}_once`, 'true');
    setOpen(false);
  };

  if (active.kind === 'bodyChallenge') {
    return (
      <BodyChallengePopup
        isOpen={open}
        onOpenChange={(o) => setOpen(o)}
        onDontShowToday={dismiss}
        edition={active.edition}
        subtitle={active.subtitle}
        prize={active.prize}
        deadline={active.deadline}
        applyUrl={active.applyUrl}
        imageUrl={active.imageUrl}
      />
    );
  }

  if (active.kind === 'eventWinner') {
    return (
      <EventWinnerPopup
        isOpen={open}
        onClose={(dontShowAgain) => {
          if (dontShowAgain) localStorage.setItem(`popup_${active.id}_once`, 'true');
          setOpen(false);
        }}
        title={active.title}
        subtitle={active.subtitle}
        stampWinners={active.stampWinners}
        rankingWinners={active.rankingWinners}
      />
    );
  }

  return (
    <CustomPopupDialog
      popup={active}
      isOpen={open}
      onOpenChange={(o) => setOpen(o)}
      onDismiss={dismiss}
    />
  );
}
