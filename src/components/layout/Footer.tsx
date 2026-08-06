
import Link from 'next/link';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

export function Footer() {
  return (
    <footer className="py-8 md:px-8 bg-background border-t border-border/40 text-sm text-muted-foreground">
      <div className="container text-center md:text-left space-y-2">
        <div className="space-y-1">
          <p>
            <span>상호: 주식회사 헬스보이</span>
            <span className="mx-2">|</span>
            <span>대표명: 조인학</span>
            <span className="mx-2">|</span>
            <span>주소: 서울시 동대문구 장한로 119, 지하 1층 101호</span>
          </p>
          <p>
            <span>사업자등록번호: 339-87-01816</span>
            <span className="mx-2">|</span>
            <span>고객센터: 010-9032-6657</span>
          </p>
        </div>
        <div className="flex justify-center md:justify-start items-center gap-2 text-xs">
           <p className="text-balance">
             © {new Date().getFullYear()} HEALBOYGYM. All rights reserved.
           </p>
            <span className="mx-1">|</span>
            <PrivacyPolicyModal />
            <span className="mx-1">|</span>
            <Link href="/register" className="hover:text-primary">주 이용지점 등록</Link>
            <span className="mx-1">|</span>
            <Link href="/admin" className="hover:text-primary">관리자</Link>
            <span className="mx-1">|</span>
            <a href="mailto:contact@healthboygym.company" className="hover:text-primary">제휴/비즈니스 문의</a>
        </div>
      </div>
    </footer>
  );
}
