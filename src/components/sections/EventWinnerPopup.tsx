
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Gift, Check, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type Winner = {
  rank: number;
  name: string;
  phone: string;
  prize: string;
};

interface EventWinnerPopupProps {
    isOpen: boolean;
    onClose: (dontShowAgain: boolean) => void;
    // 관리자 '팝업 관리'에서 편집 가능한 값(미지정 시 기본값 사용).
    title?: string;
    subtitle?: string;
    stampWinners?: Winner[];
    rankingWinners?: Winner[];
}

const DEFAULT_STAMP: Winner[] = [
    { rank: 1, name: '조*린', phone: '6748', prize: '에어팟맥스' },
    { rank: 2, name: '신*훈', phone: '9919', prize: '다이슨에어랩' },
    { rank: 3, name: '송*현', phone: '6419', prize: '올패스 6개월' },
    { rank: 4, name: '조*확', phone: '5055', prize: '스타벅스 상품권 5000원' },
    { rank: 5, name: '이*진', phone: '2245', prize: '스타벅스 상품권 5000원' },
    { rank: 6, name: '김*형', phone: '7767', prize: '스타벅스 상품권 5000원' },
    { rank: 7, name: '이*준', phone: '8707', prize: '스타벅스 상품권 5000원' },
];

const DEFAULT_RANKING: Winner[] = [
    { rank: 1, name: '이*진', phone: '2245', prize: 'S프리미엄 올패스 12개월 + 바바라스튜디오 촬영권' },
    { rank: 2, name: '신*훈', phone: '9919', prize: 'S프리미엄 올패스 6개월' },
    { rank: 3, name: '조*확', phone: '5055', prize: 'S프리미엄 올패스 6개월' },
    { rank: 4, name: '이*준', phone: '8707', prize: 'S프리미엄 올패스 1개월' },
    { rank: 5, name: '송*현', phone: '6419', prize: 'S프리미엄 올패스 1개월' },
    { rank: 6, name: '김*형', phone: '7767', prize: 'S프리미엄 올패스 1개월' },
    { rank: 7, name: '김*양', phone: '2656', prize: 'S프리미엄 올패스 1개월' },
    { rank: 8, name: '조*린', phone: '6748', prize: 'S프리미엄 올패스 1개월' },
    { rank: 9, name: '임*솔', phone: '9236', prize: 'S프리미엄 올패스 1개월' },
    { rank: 10, name: '엄*영', phone: '7450', prize: 'S프리미엄 올패스 1개월' },
];

const WinnerTable = ({ winners }: { winners: Winner[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px] text-center">순위</TableHead>
          <TableHead>당첨자</TableHead>
          <TableHead className="text-right">경품</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {winners.map((winner) => (
          <TableRow key={winner.rank}>
            <TableCell className="font-medium text-center">{winner.rank}등</TableCell>
            <TableCell>
              <div>{winner.name}</div>
              <div className="text-xs text-muted-foreground">({winner.phone})</div>
            </TableCell>
            <TableCell className="text-right text-xs">{winner.prize}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
);


export function EventWinnerPopup({
  isOpen, onClose,
  title = '이벤트 당첨자 안내', subtitle = '당첨을 진심으로 축하드립니다!',
  stampWinners = DEFAULT_STAMP, rankingWinners = DEFAULT_RANKING,
}: EventWinnerPopupProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(dontShowAgain)}>
      <DialogContent
        className={cn(
            "p-0 border-0 w-[90vw] max-w-md shadow-lg rounded-lg overflow-hidden"
        )}
      >
        <div className="bg-gradient-to-br from-primary via-yellow-400 to-amber-500 text-white p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-white animate-pulse" />
            <DialogTitle className="text-2xl font-black text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)'}}>{title}</DialogTitle>
            <DialogDescription className="text-white/90 text-lg mt-2">
                {subtitle}
            </DialogDescription>
        </div>
        <div className="bg-card text-card-foreground p-6">
          <ScrollArea className="h-[300px] border rounded-md p-3 bg-secondary/30">
            <div className="mb-6">
              <h3 className="font-bold text-center text-foreground mb-2 flex items-center justify-center gap-2"><Trophy className="h-5 w-5 text-primary"/>스탬프 응모권 당첨자</h3>
              <WinnerTable winners={stampWinners} />
            </div>
            <div>
              <h3 className="font-bold text-center text-foreground mb-2 flex items-center justify-center gap-2"><Trophy className="h-5 w-5 text-primary"/>랭킹 미션 당첨자</h3>
              <WinnerTable winners={rankingWinners} />
            </div>
          </ScrollArea>
          <div className="text-xs text-muted-foreground mt-4 space-y-1">
            <p>• 당첨자에게는 개별 연락 드릴 예정입니다.</p>
            <p>• 경품 수령 관련 사항은 안내 문자를 참고해주세요.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 bg-secondary rounded-b-lg overflow-hidden border-t">
            <div className="flex items-center justify-center p-2 border-r">
                <Checkbox id="dont-show-again" checked={dontShowAgain} onCheckedChange={(checked) => setDontShowAgain(!!checked)} />
                <Label htmlFor="dont-show-again" className="ml-2 text-sm text-muted-foreground cursor-pointer">
                    다시 보지 않기
                </Label>
            </div>
            <Button
                variant="ghost"
                onClick={() => onClose(dontShowAgain)}
                className="text-muted-foreground rounded-none h-full"
            >
                <Check className="h-4 w-4 mr-2" /> 확인
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
