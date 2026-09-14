
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PrivacyPolicyModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground hover:text-primary">
          개인정보처리방침
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">개인정보처리방침</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6 -mr-2">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>주식회사 헬스보이(이하 '회사')는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다.</p>
            
            <div>
                <h3 className="font-semibold text-foreground mb-2">1. 개인정보 수집 항목 및 이용 목적</h3>
                <p className="mb-2">회사는 원활한 고객 상담 및 서비스 제공을 위해 아래와 같은 최소한의 개인정보를 수집하고 있습니다.</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>수집 항목:</strong> 이름, 연락처, 주 이용지점</li>
                    <li><strong>수집 목적:</strong> '주 이용지점 등록' 신청에 따른 본인 확인 및 서비스 제공</li>
                </ul>
            </div>

             <div>
                <h3 className="font-semibold text-foreground mb-2">2. 개인정보의 보유 및 이용기간</h3>
                <p>회사는 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 보유 기간은 다음과 같습니다.</p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li><strong>보유 기간:</strong> 서비스 신청 접수 후 1년간 보관 후 파기</li>
                    <li><strong>파기 요청:</strong> 이용자의 요청이 있을 경우 즉시 파기합니다.</li>
                </ul>
            </div>
            
            <div>
                <h3 className="font-semibold text-foreground mb-2">3. 개인정보의 제3자 제공</h3>
                <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우 또는 법령의 규정에 의한 경우는 예외로 합니다.</p>
            </div>

            <div>
                <h3 className="font-semibold text-foreground mb-2">4. 개인정보 보호책임자</h3>
                <p>
                    이름: 조인학<br/>
                    소속: 주식회사 헬스보이<br/>
                    이메일: healthboy00@gmail.com
                </p>
            </div>

            <div>
                <h3 className="font-semibold text-foreground mb-2">5. 개인정보 관련 민원 및 문의</h3>
                <p>본 개인정보처리방침에 대한 문의는 상기 책임자 또는 고객센터로 연락 주시기 바랍니다.</p>
            </div>

            <div>
                <h3 className="font-semibold text-foreground mb-2">6. 개인정보처리방침의 변경</h3>
                <p>본 방침은 법령 또는 서비스 변경 시 사전 고지 없이 수정될 수 있으며, 변경 시 본 페이지를 통해 안내드립니다.</p>
            </div>

            <p className="pt-4"><strong>시행일:</strong> 2025년 8월 1일</p>
          </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
                <Button type="button">닫기</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
