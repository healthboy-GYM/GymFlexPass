
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FaqSection } from '@/components/sections/FaqSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: '자주 묻는 질문',
  description: '헬보올패스 이용, 결제, 지점, 환불 등 자주 묻는 질문을 모았습니다.',
};

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <div className="container px-4 md:px-6 pt-12">
            <Button variant="outline" asChild className="mb-8 hover:bg-primary hover:text-primary-foreground" data-gtm-id="faq-back-home-click">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
                </Link>
            </Button>
        </div>
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
