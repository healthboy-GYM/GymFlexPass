
'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Home, PartyPopper } from 'lucide-react';
import Link from 'next/link';

export default function OctoberPromoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container flex items-center justify-center py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
          <PartyPopper className="h-16 w-16 text-primary mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            10월 한정 특가 이벤트가 종료되었습니다.
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            보내주신 뜨거운 성원에 감사드립니다. <br />
            더 좋은 이벤트로 다시 찾아뵙겠습니다!
          </p>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
