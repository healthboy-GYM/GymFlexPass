
'use client';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlackFridayPopupProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onDontShowToday: () => void;
}

export function BlackFridayPopup({ isOpen, onOpenChange, onDontShowToday }: BlackFridayPopupProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
            "p-0 border-0 w-[90vw] max-w-sm sm:max-w-md shadow-2xl rounded-lg overflow-hidden bg-black text-white border-destructive/50"
        )}
      >
        <div className="p-8 text-center space-y-4">
            <div className="inline-block bg-destructive text-white rounded-md px-3 py-1 mb-2 text-xs font-semibold">
                1년에 단 한 번, 역대급 할인!
            </div>
            <h2 className="text-4xl font-black text-destructive tracking-tight">BLACK FRIDAY</h2>
            <p className="text-lg text-neutral-300">
                프리미엄 올패스 1개월권을 <strong className="text-destructive">선착순 300명 한정, 68% 할인</strong>된 가격에 만나보세요!
            </p>
            <div className="text-center pt-2">
                <p className="text-xl font-bold text-neutral-500 line-through">152,000원</p>
                <p className="text-5xl font-black text-destructive">49,000원</p>
            </div>
             <a href="/promo/black-friday" className={cn(buttonVariants({ size: 'lg' }), "w-full h-14 text-lg mt-4 bg-destructive text-destructive-foreground hover:bg-destructive/90")} data-gtm-id="popup-bf-purchase-click">
                이벤트 바로가기 <ArrowRight className="ml-2 h-5 w-5" />
            </a>
        </div>
        <div className="grid grid-cols-2 bg-neutral-900 rounded-b-lg overflow-hidden border-t border-neutral-800">
            <Button
                variant="ghost"
                onClick={onDontShowToday}
                className="text-neutral-400 hover:text-white rounded-none h-11"
                data-gtm-id="popup-bf-dont-show-today-click"
            >
                오늘 하루 보지 않기
            </Button>
            <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-neutral-400 hover:text-white rounded-none border-l border-neutral-800 h-11"
                data-gtm-id="popup-bf-close-click"
            >
                <X className="h-4 w-4 mr-2" /> 닫기
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    
