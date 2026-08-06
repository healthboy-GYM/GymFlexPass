'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MapPin, Megaphone, Tag, Sparkles, BookOpen, HelpCircle, Bell, Users, Ticket,
  Save, Eye, Trash2, ChevronsUpDown, Zap, AlertTriangle, LifeBuoy,
} from 'lucide-react';

/**
 * 관리자 사용 매뉴얼 (정적 콘텐츠).
 * 담당자가 바뀌어도 각 관리 탭 사용법을 바로 참고할 수 있도록 /admin 안에 둔다.
 */
export function AdminManual() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* 개요 */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LifeBuoy className="h-5 w-5 text-primary" /> 관리자 사용 안내
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>이 관리자 화면에서 <b className="text-foreground">개발자 없이 사이트 내용을 직접 바꿀 수 있습니다.</b></p>
          <p className="flex items-start gap-2">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>대부분의 변경(지점·가격·팝업·배너·이용안내·FAQ·이벤트)은 <b className="text-foreground">저장하면 방문자 화면에 즉시 반영</b>됩니다. 별도 배포가 필요 없습니다.</span>
          </p>
        </CardContent>
      </Card>

      {/* 공통 규칙 */}
      <div className="rounded-xl border bg-card p-5">
        <p className="mb-3 text-sm font-bold">공통 사용법</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><Save className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> 편집 후 반드시 <b className="text-foreground">전체 저장</b>(또는 저장) 버튼을 눌러야 반영됩니다.</li>
          <li className="flex items-start gap-2"><ChevronsUpDown className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> 위/아래 화살표로 <b className="text-foreground">노출 순서</b>를 바꿉니다.</li>
          <li className="flex items-start gap-2"><Eye className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> 팝업은 <b className="text-foreground">미리보기</b>로 실제 모양을 확인할 수 있습니다.</li>
          <li className="flex items-start gap-2"><Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> 삭제는 확인 창이 뜨며, <b className="text-foreground">전체 저장을 눌러야 실제로 반영</b>됩니다.</li>
          <li className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> 링크·이미지 주소는 반드시 <b className="text-foreground">http:// 또는 https://</b> 로 시작해야 합니다.</li>
        </ul>
      </div>

      {/* 탭별 설명 */}
      <Accordion type="single" collapsible className="w-full space-y-2">
        <AccordionItem value="view" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> 가입 신청 · 쿠폰 사용 (조회)</span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-1.5">
            <p>온라인 가입 신청과 쿠폰 사용 내역을 확인합니다.</p>
            <p>• 각 신청의 <b className="text-foreground">상태</b>(신규/처리완료/취소)를 바꿀 수 있습니다.</p>
            <p>• <b className="text-foreground">CSV 다운로드</b>로 엑셀에서 열어볼 수 있습니다.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="gym" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> 지점 관리</span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-1.5">
            <p>지점 추가/수정/삭제, 등급, 주소, 드론영상을 관리합니다.</p>
            <p>• 주소를 입력하면 <b className="text-foreground">지도 좌표가 자동</b>으로 잡힙니다.</p>
            <p>• 변경은 지점찾기 지도·구매·가입 페이지에 즉시 반영됩니다.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="event" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> 이벤트 관리</span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-1.5">
            <p>이벤트(프로모션) 페이지를 만들고 홈에 노출합니다.</p>
            <p>• 활성화하고 종료일이 지나지 않은 이벤트가 <b className="text-foreground">홈 “진행 중인 이벤트”</b>에 자동으로 뜹니다.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pricing" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> 가격 관리</span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-1.5">
            <p>상품(등급)을 추가/삭제하고 이름·설명·기간별(1·3·6개월) 가격·결제링크를 편집합니다.</p>
            <p>• 저장하면 <b className="text-foreground">구매 페이지와 헬보올패스 안내 페이지의 가격표·업그레이드 비용이 한 번에</b> 갱신됩니다.</p>
            <p>• 결제 링크는 운톡 상품 주소(https://...)를 넣습니다.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="popup" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> 팝업 관리</span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-1.5">
            <p>홈 첫 화면에 뜨는 팝업을 관리합니다.</p>
            <p>• <b className="text-foreground">기본 팝업</b>(바디챌린지·당첨자)은 켜고 끄기만 합니다.</p>
            <p>• <b className="text-foreground">커스텀 팝업</b>은 이미지·제목·문구·버튼으로 직접 만들 수 있습니다.</p>
            <p>• 여러 개가 켜져 있어도 <b className="text-foreground">우선순위(위쪽 먼저)대로 하나만</b> 노출됩니다.</p>
            <p>• 노출 빈도: 매 방문 / 하루 1회 / 최초 1회 중 선택.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="guide" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> 이용안내</span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-1.5">
            <p>이용 프로세스 단계와 하단 안내 카드를 편집합니다.</p>
            <p>• 단계 추가/삭제/순서 변경, 각 단계의 내용 줄과 Tip을 편집합니다.</p>
            <p>• 문구에 <b className="text-foreground">**별표 두 개**</b>로 감싸면 <b className="text-foreground">굵게</b> 표시됩니다.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> FAQ</span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-1.5">
            <p>자주 묻는 질문을 카테고리별로 관리합니다.</p>
            <p>• 카테고리·질문/답변 추가/삭제/순서 변경, 기타 유의사항을 편집합니다.</p>
            <p>• 답변 작성 팁: <b className="text-foreground">**굵게**</b>, 줄바꿈으로 문단 나누기, 줄 앞에 <b className="text-foreground">- </b>(하이픈+공백)을 붙이면 목록이 됩니다.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="banner" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            <span className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> 배너·공지</span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-1.5">
            <p>사이트 맨 위에 뜨는 띠 배너의 문구·색상·링크·표시 여부를 관리합니다.</p>
            <p>• 처음 열면 <b className="text-foreground">현재 표시 중인 공지</b>가 채워져 있습니다. 문구만 고치거나, 스위치를 꺼서 배너를 숨길 수 있습니다.</p>
            <p>• 색상: 노랑(경고/폐점), 파랑(일반 안내).</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* 자주 하는 작업 */}
      <div className="rounded-xl border bg-card p-5">
        <p className="mb-3 text-sm font-bold">자주 하는 작업 예시</p>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>📢 <b className="text-foreground">“○○점 폐점” 공지 올리기</b> → 배너·공지 탭에서 문구 입력 후 켜기 → 저장.</p>
          <p>💰 <b className="text-foreground">가격 변경</b> → 가격 관리 탭에서 해당 상품 가격 수정 → 전체 저장. (구매·안내 페이지 동시 반영)</p>
          <p>🎉 <b className="text-foreground">이벤트 팝업 띄우기</b> → 팝업 관리 → 커스텀 팝업 추가(이미지·버튼) → 켜기 → 전체 저장.</p>
          <p>❓ <b className="text-foreground">FAQ 추가</b> → FAQ 탭에서 해당 카테고리에 질문 추가 → 답변 작성 → 전체 저장.</p>
        </div>
      </div>

      {/* 개발 문의 */}
      <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
        <p><b className="text-foreground">개발자 문의가 필요한 경우:</b> 위 관리 항목 외의 화면 구조·디자인 변경, 새로운 페이지 추가, 기능 개발 등은 코드 수정과 배포가 필요합니다. 이런 경우에는 개발 담당자에게 요청하세요.</p>
      </div>
    </div>
  );
}
