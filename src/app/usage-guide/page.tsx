
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UsageGuideContent } from '@/components/sections/UsageGuideContent';

export const metadata = {
  title: '이용 안내',
  description: '헬보올패스 이용 규정, 지점 등급, 이용 횟수 등 상세 이용 안내입니다.',
};

export default function UsageGuidePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container py-12 md:py-20 lg:py-24 px-4 md:px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <Button variant="outline" asChild className="mb-8 hover:bg-primary hover:text-primary-foreground" data-gtm-id="usage-guide-back-home-click">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
            </Link>
          </Button>

          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              헬보올패스 이용 프로세스
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              헬보올패스 웹페이지에서 정보를 확인하고, 운톡 결제를 통해 쉽고 편리하게 헬보올패스를 시작해 보세요!
            </p>
          </div>

          <UsageGuideContent />
        </div>
      </main>

      <Footer />
    </div>
  );
}
