'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    karrotPixel: any;
    wcs_add: any;
    wcs: any;
    wcs_do: any;
    fbq: any;
    _fbq: any;
  }
}

/**
 * 클라이언트 전용 트래킹 초기화 로직.
 * 루트 레이아웃을 서버 컴포넌트로 유지하기 위해, 브라우저에서만 실행되는
 * 픽셀/애널리틱스 초기화와 클릭 이벤트 위임을 이 컴포넌트로 분리했다.
 * 스크립트 태그(SDK 로더) 자체는 서버 레이아웃의 <head>에서 렌더링된다.
 */
export function TrackingScripts() {
  useEffect(() => {
    // Karrot Pixel Initialization
    const karrotPixelSDK = document.getElementById('karrot-pixel-sdk');
    const initKarrot = () => {
      if (window.karrotPixel) {
        window.karrotPixel.init('1145292429406028045');
        window.karrotPixel.track('PageView');
      }
    };
    // 이미 로드된 경우 즉시 초기화, 아니면 load 이벤트를 기다림
    if (window.karrotPixel) {
      initKarrot();
    } else if (karrotPixelSDK) {
      karrotPixelSDK.addEventListener('load', initKarrot);
    }

    const handleClick = (e: MouseEvent) => {
      const gtmIdElement = (e.target as HTMLElement).closest('[data-gtm-id]');
      if (gtmIdElement) {
        const eventName = gtmIdElement.getAttribute('data-gtm-id');
        if (eventName && window.karrotPixel) {
          window.karrotPixel.track(eventName);
        }
      }
    };
    document.addEventListener('click', handleClick);

    // Naver Analytics
    const naverScript = document.getElementById('naver-analytics-loader');
    const initNaver = () => {
      if (!window.wcs_add) window.wcs_add = {};
      window.wcs_add['wa'] = '1a8e999e5675e80';
      if (window.wcs) {
        window.wcs.inflow();
        window.wcs_do();
      }
    };
    if (window.wcs) {
      initNaver();
    } else if (naverScript) {
      naverScript.addEventListener('load', initNaver);
    }

    return () => {
      document.removeEventListener('click', handleClick);
      if (karrotPixelSDK) {
        karrotPixelSDK.removeEventListener('load', initKarrot);
      }
      if (naverScript) {
        naverScript.removeEventListener('load', initNaver);
      }
    };
  }, []);

  return null;
}
