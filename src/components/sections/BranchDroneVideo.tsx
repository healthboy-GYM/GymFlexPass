'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

function normalizeAssetPath(p?: string | null): string | null {
  if (!p) return null;
  const clean = p.replace(/^\/+/, '');
  return clean.startsWith('assets/') ? clean : `assets/${clean}`;
}

/**
 * 지점 상세용 드론 영상 미리보기 (Firebase Storage 에서 URL 해석 → 자동재생).
 * 영상이 없거나 로딩 실패하면 아무것도 렌더하지 않는다(섹션 자체가 사라짐).
 */
export function BranchDroneVideo({ fileName, branchName }: { fileName?: string; branchName: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'none'>('loading');

  useEffect(() => {
    let alive = true;
    const path = normalizeAssetPath(fileName);
    if (!path) {
      setStatus('none');
      return;
    }
    // Firebase는 런타임에 동적 로드 → 지점 페이지 초기 번들/빌드 메모리에서 제외
    (async () => {
      try {
        const { storage, ref, getDownloadURL } = await import('@/lib/firebase');
        const u = await getDownloadURL(ref(storage, path));
        if (alive) {
          setUrl(u);
          setStatus('ready');
        }
      } catch {
        if (alive) setStatus('none');
      }
    })();
    return () => {
      alive = false;
    };
  }, [fileName]);

  if (status === 'none') return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-2">지점 미리보기 (드론 영상)</h2>
      <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-black aspect-video">
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {url && (
          <video
            src={url}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={`${branchName} 드론 영상`}
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
