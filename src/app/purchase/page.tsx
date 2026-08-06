
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CreditCard, Crown, Gem, Medal, BarChart3, Heart, Percent, AlertCircle, ExternalLink, CalendarDays, User, Phone, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { db, addDoc, collection, serverTimestamp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useGyms } from '@/hooks/use-gyms';
import { PrivacyPolicyModal } from '@/components/layout/PrivacyPolicyModal';
import { subscribePricing, DEFAULT_PRODUCTS, DURATIONS, DURATION_LABELS, type Product } from '@/lib/pricing';

declare global {
  interface Window {
    karrotPixel: any;
  }
}

// 상품 아이콘은 표시 순서에 따라 자동 배정(관리자가 신경 쓸 필요 없음).
const TIER_ICONS = [Crown, Gem, Medal, BarChart3, Heart];
const iconFor = (index: number) => TIER_ICONS[index % TIER_ICONS.length];

const durationOptions = DURATIONS.map((value) => ({ value, label: DURATION_LABELS[value] }));

const NOTION_INSTALLMENT_URL = "https://broj.notion.site/25-09-52ec24caa1c847fe8c5023d9e983147b";

export default function PurchasePage() {
  const { toast } = useToast();
  const { gyms } = useGyms();
  const uniqueGyms = useMemo(() => Array.from(new Set(gyms.map((g: any) => g.c))).sort(), [gyms]);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(DEFAULT_PRODUCTS[1]?.id ?? DEFAULT_PRODUCTS[0]?.id ?? null);
  const [selectedDuration, setSelectedDuration] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 관리자가 설정한 상품/가격/링크를 실시간 반영(없으면 기본값 폴백).
  useEffect(() => {
    const apply = (ps: Product[]) => {
      setProducts(ps);
      setSelectedProductId((cur) => (cur && ps.some((p) => p.id === cur) ? cur : ps[0]?.id ?? null));
    };
    const unsub = subscribePricing(apply, () => apply(DEFAULT_PRODUCTS));
    return () => unsub();
  }, []);

  // User Info States
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [mainGym, setMainGym] = useState<string | undefined>(undefined);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );
  const selectedPriceInfo =
    selectedProduct && selectedDuration ? selectedProduct.prices[selectedDuration as keyof typeof selectedProduct.prices] : null;

  const handleTierChange = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleDurationChange = (duration: string) => {
    setSelectedDuration(duration);
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 8) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setUserPhone(formatted);
  };

  const isFormValid = () => {
    return (
      selectedProduct &&
      selectedDuration &&
      userName.length >= 2 &&
      /^01[01679]-\d{3,4}-\d{4}$/.test(userPhone) &&
      mainGym &&
      privacyAgreed
    );
  };

  const handlePurchaseClick = async (e: React.MouseEvent) => {
    if (!selectedPriceInfo || !selectedProduct) return;

    e.preventDefault();

    // --- Validation Checks with Toasts ---
    if (!userName || userName.length < 2) {
      toast({
        variant: "destructive",
        title: "성함 입력 필요",
        description: "원활한 상담을 위해 성함을 2자 이상 입력해주세요.",
      });
      return;
    }

    const phoneRegex = /^01[01679]-\d{3,4}-\d{4}$/;
    if (!userPhone || !phoneRegex.test(userPhone)) {
      toast({
        variant: "destructive",
        title: "연락처 확인 필요",
        description: "올바른 연락처 형식을 입력해주세요 (예: 010-1234-5678).",
      });
      return;
    }

    if (!mainGym) {
      toast({
        variant: "destructive",
        title: "주 이용지점 선택 필수",
        description: "이용을 시작할 주 이용지점을 꼭 선택해주세요.",
      });
      // Scroll to main gym selector for better UX
      const gymLabel = document.getElementById('main-gym');
      if (gymLabel) gymLabel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!privacyAgreed) {
      toast({
        variant: "destructive",
        title: "동의 필요",
        description: "개인정보 수집 및 이용에 동의하셔야 결제가 가능합니다.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save info to Firestore registrations collection
      await addDoc(collection(db, "registrations"), {
        name: userName,
        phone: userPhone,
        mainGym: mainGym,
        passTier: selectedProduct.name,
        passDuration: selectedDuration,
        passPrice: selectedPriceInfo.price,
        createdAt: serverTimestamp(),
        status: 'new',
        source: 'purchase_page'
      });

      // Track Karrot Pixel
      if (window.karrotPixel) {
        window.karrotPixel.track('Purchase', {
          value: selectedPriceInfo.price,
          currency: 'KRW',
          description: `${selectedProduct.name} / ${selectedDuration}개월 / ${mainGym}`
        });
      }

      // Success toast
      toast({
        title: '정보 등록 완료',
        description: '정보가 정상적으로 등록되었습니다. 결제 페이지로 이동합니다.',
      });

      // Redirect to external payment link
      window.open(selectedPriceInfo.link, '_blank');
    } catch (error) {
      console.error("Error saving purchase info:", error);
      toast({
        variant: "destructive",
        title: '오류 발생',
        description: '정보 등록 중 문제가 발생했습니다. 다시 시도해주세요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const oneMonthPrice = selectedProduct ? selectedProduct.prices['1']?.price : null;
  const originalPrice = oneMonthPrice && selectedDuration ? oneMonthPrice * parseInt(selectedDuration, 10) : null;

  let discountRate = 0;
  if (originalPrice && selectedPriceInfo && originalPrice > selectedPriceInfo.price) {
      discountRate = Math.round(((originalPrice - selectedPriceInfo.price) / originalPrice) * 100);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" asChild className="mb-8 hover:bg-primary hover:text-primary-foreground" data-gtm-id="purchase-back-click">
            <Link href="/helbo-pass">
              <ArrowLeft className="mr-2 h-4 w-4" /> 이전 페이지로
            </Link>
          </Button>

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              헬보올패스 구매하기
            </h1>
            <p className="text-lg text-muted-foreground">
              원하는 등급과 정보를 입력하고 결제를 진행해주세요.
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. 등급 선택</CardTitle>
                <CardDescription>이용하고 싶은 패스 등급을 선택하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedProductId ?? ''}
                  onValueChange={handleTierChange}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {products.map((product, index) => {
                    const Icon = iconFor(index);
                    const isSelected = selectedProductId === product.id;

                    return (
                      <Label
                        key={product.id}
                        htmlFor={`product-${product.id}`}
                        className={cn(
                          "flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all relative",
                          isSelected ? "border-primary ring-2 ring-primary bg-primary/5" : "border-border/50 hover:bg-secondary/50"
                        )}
                        data-gtm-id={`purchase-select-tier-${product.id}-click`}
                      >
                        <Icon className="h-7 w-7 text-primary shrink-0" />
                        <span className="flex flex-col">
                          <span className="font-semibold text-base">{product.name}</span>
                          {product.description ? (
                            <span className="text-xs text-muted-foreground">{product.description}</span>
                          ) : null}
                        </span>
                        <RadioGroupItem value={product.id} id={`product-${product.id}`} className="sr-only" />
                      </Label>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. 기간 선택</CardTitle>
                <CardDescription>이용할 기간을 선택하세요. 기간이 길수록 월당 가격이 저렴해집니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedDuration ?? ''}
                  onValueChange={handleDurationChange}
                  className="grid grid-cols-3 gap-4"
                  disabled={!selectedProduct}
                >
                  {durationOptions.map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={`duration-${option.value}`}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-md border p-4 cursor-pointer transition-all h-20",
                          selectedDuration === option.value ? "border-primary ring-2 ring-primary bg-primary/5" : "border-border/50 hover:bg-secondary/50",
                          !selectedProduct && "cursor-not-allowed opacity-50"
                        )}
                        data-gtm-id={`purchase-select-duration-${option.value}-month-click`}
                      >
                        <span className="font-bold text-xl">{option.label}</span>
                        <RadioGroupItem value={option.value} id={`duration-${option.value}`} className="sr-only" />
                      </Label>
                    )
                  )}
                </RadioGroup>
                {!selectedProduct && <p className="text-center text-sm text-muted-foreground mt-4">등급을 먼저 선택해주세요.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. 사용자 정보 및 주 이용지점</CardTitle>
                <CardDescription>원활한 이용을 위해 필수 정보를 입력해주세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> 성함
                  </Label>
                  <Input
                    id="user-name"
                    placeholder="이름을 입력하세요"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> 연락처
                  </Label>
                  <Input
                    id="user-phone"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={userPhone}
                    onChange={handlePhoneChange}
                    maxLength={13}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="main-gym" id="main-gym-label" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> 주 이용지점 선택
                  </Label>
                  <Select onValueChange={setMainGym} value={mainGym}>
                    <SelectTrigger id="main-gym">
                      <SelectValue placeholder="가장 방문이 편리한 지점을 선택해주세요." />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueGyms.map((gymName) => (
                        <SelectItem key={gymName} value={gymName}>
                          {gymName.replace('헬스보이짐', '').trim()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-secondary/20">
                  <Checkbox
                    id="privacy-purchase"
                    checked={privacyAgreed}
                    onCheckedChange={(checked) => setPrivacyAgreed(checked as boolean)}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="privacy-purchase"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      [필수] 개인정보 수집·이용 동의
                    </label>
                    <div className="mt-1">
                      <PrivacyPolicyModal />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="notice" className="border-border/50 bg-secondary/30 rounded-lg">
                <AccordionTrigger className="px-4 text-base font-semibold hover:no-underline text-foreground" data-gtm-id="purchase-notice-accordion-click">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <span>구매 전 필수 확인 사항</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-3 text-muted-foreground text-sm leading-relaxed">
                  <p>• **올패스 이용권 안내:** 헬스 시설 전용 이용권이며, 선택한 등급 이하의 모든 지점을 1일 1회 이용할 수 있습니다. (PT, 필라테스 등 부가 서비스는 별도 문의)</p>
                  <p>• **온라인 구매 정책:** 본 상품은 정가 판매 상품으로, 지점별 이벤트 할인이 적용되지 않습니다. 구매 시 입력한 주 이용지점을 방문하여 지류 계약서를 작성해야 최종 활성화됩니다.</p>
                  <p>• **등급 변경 안내:** 지점 등급은 운영 상황에 따라 3개월 단위로 변경될 수 있으며, 이에 따라 이용 가능 지점이 달라질 수 있습니다. (단, 설정된 주 이용지점은 계속 이용 가능)</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Card className="bg-secondary/50 border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">최종 결제 금액</CardTitle>
                  <Button variant="link" asChild className="text-xs h-auto p-0 flex items-center gap-1.5 text-primary font-bold hover:no-underline" data-gtm-id="purchase-installment-benefit-click">
                    <a href={NOTION_INSTALLMENT_URL} target="_blank" rel="noopener noreferrer">
                      <CalendarDays className="h-3.5 w-3.5" />
                      이번 달 무이자 혜택 보기
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedPriceInfo ? (
                  <div className="text-right space-y-2">
                     {discountRate > 0 && originalPrice && (
                       <div className="text-right">
                         <span className="text-lg text-muted-foreground line-through">
                           {originalPrice.toLocaleString()}원
                         </span>
                         <Badge variant="destructive" className="ml-2">
                           <Percent className="h-4 w-4 mr-1" />
                           {discountRate}% 할인
                         </Badge>
                       </div>
                     )}
                    <div className="flex items-baseline justify-end gap-1">
                      <p className="text-3xl font-black text-primary">
                        {selectedPriceInfo.price.toLocaleString()}
                      </p>
                      <span className="text-lg font-bold text-primary">원</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">
                        {`${selectedProduct?.name ?? ''} / ${selectedDuration}개월`}
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    상품을 선택하면 결제 금액이 표시됩니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-10">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold shadow-xl"
              disabled={!selectedProduct || !selectedDuration || isSubmitting}
              onClick={handlePurchaseClick}
              data-gtm-id={`purchase-confirm-tier-${selectedProductId}-duration-${selectedDuration}-click`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  {selectedPriceInfo ? '선택한 상품 결제하기' : '상품을 선택해주세요'}
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
              {!isFormValid() && !isSubmitting && <span className="text-destructive font-semibold">* 모든 필수 정보를 입력해야 결제가 가능합니다.</span>}
              <ExternalLink className="h-3 w-3" /> 결제 버튼 클릭 시 안전한 운톡 결제 페이지로 이동합니다.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
