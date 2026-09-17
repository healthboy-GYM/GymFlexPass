
'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Crown } from 'lucide-react';
import Link from 'next/link';

const tierData = [
  {
    name: 'S-PREMIUM',
    koreanName: 'S-프리미엄 올패스',
    icon: <Crown className="h-8 w-8 text-yellow-400" />,
    iconContainerClass: 'bg-white',
    description: 'S-프리미엄 등급 이하, 즉 모든 지점을 이용할 수 있습니다.',
    availability: [
      { region: '서울', gyms: ['신촌점', '가락점'] },
      { region: '전북', gyms: ['전주송천점'] },
    ],
    tierColor: 'border-yellow-400'
  },
  {
    name: 'PREMIUM',
    koreanName: '프리미엄 올패스',
    icon: <span className="text-2xl font-bold text-white">P</span>,
    iconContainerClass: 'bg-red-600',
    description: '프리미엄 등급 이하(프리미엄, 골드, 실버, 블랙) 지점을 이용할 수 있습니다.',
    availability: [
      { region: '서울', gyms: ['강남고속터미널점', '건대스타시티몰점', '문정역점', '여의도역점', '잠실점'] },
      { region: '경기', gyms: ['매탄점', '판교역점'] },
      { region: '대전', gyms: ['송촌점'] },
    ],
    tierColor: 'border-red-600'
  },
  {
    name: 'GOLD',
    koreanName: '골드 올패스',
    icon: <span className="text-2xl font-bold text-white">G</span>,
    iconContainerClass: 'bg-orange-500',
    description: '골드 등급 이하(골드, 실버, 블랙) 지점을 이용할 수 있습니다.',
    availability: [
        { region: '서울', gyms: ['상암mbc점', '선릉점', '양천향교역점', '영등포점', '홍대점', '여의도점'] },
        { region: '경기', gyms: ['광교점', '권선점', '망포점', '미금점', '수내점', '수지점', '인계점', '정자점', '천천점'] },
        { region: '대전', gyms: ['도안점', '태평점', '테크노밸리점'] },
        { region: '충남', gyms: ['신부점'] },
        { region: '울산', gyms: ['삼산점'] },
        { region: '대구', gyms: ['롯데대구역점'] },
    ],
    tierColor: 'border-orange-500'
  },
  {
    name: 'SILVER',
    koreanName: '실버 올패스',
    icon: <span className="text-2xl font-bold text-white">S</span>,
    iconContainerClass: 'bg-gray-400',
    description: '실버 등급 이하(실버, 블랙) 지점을 이용할 수 있습니다.',
    availability: [
        { region: '서울', gyms: ['당산역점', '문래역점', '강남역점', '가산역점', '불광점', '서울시청점', '신논현점', '을지로점', '장안점', '학동역점'] },
        { region: '경기', gyms: ['상현점', '죽전점', '영통판타지움점', '상록수역점', '고양행신점', '병점점', '부천역점', '안산중앙점', '배곧점', '일산주엽점'] },
        { region: '대전', gyms: ['둔산점', '대전시청점', '탄방점', '대전터미널점', '목원대점', '월평점', 'NC대전유성점', '관저점'] },
        { region: '충남', gyms: ['쌍용점'] },
    ],
    tierColor: 'border-gray-400'
  },
  {
    name: 'BLACK',
    koreanName: '블랙 올패스',
    icon: <span className="text-2xl font-bold text-black">B</span>,
    iconContainerClass: 'bg-yellow-400',
    description: '블랙 등급의 지점만 이용할 수 있습니다.',
    availability: [
      { region: '서울', gyms: ['가양역점'] },
      { region: '경기', gyms: ['비전점', '철산점', '평택역점'] },
      { region: '대전', gyms: ['가오점'] },
      { region: '충북', gyms: ['복대점'] },
      { region: '부산', gyms: ['당리점', '서면점', '하단점'] },
      { region: '경남', gyms: ['창원중앙점'] },
    ],
    tierColor: 'border-yellow-400'
  },
];


const RegionBadge = ({ region }: { region: string }) => {
    let colorClass = 'bg-gray-500 text-white';
    switch (region) {
        case '서울': colorClass = 'bg-blue-600 text-white'; break;
        case '경기': colorClass = 'bg-orange-500 text-white'; break;
        case '대전': colorClass = 'bg-purple-600 text-white'; break;
        case '부산': colorClass = 'bg-sky-500 text-white'; break;
        case '충청':
        case '충남':
        case '충북': colorClass = 'bg-green-600 text-white'; break;
        case '경남':
        case '경상':
        case '대구': colorClass = 'bg-yellow-600 text-white'; break;
        case '울산': colorClass = 'bg-red-500 text-white'; break;
        case '전북': colorClass = 'bg-teal-500 text-white'; break;
    }
    return <span className={`inline-block text-xs font-semibold mr-2 px-2.5 py-1 rounded-full ${colorClass}`}>{region}</span>
}


export default function TierGuidePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container py-12 md:py-20 lg:py-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <Button variant="outline" asChild className="mb-8 hover:bg-primary hover:text-primary-foreground">
            <Link href="/helbo-pass">
              <ArrowLeft className="mr-2 h-4 w-4" /> 헬보올패스 페이지로
            </Link>
          </Button>
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              헬보올패스 등급별 이용 가능 지점 안내
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl/relaxed">
              각 패스 등급으로 이용할 수 있는 지점을 확인해보세요.
            </p>
          </div>
          <div className="space-y-12">
            {tierData.map((tier) => (
              <Card key={tier.name} className={`bg-card text-card-foreground border-2 ${tier.tierColor} shadow-lg shadow-primary/10`}>
                <CardHeader className="flex flex-col md:flex-row items-center gap-6 p-6">
                  <div className={`flex-shrink-0 h-20 w-20 md:h-24 md:w-24 rounded-full flex items-center justify-center ${tier.iconContainerClass}`}>
                    {tier.icon}
                  </div>
                  <div className="text-center md:text-left">
                    <CardTitle className="text-2xl md:text-3xl font-black text-primary">{tier.name}</CardTitle>
                    <p className="text-lg md:text-xl font-semibold text-card-foreground">{tier.koreanName}</p>
                    {tier.description && <CardDescription className="text-base text-muted-foreground mt-2">{tier.description}</CardDescription>}
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                    {tier.availability.map((regionData) => (
                        <div key={regionData.region}>
                            <div className="flex items-center mb-2">
                               <RegionBadge region={regionData.region} />
                            </div>
                            <p className="text-card-foreground/90 leading-relaxed">
                                {regionData.gyms.join(', ')}
                            </p>
                        </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
