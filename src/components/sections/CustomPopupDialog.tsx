'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { CustomPopup } from '@/lib/popups';

interface CustomPopupDialogProps {
  popup: CustomPopup;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss?: () => void; // 빈도에 따른 '보지 않기' 처리(선택)
}

/** 담당자가 만든 범용 팝업(이미지 + 제목 + 문구 + 버튼)을 표준 템플릿으로 표시. */
export function CustomPopupDialog({ popup, isOpen, onOpenChange, onDismiss }: CustomPopupDialogProps) {
  const hasButton = Boolean(popup.buttonLink && popup.buttonText);
  const dismissLabel = popup.frequency === 'once' ? '다시 보지 않기' : popup.frequency === 'daily' ? '오늘 하루 보지 않기' : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 w-[92vw] max-w-[400px] overflow-hidden rounded-2xl max-h-[90dvh] overflow-y-auto">
        {popup.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={popup.imageUrl} alt="" className="w-full max-h-[40dvh] object-cover" />
        ) : null}

        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-bold">{popup.title || '안내'}</DialogTitle>
          {popup.description ? (
            <DialogDescription className="mt-2 whitespace-pre-line text-sm leading-relaxed">
              {popup.description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="space-y-3 px-6 pb-5 pt-2">
          {hasButton ? (
            <Button asChild className="w-full">
              <a
                href={popup.buttonLink}
                target="_blank"
                rel="noopener noreferrer"
                data-gtm-id={`popup-custom-${popup.id}-cta-click`}
              >
                {popup.buttonText}
                <ExternalLink className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 border-t">
          {dismissLabel ? (
            <button
              type="button"
              onClick={onDismiss}
              className="h-12 border-r text-sm text-muted-foreground transition hover:text-foreground"
            >
              {dismissLabel}
            </button>
          ) : (
            <span className="h-12 border-r" />
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-12 text-sm text-muted-foreground transition hover:text-foreground"
          >
            닫기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
