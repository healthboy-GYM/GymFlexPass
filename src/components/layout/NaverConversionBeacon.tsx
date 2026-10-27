'use client';

import { useEffect } from 'react';
import { fireNaverConversionWhenReady, type NaverConv } from '@/lib/naverCts';

/**
 * 페이지 진입 시 네이버 CTS 전환을 1회 발생시키는 비콘.
 * 서버 컴포넌트 페이지(예: /branch-locator)에 배치해 '방문 = 전환'을 기록할 때 사용.
 * AccountId 미설정 시 아무 동작도 하지 않는다.
 */
export function NaverConversionBeacon({ conv }: { conv: NaverConv }) {
  useEffect(() => fireNaverConversionWhenReady(conv), []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
