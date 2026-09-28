
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ClientBranchLocator from '@/components/sections/ClientBranchLocator';
import { NaverConversionBeacon } from '@/components/layout/NaverConversionBeacon';

export const metadata = {
  title: '지점 찾기',
  description: '헬보올패스로 이용 가능한 전국 헬스보이짐 지점을 지도에서 확인하세요.',
};

export default function BranchLocatorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* 지점찾기 방문 = 네이버 CTS 리드 전환 */}
        <NaverConversionBeacon conv={{ type: 'lead' }} />
        <ClientBranchLocator />
      </main>
      <Footer />
    </div>
  );
}
