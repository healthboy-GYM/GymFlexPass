
import { HowToUseSection } from '@/components/sections/HowToUseSection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: '이용 방법',
  description: '헬보올패스 구매부터 지점 이용까지 전체 이용 방법을 안내합니다.',
};

export default function HowToUsePage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow">
                <HowToUseSection />
            </main>
            <Footer />
        </div>
    );
}
