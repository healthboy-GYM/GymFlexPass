
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: '김민지',
    role: '20대 직장인, 판교점',
    image: 'https://picsum.photos/seed/person1/200/200',
    imageHint: 'woman office worker',
    quote:
      '전국 어디서든 운동할 수 있어서 너무 편해요! 꾸준히 운동하는 습관이 생겼습니다.',
  },
  {
    name: '이준호',
    role: '30대 개발자, 강남+수원 이용',
    image: 'https://picsum.photos/seed/person2/200/200',
    imageHint: 'man developer',
    quote:
      '프리미엄 시설을 여러 지점에서 경험할 수 있어 만족도가 높아요.',
  },
  {
    name: '@happy_pilates',
    role: '인플루언서, 릴스 챌린지 참여',
    image: 'https://picsum.photos/seed/person3/200/200',
    imageHint: 'woman influencer',
    quote:
      '릴스 이벤트 참여하면서 다양한 지점 분위기를 보는 게 정말 즐거웠어요! 굿즈도 잘 쓰고 있습니다.',
  },
  {
    name: '박서연',
    role: '30대 프리랜서, 홍대점',
    image: 'https://picsum.photos/seed/person4/200/200',
    imageHint: 'woman freelancer',
    quote:
      '집 근처, 작업실 근처 어디서든 갈 수 있으니 시간 활용도가 정말 높아졌어요. 최고의 선택!',
  },
];

export function ReviewsSection() {
  return (
    <section id="user-reviews" className="w-full py-12 md:py-24 lg:py-32 bg-secondary text-secondary-foreground">
      <div className="container px-4 md:px-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl text-foreground">
            회원들이 직접 경험한 <span className="text-primary">헬보올패스</span>
          </h2>
           <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            헬보올패스와 함께 운동 라이프스타일이 바뀐 회원님들의 생생한 후기를 확인해보세요.
          </p>
        </div>
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-1 h-full">
              <Card className="flex flex-col bg-card border-border/50 text-card-foreground h-full shadow-lg">
                <CardHeader className="pb-4">
                   <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-base font-medium text-card-foreground/90">"{testimonial.quote}"</p>
                </CardContent>
                <CardFooter className="flex items-center space-x-4 pt-4 mt-auto">
                  <Image
                    src={testimonial.image}
                    alt={`${testimonial.name}님 프로필 사진`}
                    data-ai-hint={testimonial.imageHint}
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
