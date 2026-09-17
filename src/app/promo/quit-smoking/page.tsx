
'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Gift, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const promoData = {
    tier: 'Premium',
    duration: '1',
    price: 49500,
    originalPrice: 152000,
    link: 'https://bmarket.broj.co.kr/products/334405',
};

const NoSmokingPtIcon = () => (
    <svg width="100" height="100" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M128 64C128 99.3462 99.3462 128 64 128C28.6538 128 0 99.3462 0 64C0 28.6538 28.6538 0 64 0C99.3462 0 128 28.6538 128 64Z" fill="#23FF00"/>
        <path d="M40.165 43.1492L64.1201 27.0508L88.0751 43.1492V75.346L64.1201 91.4444L40.165 75.346V43.1492Z" fill="#131313"/>
        <path d="M49.034 50.1197L64.1201 40.5898L79.2061 50.1197V69.18L64.1201 78.7099L49.034 69.18V50.1197Z" fill="#23FF00"/>
        <path d="M64.5 50L61.5 58H56L63 45L70 58H65.5L62.5 50H64.5Z" fill="#131313"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M72 61H54V64H72V61Z" fill="#131313"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M72 67H54V70H72V67Z" fill="#131313"/>
    </svg>
);


export default function QuitSmokingChallengePage() {

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      <main className="flex-grow">
        <div className="container px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto">
                 <Button variant="outline" asChild className="mb-8 bg-transparent border-neutral-700 hover:bg-neutral-800" data-gtm-id="promo-quit-smoking-back-home-click">
                    <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
                    </Link>
                </Button>
            
                <div className="bg-black rounded-lg overflow-hidden">
                    {/* Header Image and Text */}
                    <div className="relative text-white text-center">
                         <Image
                            src="https://picsum.photos/seed/quit-smoking-bg/1200/800"
                            alt="금연 챌린지 배경 이미지"
                            data-ai-hint="fitness determination"
                            width={1200}
                            height={800}
                            className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                        <div className="absolute top-4 right-4 text-right text-xs">
                            <p>금연, 성공하고 싶다면</p>
                            <p className="font-bold">1544-9030</p>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
                            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tighter">
                                폐활량<br/>벌크업엔<br/><span className="text-[#23FF00]">금연이 답!</span>
                            </h1>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 space-y-8">
                         <div>
                             <p className="text-center text-muted-foreground mb-6">
                                새해 금연 다짐, 미루지 마세요!
                                <br/>
                                헬스보이짐과 보건복지부가 당신의 새해 첫 도전을 응원합니다.
                            </p>
                            
                            <Card className="bg-neutral-900 rounded-lg p-4 space-y-3 border border-neutral-800 mb-6">
                               <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-neutral-400">진행기간</span>
                                    <span className="text-white">12월 1일 ~ 1월 31일</span>
                               </div>
                               <div className="flex justify-between items-center">
                                    <span className="font-semibold text-neutral-400 text-sm">참여 혜택</span>
                                    <div className="text-right">
                                         <span className="font-bold text-white text-lg">프리미엄 1개월권 특별가</span>
                                         <div className="flex items-baseline justify-end gap-2">
                                            <span className="text-sm text-neutral-500 line-through">{promoData.originalPrice.toLocaleString()}원</span>
                                            <span className="text-2xl font-bold text-[#23FF00]">{promoData.price.toLocaleString()}원</span>
                                         </div>
                                    </div>
                               </div>
                            </Card>

                            <Button asChild size="lg" className="w-full h-14 text-lg bg-[#23FF00] text-black hover:bg-[#23FF00]/90 font-bold" data-gtm-id="promo-quit-smoking-purchase-click">
                                <Link href={promoData.link} target="_blank" rel="noopener noreferrer">
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    프리미엄 1개월권 구매하기
                                </Link>
                            </Button>
                        </div>
                        
                        <Card className="bg-neutral-900 border-neutral-800 text-white">
                          <CardHeader>
                            <CardTitle className="text-xl">금연 성공 다짐 SNS 챌린지</CardTitle>
                            <CardDescription className="text-neutral-400">금연 챌린지에 참여하고 추가 선물도 받으세요!</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4 text-sm">
                              <div>
                                  <h4 className="font-semibold mb-2 text-neutral-300">✅ 참여 대상</h4>
                                  <p className="text-neutral-400">헬보 올패스 '프리미엄 1개월권' 구매자</p>
                              </div>
                              <div>
                                  <h4 className="font-semibold mb-2 text-neutral-300">✍️ 참여 방법</h4>
                                  <ol className="list-decimal list-inside space-y-2 text-neutral-400">
                                      <li><strong className="text-white">헬스보이짐 로고가 보이게 내부 전경을 찍은 사진</strong>과 함께, "나는 OOO(가족, 미래, 건강)을 위해 금연합니다!" 문구 작성</li>
                                      <li>개인 SNS에 필수 해시태그와 함께 공유</li>
                                  </ol>
                              </div>
                               <div>
                                  <h4 className="font-semibold mb-2 flex items-center gap-1.5 text-neutral-300"><Tag className="h-4 w-4" /> 필수 해시태그</h4>
                                  <div className="flex flex-wrap gap-2">
                                      <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 border-neutral-700">#헬스보이짐노담챌린지</Badge>
                                      <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 border-neutral-700">#보건복지부금연캠페인</Badge>
                                      <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 border-neutral-700">#헬스보이짐</Badge>
                                      <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 border-neutral-700">#헬보올패스</Badge>
                                  </div>
                              </div>
                              <div>
                                  <h4 className="font-semibold mb-2 flex items-center gap-1.5 text-neutral-300"><Gift className="h-4 w-4" /> 참여 경품</h4>
                                  <p className="text-neutral-400">추첨을 통해 <strong className="text-white">스타벅스 기프티콘 5,000원</strong> 증정</p>
                              </div>
                          </CardContent>
                        </Card>

                        <div className="flex justify-center items-center gap-4 pt-4">
                            <Image
                                src="https://picsum.photos/seed/healthboylogo/200/60"
                                alt="헬스보이짐 로고"
                                width={100}
                                height={30}
                                className="object-contain"
                                data-ai-hint="gym logo"
                            />
                             <Image
                                src="https://picsum.photos/seed/govlogo/240/80"
                                alt="보건복지부 로고"
                                width={120}
                                height={40}
                                className="object-contain invert brightness-0"
                                data-ai-hint="government logo"
                            />
                             <div className="w-20 h-20">
                                <NoSmokingPtIcon />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
