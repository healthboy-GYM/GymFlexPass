'use client';

import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, KeyRound, Megaphone, CheckCircle, MapPin, AlertCircle, ShoppingCart, HelpCircle } from 'lucide-react';
import { RichText } from '@/components/sections/RichText';
import { subscribeFaq, DEFAULT_FAQ, type FaqData } from '@/lib/faq';

// 카테고리 아이콘은 순서에 따라 자동 배정(관리자가 신경 쓸 필요 없음).
const CATEGORY_ICONS = [Info, KeyRound, ShoppingCart, MapPin, AlertCircle, HelpCircle];
const iconFor = (index: number) => CATEGORY_ICONS[index % CATEGORY_ICONS.length];

export function FaqSection() {
  const [data, setData] = useState<FaqData>(DEFAULT_FAQ);

  useEffect(() => {
    const unsub = subscribeFaq(setData, () => setData(DEFAULT_FAQ));
    return () => unsub();
  }, []);

  const categories = data.categories.filter((c) => c.name.trim() && c.items.length > 0);
  if (categories.length === 0) return null;

  return (
    <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground">
      <div className="container px-4 md:px-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
            자주 묻는 질문
          </h2>
           <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
            헬보올패스에 대해 궁금한 모든 것을 알려드립니다.
          </p>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <Tabs defaultValue={categories[0].id} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1.5">
              {categories.map((categoryItem, index) => {
                const Icon = iconFor(index);
                return (
                    <TabsTrigger key={categoryItem.id} value={categoryItem.id} className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-col sm:flex-row gap-2 h-auto">
                        <Icon className="h-5 w-5 mb-1 sm:mb-0" /> <span className="text-center">{categoryItem.name}</span>
                    </TabsTrigger>
                )
              })}
            </TabsList>

            {categories.map((categoryItem) => (
                <TabsContent key={categoryItem.id} value={categoryItem.id} className="mt-6">
                    <Accordion type="single" collapsible className="w-full space-y-3" defaultValue={categoryItem.items[0]?.id}>
                        {categoryItem.items.map((faq) => (
                            <AccordionItem value={faq.id} key={faq.id} className="border-border/30 bg-card rounded-lg px-4 md:px-6 transition-colors data-[state=open]:bg-secondary">
                                <AccordionTrigger className="text-base md:text-lg text-left hover:no-underline text-card-foreground hover:text-primary data-[state=open]:text-primary font-semibold">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-sm md:text-base text-muted-foreground">
                                    <RichText text={faq.answer} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </TabsContent>
            ))}
          </Tabs>
        </div>

        {data.notices.length > 0 && (
          <div className="w-full max-w-4xl mx-auto mt-16">
              <Card className="bg-secondary border-l-4 border-primary shadow-lg">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                          <Megaphone className="h-6 w-6 text-primary" />
                          기타 유의사항
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-muted-foreground p-6 pt-0">
                      {data.notices.map((notice, index) => (
                          <div key={index} className="flex items-start gap-3">
                             <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                             <p>{notice}</p>
                          </div>
                      ))}
                  </CardContent>
              </Card>
          </div>
        )}
      </div>
    </section>
  );
}
