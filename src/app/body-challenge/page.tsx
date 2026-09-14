
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BodyChallengeSection } from '@/components/sections/BodyChallengeSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: '바디 챌린지',
  description: '헬스보이짐 헬보올패스와 함께하는 바디 챌린지. 목표를 세우고 전국 지점에서 도전하세요.',
};

export default function BodyChallengePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <div className="container px-4 md:px-6 pt-12">
            <Button variant="outline" asChild className="mb-8 hover:bg-primary hover:text-primary-foreground" data-gtm-id="body-challenge-back-home-click">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
                </Link>
            </Button>
        </div>
        <BodyChallengeSection />
      </main>
      <Footer />
    </div>
  );
}
