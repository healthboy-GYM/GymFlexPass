
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Calendar, Megaphone, ArrowRight, Star, AlertCircle, UserPlus, Percent } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PromotionPopupProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onDontShowToday: () => void;
}

export function PromotionPopup({ isOpen, onOpenChange, onDontShowToday }: PromotionPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
            "p-0 border-0 w-[90vw] max-w-sm sm:max-w-md shadow-lg rounded-lg overflow-hidden"
        )}
      >
        <div className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground p-6 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-white animate-pulse" />
            <DialogTitle className="text-3xl font-black text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)'}}>10월 한정 특가</DialogTitle>
            <DialogDescription className="text-primary-foreground/90 text-lg mt-2">
                프리미엄 올패스를 파격 할인가에!
            </DialogDescription>
        </div>
        <div className="bg-card text-card-foreground">
          <div className="px-6 py-6 space-y-4">
            <div className="text-center">
                <p className="text-sm text-muted-foreground">헬스보이짐 프리미엄 1개월권</p>
                <div className="flex items-baseline justify-center gap-2 mt-1">
                    <p className="text-xl font-bold text-muted-foreground line-through">152,000원</p>
                    <p className="text-4xl font-black text-primary">49,500원</p>
                </div>
                 <div className="mt-2 inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
                    <Percent className="mr-1.5 h-4 w-4" /> 67% 할인
                </div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 bg-secondary/50 p-4 rounded-md border">
                <li className="flex items-start gap-2"><Calendar className="h-4 w-4 mt-0.5 text-primary shrink-0"/><span><strong>기간:</strong> 10월 한정, 온라인 전용 상품</span></li>
                <li className="flex items-start gap-2"><UserPlus className="h-4 w-4 mt-0.5 text-primary shrink-0"/><span><strong>대상:</strong> 헬보올패스 최초 구매 회원 (1인 1회)</span></li>
            </ul>
             <div className="flex items-start p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                <span><strong className="font-semibold">이용 불가 지점:</strong> 신촌점, 가락점, 송천점 (S-프리미엄)</span>
            </div>
             <Button asChild size="lg" className="w-full h-12" data-gtm-id="popup-promo-purchase-click">
                <Link href="/promo/october" prefetch={false}>
                    자세히 보고 구매하기 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 bg-secondary rounded-b-lg overflow-hidden border-t">
            <Button
                variant="ghost"
                onClick={onDontShowToday}
                className="text-muted-foreground rounded-none h-11"
                data-gtm-id="popup-dont-show-today-click"
            >
                오늘 하루 보지 않기
            </Button>
            <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground rounded-none border-l h-11"
                data-gtm-id="popup-close-click"
            >
                <X className="h-4 w-4 mr-2" /> 닫기
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
