'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, FileText, MessageCircle, QrCode, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useGyms } from '@/hooks/use-gyms';
import { db, addDoc, collection, serverTimestamp } from '@/lib/firebase';
import { PrivacyPolicyModal } from '@/components/layout/PrivacyPolicyModal';

const formSchema = z.object({
  name: z.string().min(2, { message: '이름은 2자 이상 입력해주세요.' }),
  phone: z
    .string()
    .regex(/^01[01679]-\d{3,4}-\d{4}$/, {
      message: '올바른 휴대폰 번호 형식(010-1234-5678)이 아닙니다.',
    }),
  mainGym: z.string({ required_error: '주 이용지점을 선택해주세요.' }),
  privacy: z.boolean().refine(val => val === true, { message: '개인정보 수집 및 이용에 동의해주세요.' }),
});

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { gyms } = useGyms();
  const uniqueGyms = useMemo(() => Array.from(new Set(gyms.map((g: any) => g.c))).sort(), [gyms]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      mainGym: undefined,
      privacy: false,
    },
  });

  const watchedPhone = form.watch('phone');

  useEffect(() => {
    const formatPhoneNumber = (value: string) => {
      if (!value) return value;
      const phoneNumber = value.replace(/[^\d]/g, '');
      const phoneNumberLength = phoneNumber.length;
      if (phoneNumberLength < 4) return phoneNumber;
      if (phoneNumberLength < 8) {
        return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
      }
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
    };

    const formatted = formatPhoneNumber(watchedPhone);
    if (formatted !== watchedPhone) {
        form.setValue('phone', formatted, { shouldValidate: true });
    }
  }, [watchedPhone, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "registrations"), {
        name: values.name,
        phone: values.phone,
        mainGym: values.mainGym,
        createdAt: serverTimestamp(),
        status: 'new'
      });

      toast({
        title: '✅ 신청 완료',
        description: '주 이용지점 신청이 완료되었습니다. 곧 지점에서 확인 후 처리될 예정입니다.',
      });
      form.reset();
    } catch (error) {
      console.error("Error adding registration: ", error);
      toast({
        variant: "destructive",
        title: '오류 발생',
        description: '신청 중 문제가 발생했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg font-bold text-foreground mb-3">{children}</h3>
  );

  const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{children}</p>
  );

  const ListItem = ({ children }: { children: React.ReactNode }) => (
     <li className="text-sm md:text-base text-muted-foreground leading-relaxed pl-2 relative before:content-['•'] before:absolute before:left-[-0.5rem] before:top-0 before:text-primary">{children}</li>
  );

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow container py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" asChild className="mb-8 hover:bg-primary hover:text-primary-foreground" data-gtm-id="register-back-home-click">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
            </Link>
          </Button>
          
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="inline-block bg-primary text-primary-foreground rounded-full p-3 mx-auto w-fit mb-2">
                  <FileText className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">주 이용지점 등록</CardTitle>
              <CardDescription>
                헬보올패스 구매를 환영합니다! <br/> 원활한 서비스 이용을 위해 정보를 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>이름</FormLabel>
                        <FormControl>
                          <Input placeholder="홍길동" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>연락처</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="010-1234-5678" {...field} maxLength={13} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mainGym"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>주 이용지점 선택</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-gtm-id="register-gym-select-click">
                              <SelectValue placeholder="가장 방문이 편리한 지점을 선택해주세요." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {uniqueGyms.map((gymName) => (
                              <SelectItem key={gymName} value={gymName}>
                                {gymName.replace('헬스보이짐', '').trim()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="privacy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
                        <FormControl>
                          <Checkbox id="privacy-register" checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <label htmlFor="privacy-register" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            [필수] 개인정보 수집·이용 동의
                          </label>
                          <FormMessage className="!mt-1.5" />
                          <div className="-ml-3">
                            <PrivacyPolicyModal />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? '신청 정보 전송 중...' : '신청하기'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <section className="mt-16">
            <Card className="bg-card text-card-foreground border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">주 이용 지점 선택 후 안내 사항</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center justify-center p-4 rounded-md bg-primary/10 border border-primary/20 flex-col gap-2">
                    <Link
                        href="http://pf.kakao.com/_zxaMxmn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md bg-[#FEE500] px-5 py-2.5 text-sm font-bold text-[#3C1E1E] shadow-sm transition hover:brightness-95"
                    >
                        <MessageCircle className="h-4 w-4" />
                        카카오톡 채널 추가
                    </Link>
                    <p className="text-lg text-muted-foreground text-center">
                      * <strong className="text-foreground">“헬스보이짐 헬보올패스” 카카오채널에 “챗봇 문의”</strong>로 문의주시면 실시간 답변을 받아 보실 수 있습니다.
                    </p>
                </div>

                <div>
                    <SectionTitle>올패스 이용 프로세스</SectionTitle>
                    <ol className="list-decimal list-inside space-y-2">
                        <ListItem>주 이용지점에 방문하셔서 오프라인 계약서를 작성</ListItem>
                        <ListItem>“운톡 어플”을 통한 큐알 체크인 <br/><span className="text-xs">(오프라인 계약서를 작성하기 전이라도 운톡을 통한 큐알 체크인은 가능합니다.)</span></ListItem>
                    </ol>
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border/30 mt-4 shadow-sm">
                        {/* TODO: 실제 운톡 QR 체크인 안내 이미지로 교체 (예: Firebase Storage /assets 경로) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
                            <QrCode className="h-8 w-8" />
                            <span className="text-sm font-medium">QR 체크인 안내 이미지 준비 중</span>
                        </div>
                    </div>
                </div>

                <div>
                    <SectionTitle>통합회원권의 주 이용지점 안내</SectionTitle>
                    <ol className="list-decimal list-inside space-y-2">
                        <ListItem>온라인에서 “통합회원권”을 구매하는 회원은 “주 이용지점”을 선택해야 합니다.</ListItem>
                        <ListItem>회원이 선택한 “주 이용지점”은 “통합회원권” 회원에게 시설이용과 관련한 중요한 공지사항을 전달하고 담당트레이너를 배정하는 역할을 담당합니다.</ListItem>
                        <ListItem>“통합회원권”과 관련한 각종 문의사항과 환불처리 등의 업무는 회원이 선택한 “주 이용지점”에서 처리합니다.</ListItem>
                        <ListItem>온라인에서 “통합회원권”을 구매한 회원은 “주 이용지점”에서 환불 규정, 이용 규정 등이 포함된 통합회원권 계약서를 작성하고 체결해야 합니다.</ListItem>
                    </ol>
                </div>

                <div>
                    <SectionTitle>올패스 이용권의 시작일은</SectionTitle>
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border/30 mb-4 shadow-sm">
                        {/* TODO: 실제 이용 시작일 설정 안내 이미지로 교체 */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
                            <CalendarDays className="h-8 w-8" />
                            <span className="text-sm font-medium">시작일 설정 안내 이미지 준비 중</span>
                        </div>
                    </div>
                    <Paragraph>
                        온라인 결제시 계약서 작성 단계에서 설정이 가능하며, 결제일 기준 3개월 이내로 시작일 설정이 가능합니다. 시작일이 개시되고 난 이후 시작일 변경은 불가 합니다. 개시 전 시작일 변경은 1회에 한해서 가능하며 올패스 홈페이지에 있는 카카오 채널 상담원 연결을 누른 후 내용을 남겨주세요.
                    </Paragraph>
                </div>
                
                <div>
                    <SectionTitle>올패스 이용 횟수 안내</SectionTitle>
                    <Paragraph>하루 다지점 이용이 가능하시며, 한 지점당 1일 1회 사용이 가능합니다. 예)오전A지점 ,오후B지점 이용 가능하지만 A지점 하루2회입장 불가.</Paragraph>
                </div>

                <div>
                    <SectionTitle>옵션 안내</SectionTitle>
                    <ul className="space-y-4">
                        <li>
                            <h4 className="font-semibold text-foreground">운동복</h4>
                            <Paragraph>주 이용지점에서 결제하셔야 하며 결제 시 다지점(등급 이용권에 해당하는 모든 지점) 이용이 가능합니다. 금액은 지점마다 상이할 수 있어 지점으로 문의 부탁드립니다.</Paragraph>
                        </li>
                        <li>
                            <h4 className="font-semibold text-foreground">락커</h4>
                            <Paragraph>지점별 결제가 가능합니다. 이용을 원하시는 지점에서 락커를 결제해주시면 올패스 기간 동안 이용이 가능하십니다. (해당지점에서만 이용 가능)</Paragraph>
                        </li>
                    </ul>
                </div>

                 <div>
                    <SectionTitle>지점의 등급</SectionTitle>
                    <ol className="list-decimal list-inside space-y-2">
                        <ListItem>헬스보이짐의 각 지점 등급에 대해서는 “통합회원권” 안내 웹사이트 및 각 지점의 안내 게시물등을 통해 확인하실 수 있습니다.</ListItem>
                        <ListItem>헬스보이짐 각 지점의 등급은 변경될 수 있으며, 등급 변경 1개월 전에 “통합회원권” 안내 웹사이트 및 지점 안내문 게시 또는 회원이 지점 출입을 위해 사용하는 모바일 어플리케이션의 알림을 통해 변경사항을 고지합니다.</ListItem>
                        <ListItem>각 등급의 “통합회원권”은 동일 등급 이하의 지점을 모두 이용할 수 있는 권리를 부여하는 것이므로 개별 지점의 등급 변경 또는 운영중단에 대해서는 “통합회원권”에 대한 환불의 이유가 되지 않습니다.</ListItem>
                    </ol>
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
