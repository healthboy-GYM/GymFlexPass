'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Ticket, Search, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import validCouponCodes from '@/data/coupon_code.json';

const formSchema = z.object({
  couponCode: z.string().length(8, { message: '쿠폰 번호는 8자리여야 합니다.' }),
});

type CouponStatus = 'idle' | 'valid' | 'used' | 'invalid';

interface UsedCouponData {
    branch: string;
    usedAt: Timestamp;
}

export default function CouponManagerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validCodes, setValidCodes] = useState<Set<string>>(new Set());
  const [isLoadingFile, setIsLoadingFile] = useState(true);
  const { toast } = useToast();

  const [couponStatus, setCouponStatus] = useState<CouponStatus>('idle');
  const [checkedCoupon, setCheckedCoupon] = useState<{ code: string; data?: UsedCouponData } | null>(null);

  useEffect(() => {
    // Load coupons from the imported JSON file
    const codes = validCouponCodes.map((row: any) => row[0]?.trim()).filter(Boolean);
    setValidCodes(new Set(codes));
    setIsLoadingFile(false);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      couponCode: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setCouponStatus('idle');
    setCheckedCoupon(null);
    const couponCode = values.couponCode.toUpperCase();
    
    if (!validCodes.has(couponCode)) {
      setCouponStatus('invalid');
      setCheckedCoupon({ code: couponCode });
      setIsSubmitting(false);
      return;
    }

    try {
      const couponRef = doc(db, 'usedCoupons', couponCode);
      const couponSnap = await getDoc(couponRef);

      if (couponSnap.exists()) {
        setCouponStatus('used');
        setCheckedCoupon({ code: couponCode, data: couponSnap.data() as UsedCouponData });
      } else {
        setCouponStatus('valid');
        setCheckedCoupon({ code: couponCode });
      }
    } catch (error) {
      console.error("Error checking coupon:", error);
      toast({
        variant: "destructive",
        title: "조회 오류",
        description: "쿠폰을 확인하는 중 문제가 발생했습니다. 네트워크 연결을 확인해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const resetForm = () => {
    setCouponStatus('idle');
    setCheckedCoupon(null);
    form.reset();
  }

  const renderResult = () => {
    if (!checkedCoupon) return null;

    if (couponStatus === 'valid') {
      return (
        <Card className="bg-green-500/10 border-green-500/30 text-center p-6">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-foreground">사용 가능한 쿠폰입니다.</h3>
          <p className="font-mono text-muted-foreground mt-1">{checkedCoupon.code}</p>
        </Card>
      );
    }
    if (couponStatus === 'used') {
      return (
        <Card className="bg-yellow-500/10 border-yellow-500/30 text-center p-6">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-foreground">이미 사용된 쿠폰입니다.</h3>
          <p className="font-mono text-muted-foreground mt-1">{checkedCoupon.code}</p>
          {checkedCoupon.data && (
            <div className="text-sm text-muted-foreground mt-2">
              <p>등록 지점: {checkedCoupon.data.branch}</p>
              <p>등록 시간: {format(checkedCoupon.data.usedAt.toDate(), 'yyyy-MM-dd HH:mm', { locale: ko })}</p>
            </div>
          )}
        </Card>
      );
    }
     if (couponStatus === 'invalid') {
      return (
        <Card className="bg-destructive/10 border-destructive/30 text-center p-6">
          <XCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="font-bold text-lg text-foreground">유효하지 않은 쿠폰 번호입니다.</h3>
          <p className="font-mono text-muted-foreground mt-1">{checkedCoupon.code}</p>
        </Card>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow container py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" asChild className="mb-8 hover:bg-primary hover:text-primary-foreground" data-gtm-id="coupon-checker-back-home-click">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
            </Link>
          </Button>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="inline-block bg-primary text-primary-foreground rounded-full p-3 mx-auto w-fit mb-2">
                <Ticket className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">쿠폰 유효성 검사</CardTitle>
              <CardDescription>
                지점장님, 쿠폰 번호를 입력하여 사용 가능 여부를 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingFile && (
                <div className="flex items-center justify-center p-4 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-600">
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  <span className="text-sm font-medium">유효 쿠폰 목록을 불러오는 중입니다...</span>
                </div>
              )}
               <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="couponCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>쿠폰 번호</FormLabel>
                        <FormControl>
                          <Input 
                              placeholder="예: A1B2C3D4" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value.toUpperCase());
                                setCouponStatus('idle');
                                setCheckedCoupon(null);
                              }}
                              className="font-mono text-center text-lg h-12"
                              maxLength={8}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting || isLoadingFile} data-gtm-id="coupon-checker-submit-click">
                    {isLoadingFile ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                    {isLoadingFile ? '쿠폰 목록 로딩 중...' : '쿠폰 확인하기'}
                  </Button>
                </form>
              </Form>

              {couponStatus !== 'idle' && (
                <div className="space-y-4">
                  <div className="border-t border-dashed" />
                  {renderResult()}
                  <Button onClick={resetForm} variant="outline" className="w-full">
                    새로 확인하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
