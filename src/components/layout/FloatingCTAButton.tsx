
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ticket, Star } from 'lucide-react';
import { usePathname } from 'next/navigation';

const KakaoIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="currentColor"
  >
    <path d="M12 0C5.373 0 0 4.477 0 10c0 4.023 2.623 7.43 6.205 8.995.01.005.02.01.03.015l-1.015 3.456a.46.46 0 0 0 .644.512l4.135-2.14a1.16 1.16 0 0 1 .64-.175C10.996 20.92 11.496 21 12 21c6.627 0 12-4.477 12-11S18.627 0 12 0Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="h-6 w-6"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);


export function FloatingCTAButton() {
  const pathname = usePathname();

  if (pathname === '/purchase' || pathname === '/promo/october' || pathname.startsWith('/coupon-manager')) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end gap-3">
       <Button
        asChild
        size="icon"
        className="rounded-full bg-[#d62976] text-white hover:bg-[#d62976]/90 h-14 w-14 shadow-lg border-2 border-white/80"
        aria-label="헬스보이짐 공식 인스타그램"
        data-gtm-id="floating-instagram-click"
       >
         <Link href="https://www.instagram.com/healthboy_official/" target="_blank" rel="noopener noreferrer">
           <InstagramIcon />
         </Link>
       </Button>
       <Button
        asChild
        size="icon"
        className="rounded-full bg-[#FEE500] text-black hover:bg-[#FEE500]/90 h-14 w-14 shadow-lg border-2 border-white/80"
        aria-label="카카오톡 상담하기"
        data-gtm-id="floating-kakao-click"
       >
         <Link href="http://pf.kakao.com/_zxaMxmn/chat" target="_blank" rel="noopener noreferrer">
           <KakaoIcon />
         </Link>
       </Button>
      <Button
        asChild
        size="lg"
        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg font-bold shadow-lg h-12 px-6 md:h-14 md:px-8 border-2 border-white/80"
        data-gtm-id="floating-purchase-click"
      >
        <Link href="/purchase">
          <Ticket className="mr-2 h-5 w-5" />
          헬보올패스 구매하기
        </Link>
      </Button>
    </div>
  );
}
