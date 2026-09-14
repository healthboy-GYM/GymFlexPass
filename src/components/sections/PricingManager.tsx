'use client';

import { useEffect, useState } from 'react';
import {
  getPricing,
  savePricing,
  emptyPriceMap,
  newProductId,
  DURATIONS,
  DURATION_LABELS,
  type Product,
  type Duration,
} from '@/lib/pricing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Save, Plus, Trash2, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';

export function PricingManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPricing()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateProduct = (id: string, patch: Partial<Product>) =>
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const updatePrice = (id: string, dur: Duration, field: 'price' | 'link', value: string) =>
    setProducts((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        const nextEntry =
          field === 'price'
            ? { ...p.prices[dur], price: Number(value.replace(/[^\d]/g, '')) || 0 }
            : { ...p.prices[dur], link: value };
        return { ...p, prices: { ...p.prices, [dur]: nextEntry } };
      })
    );

  const addProduct = () => {
    setProducts((ps) => [
      ...ps,
      { id: newProductId(), name: '', description: '', prices: emptyPriceMap() },
    ]);
    toast({ title: '상품 추가됨', description: '새 상품 정보를 입력한 뒤 저장하세요.' });
  };

  const removeProduct = (id: string) => setProducts((ps) => ps.filter((p) => p.id !== id));

  const moveProduct = (index: number, dir: -1 | 1) => {
    setProducts((ps) => {
      const next = [...ps];
      const target = index + dir;
      if (target < 0 || target >= next.length) return ps;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    if (products.length === 0) {
      toast({ variant: 'destructive', title: '상품 없음', description: '최소 1개 이상의 상품이 필요합니다.' });
      return;
    }
    for (const p of products) {
      if (!p.name.trim()) {
        toast({ variant: 'destructive', title: '상품명 필요', description: '이름이 비어 있는 상품이 있습니다.' });
        return;
      }
      for (const d of DURATIONS) {
        const { price, link } = p.prices[d];
        if (!Number.isFinite(price) || price < 0) {
          toast({ variant: 'destructive', title: '가격 오류', description: `${p.name} ${DURATION_LABELS[d]} 가격을 확인하세요.` });
          return;
        }
        if (!/^https?:\/\//.test(link.trim())) {
          toast({ variant: 'destructive', title: '링크 오류', description: `${p.name} ${DURATION_LABELS[d]} 결제 링크는 http(s)://로 시작해야 합니다.` });
          return;
        }
      }
    }
    setSaving(true);
    try {
      await savePricing(products);
      toast({ title: '저장 완료', description: '구매 페이지 상품·가격이 업데이트되었습니다.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '저장 실패', description: '관리자 권한/보안 규칙을 확인하세요.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          상품을 <b>추가·삭제·수정</b>하고, 상품별 <b>이름·설명·기간별 가격·결제 링크</b>를 편집합니다. 저장하면 구매 페이지에 즉시 반영됩니다.
        </p>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          전체 저장
        </Button>
      </div>

      <div className="space-y-5">
        {products.map((p, index) => (
          <div key={p.id} className="rounded-xl border bg-card p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="mt-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => moveProduct(index, -1)} title="위로">
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === products.length - 1} onClick={() => moveProduct(index, 1)} title="아래로">
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="상품 삭제">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>상품을 삭제할까요?</AlertDialogTitle>
                      <AlertDialogDescription>
                        「{p.name || '(이름 없음)'}」 상품이 목록에서 제거됩니다. <b>전체 저장</b>을 눌러야 실제로 반영됩니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeProduct(p.id)}>삭제</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">상품명</Label>
                <Input
                  value={p.name}
                  onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                  placeholder="예: 프리미엄 올패스"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">설명 문구 (선택)</Label>
                <Textarea
                  rows={1}
                  value={p.description ?? ''}
                  onChange={(e) => updateProduct(p.id, { description: e.target.value })}
                  placeholder="예: 전 지점 이용 가능"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {DURATIONS.map((dur) => (
                <div key={dur} className="space-y-2 rounded-lg border bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{DURATION_LABELS[dur]}</span>
                    {/^https?:\/\//.test(p.prices[dur].link) && (
                      <a
                        href={p.prices[dur].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                        title="현재 링크 열어보기"
                      >
                        링크 열기 <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">가격(원)</Label>
                    <Input
                      inputMode="numeric"
                      value={p.prices[dur].price.toLocaleString()}
                      onChange={(e) => updatePrice(p.id, dur, 'price', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">결제 링크</Label>
                    <Input
                      value={p.prices[dur].link}
                      onChange={(e) => updatePrice(p.id, dur, 'link', e.target.value)}
                      placeholder="https://bmarket.broj.co.kr/products/..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full border-dashed" onClick={addProduct}>
        <Plus className="mr-2 h-4 w-4" /> 상품 추가
      </Button>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          전체 저장
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        기간(1·3·6개월)은 고정입니다. 결제 링크는 반드시 운톡 상품 주소(http/https)여야 하며, 저장 시 형식을 검사합니다.
        모든 상품을 삭제하면 저장할 수 없습니다(최소 1개 필요).
      </p>
    </div>
  );
}
