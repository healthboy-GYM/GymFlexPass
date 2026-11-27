'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Star } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';

const KakaoIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="currentColor"
  >
    <path d="M12 0C5.373 0 0 4.477 0 10c0 4.023 2.623 7.43 6.205 8.995.01.005.02.01.03.015l-1.015 3.456a.46.46 0 0 0 .644.512l4.135-2.14a1.16 1.16 0 0 1 .64-.175C10.996 20.92 11.496 21 12 21c6.627 0 12-4.477 12-11S18.627 0 12 0Z" />
  </svg>
);


export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: '홈', gtmId: 'home' },
    { href: '/brand-story', label: '헬스보이짐', gtmId: 'brand-story' },
    { href: '/helbo-pass', label: '헬보올패스', gtmId: 'helbo-pass' },
    { href: '/usage-guide', label: '이용방법', gtmId: 'usage-guide' },
    { href: '/branch-locator', label: '지점찾기', gtmId: 'branch-locator' },
    { href: '/body-challenge', label: '바디챌린지', gtmId: 'body-challenge' },
    { href: '/faq', label: 'FAQ', gtmId: 'faq' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Mobile Header */}
        <div className="grid w-full grid-cols-3 items-center md:hidden">
          <div />
          <Link href="/" className="relative h-10 w-[120px] justify-self-center" data-gtm-id="header-logo-click">
            <Image src="/logo.png" alt="헬스보이짐 로고" fill sizes="120px" className="object-contain" priority/>
          </Link>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="justify-self-end">
                <Menu className="h-6 w-6" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-card p-0">
              <SheetHeader className="p-4 border-b border-border/40">
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                <Link href="/" className="flex items-center space-x-2 relative w-[120px] h-10" onClick={() => setIsMobileMenuOpen(false)} data-gtm-id="header-mobile-logo-click">
                  <Image src="/logo.png" alt="헬스보이짐 로고" fill sizes="120px" className="object-contain" />
                </Link>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <ScrollArea className="flex-grow">
                  <nav className="p-4">
                    <ul className="space-y-2">
                      {navLinks.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="block rounded-md px-3 py-2 text-base font-medium text-card-foreground hover:text-primary hover:bg-secondary"
                            onClick={() => setIsMobileMenuOpen(false)}
                            data-gtm-id={`header-mobile-nav-${link.gtmId}-click`}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                       <li>
                          <Link
                            href="/coupon-manager"
                            className="block rounded-md px-3 py-2 text-base font-medium text-card-foreground hover:text-primary hover:bg-secondary"
                            onClick={() => setIsMobileMenuOpen(false)}
                            data-gtm-id="header-mobile-nav-coupon-manager-click"
                          >
                            쿠폰 등록
                          </Link>
                        </li>
                    </ul>
                  </nav>
                </ScrollArea>
                <div className="p-4 mt-auto border-t border-border/40 space-y-2">
                  <Button asChild className="w-full bg-[#FEE500] text-black hover:bg-[#FEE500]/90" data-gtm-id="header-mobile-kakao-click">
                    <Link href="http://pf.kakao.com/_zxaMxmn/chat" target="_blank" rel="noopener noreferrer">
                      <KakaoIcon />
                      카카오톡 상담
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Header */}
        <div className="hidden w-full md:flex items-center">
          <Link href="/" className="mr-6 flex items-center relative w-[120px] h-10" data-gtm-id="header-logo-click">
            <Image src="/logo.png" alt="헬스보이짐 로고" fill sizes="120px" className="object-contain" priority />
          </Link>
          <nav className="flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                data-gtm-id={`header-nav-${link.gtmId}-click`}
              >
                {link.label}
              </Link>
            ))}
             <Link
                href="/coupon-manager"
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary flex items-center gap-1"
                data-gtm-id="header-nav-coupon-manager-click"
              >
                <Star className="h-4 w-4 text-primary" />
                쿠폰 등록
              </Link>
          </nav>
          <div className="flex-1" />
          <div className="flex items-center justify-end gap-2">
            <Button asChild className="bg-[#FEE500] text-black hover:bg-[#FEE500]/90" data-gtm-id="header-kakao-click">
              <Link href="http://pf.kakao.com/_zxaMxmn/chat" target="_blank" rel="noopener noreferrer">
                <KakaoIcon />
                카카오톡 상담
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
