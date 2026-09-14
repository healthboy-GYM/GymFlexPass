
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ClientBranchLocator from '@/components/sections/ClientBranchLocator';

export const metadata = {
  title: '지점 찾기',
  description: '헬보올패스로 이용 가능한 전국 헬스보이짐 지점을 지도에서 확인하세요.',
};

export default function BranchLocatorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <ClientBranchLocator />
      </main>
      <Footer />
    </div>
  );
}
