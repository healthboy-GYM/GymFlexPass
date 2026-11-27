'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, CreditCard, PenSquare, Smartphone, CheckCircle, Lightbulb, AlertCircle, ShoppingCart, UserPlus, ListChecks } from 'lucide-react';
import { subscribeGuide, DEFAULT_USAGE_GUIDE, type UsageGuideData } from '@/lib/usageGuide';

// 단계 아이콘은 순서에 따라 자동 배정.
const STEP_ICONS = [Search, CreditCard, PenSquare, UserPlus, Smartphone, ListChecks];
const iconFor = (index: number) => STEP_ICONS[index % STEP_ICONS.length];

// **굵게**만 <strong>으로 변환(HTML 이스케이프 후).
function boldHtml(s: string): string {
  const esc = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(/\*\*(.+?)\*\*/g, '<strong class="text-card-foreground font-semibold">$1</strong>');
}

export function UsageGuideContent() {
  const [data, setData] = useState<UsageGuideData>(DEFAULT_USAGE_GUIDE);

  useEffect(() => {
    const unsub = subscribeGuide(setData, () => setData(DEFAULT_USAGE_GUIDE));
    return () => unsub();
  }, []);

  return (
    <>
      <section className="space-y-8">
        {data.steps.map((item, index) => {
          const Icon = iconFor(index);
          return (
            <Card key={item.id} className="bg-card text-card-foreground border-border/50 shadow-lg overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 p-6">
                <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center shadow-md">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl md:text-2xl font-bold text-card-foreground">{index + 1}. {item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                {item.content.filter((t) => t.trim()).map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary/80 mt-1 shrink-0" />
                    <p className="text-card-foreground/90 leading-relaxed text-sm md:text-base" dangerouslySetInnerHTML={{ __html: boldHtml(text) }} />
                  </div>
                ))}
                {item.tip && (
                  <div className="mt-5 flex items-start gap-3 p-4 rounded-md bg-primary/10 border border-primary/20">
                    <Lightbulb className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-card-foreground/90"><strong className="text-primary font-semibold">Tip!</strong> {item.tip}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-16 space-y-6">
        {data.benefit.lines.filter((l) => l.trim()).length > 0 && (
          <Card className="bg-card text-card-foreground border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl"><ShoppingCart className="h-6 w-6 text-primary" />{data.benefit.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              {data.benefit.lines.filter((l) => l.trim()).map((line, i) => (
                <p key={i} className="text-card-foreground/90 leading-relaxed text-sm md:text-base" dangerouslySetInnerHTML={{ __html: boldHtml(line) }} />
              ))}
            </CardContent>
          </Card>
        )}
        {data.caution.lines.filter((l) => l.trim()).length > 0 && (
          <Card className="bg-card text-card-foreground border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl"><AlertCircle className="h-6 w-6 text-destructive" />{data.caution.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              {data.caution.lines.filter((l) => l.trim()).map((line, i) => (
                <p key={i} className="text-card-foreground/90 leading-relaxed text-sm md:text-base" dangerouslySetInnerHTML={{ __html: boldHtml(line) }} />
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );
}
