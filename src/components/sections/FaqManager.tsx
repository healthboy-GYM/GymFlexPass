'use client';

import { useEffect, useState } from 'react';
import {
  getFaq, saveFaq, emptyFaqCategory, emptyFaqItem,
  type FaqData, type FaqCategory, type FaqItem,
} from '@/lib/faq';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

function move<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const t = index + dir;
  if (t < 0 || t >= next.length) return arr;
  [next[index], next[t]] = [next[t], next[index]];
  return next;
}

export function FaqManager() {
  const { toast } = useToast();
  const [data, setData] = useState<FaqData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getFaq().then(setData).catch(() => setData({ categories: [], notices: [] })); }, []);

  const setCat = (cid: string, patch: Partial<FaqCategory>) =>
    setData((d) => (d ? { ...d, categories: d.categories.map((c) => (c.id === cid ? { ...c, ...patch } : c)) } : d));

  const setItem = (cid: string, iid: string, patch: Partial<FaqItem>) =>
    setData((d) => (d ? {
      ...d,
      categories: d.categories.map((c) => c.id === cid ? { ...c, items: c.items.map((it) => it.id === iid ? { ...it, ...patch } : it) } : c),
    } : d));

  const addCat = () => setData((d) => (d ? { ...d, categories: [...d.categories, emptyFaqCategory()] } : d));
  const removeCat = (cid: string) => setData((d) => (d ? { ...d, categories: d.categories.filter((c) => c.id !== cid) } : d));
  const moveCat = (i: number, dir: -1 | 1) => setData((d) => (d ? { ...d, categories: move(d.categories, i, dir) } : d));

  const addItem = (cid: string) =>
    setData((d) => (d ? { ...d, categories: d.categories.map((c) => c.id === cid ? { ...c, items: [...c.items, emptyFaqItem()] } : c) } : d));
  const removeItem = (cid: string, iid: string) =>
    setData((d) => (d ? { ...d, categories: d.categories.map((c) => c.id === cid ? { ...c, items: c.items.filter((it) => it.id !== iid) } : c) } : d));
  const moveItem = (cid: string, i: number, dir: -1 | 1) =>
    setData((d) => (d ? { ...d, categories: d.categories.map((c) => c.id === cid ? { ...c, items: move(c.items, i, dir) } : c) } : d));

  const setNotice = (i: number, v: string) => setData((d) => (d ? { ...d, notices: d.notices.map((n, idx) => idx === i ? v : n) } : d));
  const addNotice = () => setData((d) => (d ? { ...d, notices: [...d.notices, ''] } : d));
  const removeNotice = (i: number) => setData((d) => (d ? { ...d, notices: d.notices.filter((_, idx) => idx !== i) } : d));

  const handleSave = async () => {
    if (!data) return;
    if (data.categories.length === 0) {
      toast({ variant: 'destructive', title: '카테고리 필요', description: '최소 1개 이상의 카테고리가 필요합니다.' });
      return;
    }
    for (const c of data.categories) {
      if (!c.name.trim()) { toast({ variant: 'destructive', title: '카테고리 이름 필요', description: '이름이 빈 카테고리가 있습니다.' }); return; }
      for (const it of c.items) {
        if (!it.question.trim()) { toast({ variant: 'destructive', title: '질문 필요', description: `"${c.name}"에 질문이 빈 항목이 있습니다.` }); return; }
      }
    }
    setSaving(true);
    try {
      await saveFaq({ ...data, notices: data.notices.filter((n) => n.trim()) });
      toast({ title: '저장 완료', description: 'FAQ 페이지가 업데이트되었습니다.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '저장 실패', description: '관리자 권한/보안 규칙을 확인하세요.' });
    } finally { setSaving(false); }
  };

  if (!data) return <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          카테고리와 질문/답변을 편집합니다. 답변에는 <b>**굵게**</b>, 줄바꿈, 줄 앞 <b>- </b>(목록)을 쓸 수 있습니다.
        </p>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}전체 저장
        </Button>
      </div>

      {data.categories.map((c, ci) => (
        <div key={c.id} className="space-y-4 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <Input className="font-semibold" value={c.name} onChange={(e) => setCat(c.id, { name: e.target.value })} placeholder="카테고리 이름 (예: 이용 방법)" />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={ci === 0} onClick={() => moveCat(ci, -1)} title="위로"><ChevronUp className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={ci === data.categories.length - 1} onClick={() => moveCat(ci, 1)} title="아래로"><ChevronDown className="h-4 w-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" title="카테고리 삭제"><Trash2 className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>카테고리를 삭제할까요?</AlertDialogTitle>
                  <AlertDialogDescription>「{c.name || '(이름 없음)'}」와 그 안의 모든 질문이 제거됩니다. <b>전체 저장</b> 시 반영됩니다.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => removeCat(c.id)}>삭제</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-3 pl-1">
            {c.items.map((it, ii) => (
              <div key={it.id} className="space-y-2 rounded-lg border bg-background/50 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">질문 {ii + 1}</span>
                  <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={ii === 0} onClick={() => moveItem(c.id, ii, -1)} title="위로"><ChevronUp className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={ii === c.items.length - 1} onClick={() => moveItem(c.id, ii, 1)} title="아래로"><ChevronDown className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeItem(c.id, it.id)} title="질문 삭제"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <Input value={it.question} onChange={(e) => setItem(c.id, it.id, { question: e.target.value })} placeholder="질문 (예: Q. 출입은 어떻게 하나요?)" />
                <Textarea rows={3} value={it.answer} onChange={(e) => setItem(c.id, it.id, { answer: e.target.value })} placeholder="답변 (마크다운: **굵게**, 줄바꿈, - 목록)" />
              </div>
            ))}
            <Button variant="outline" size="sm" className="border-dashed" onClick={() => addItem(c.id)}><Plus className="mr-1.5 h-3.5 w-3.5" /> 질문 추가</Button>
          </div>
        </div>
      ))}

      <Button variant="outline" className="w-full border-dashed" onClick={addCat}><Plus className="mr-2 h-4 w-4" /> 카테고리 추가</Button>

      {/* 기타 유의사항 */}
      <div className="space-y-3 rounded-xl border bg-card p-5">
        <p className="text-sm font-semibold">기타 유의사항</p>
        {data.notices.map((n, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={n} onChange={(e) => setNotice(i, e.target.value)} placeholder="유의사항 문구" />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" onClick={() => removeNotice(i)} title="삭제"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="border-dashed" onClick={addNotice}><Plus className="mr-1.5 h-3.5 w-3.5" /> 유의사항 추가</Button>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}전체 저장
        </Button>
      </div>
    </div>
  );
}
