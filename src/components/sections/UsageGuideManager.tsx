'use client';

import { useEffect, useState } from 'react';
import {
  getGuide, saveGuide, emptyStep,
  type UsageGuideData, type GuideStep, type GuideCard,
} from '@/lib/usageGuide';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export function UsageGuideManager() {
  const { toast } = useToast();
  const [data, setData] = useState<UsageGuideData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getGuide().then(setData).catch(() => {}); }, []);

  const setStep = (sid: string, patch: Partial<GuideStep>) =>
    setData((d) => (d ? { ...d, steps: d.steps.map((s) => (s.id === sid ? { ...s, ...patch } : s)) } : d));

  const addStep = () => setData((d) => (d ? { ...d, steps: [...d.steps, emptyStep()] } : d));
  const removeStep = (sid: string) => setData((d) => (d ? { ...d, steps: d.steps.filter((s) => s.id !== sid) } : d));
  const moveStep = (i: number, dir: -1 | 1) => setData((d) => (d ? { ...d, steps: move(d.steps, i, dir) } : d));

  const setLine = (sid: string, li: number, v: string) =>
    setStep(sid, { content: (data?.steps.find((s) => s.id === sid)?.content ?? []).map((c, idx) => (idx === li ? v : c)) });
  const addLine = (sid: string) => {
    const cur = data?.steps.find((s) => s.id === sid)?.content ?? [];
    setStep(sid, { content: [...cur, ''] });
  };
  const removeLine = (sid: string, li: number) => {
    const cur = data?.steps.find((s) => s.id === sid)?.content ?? [];
    setStep(sid, { content: cur.filter((_, idx) => idx !== li) });
  };

  const setCard = (key: 'benefit' | 'caution', patch: Partial<GuideCard>) =>
    setData((d) => (d ? { ...d, [key]: { ...d[key], ...patch } } : d));
  const setCardLine = (key: 'benefit' | 'caution', li: number, v: string) =>
    setData((d) => (d ? { ...d, [key]: { ...d[key], lines: d[key].lines.map((l, idx) => (idx === li ? v : l)) } } : d));
  const addCardLine = (key: 'benefit' | 'caution') =>
    setData((d) => (d ? { ...d, [key]: { ...d[key], lines: [...d[key].lines, ''] } } : d));
  const removeCardLine = (key: 'benefit' | 'caution', li: number) =>
    setData((d) => (d ? { ...d, [key]: { ...d[key], lines: d[key].lines.filter((_, idx) => idx !== li) } } : d));

  const handleSave = async () => {
    if (!data) return;
    if (data.steps.length === 0) { toast({ variant: 'destructive', title: '단계 필요', description: '최소 1개 이상의 단계가 필요합니다.' }); return; }
    for (const s of data.steps) {
      if (!s.title.trim()) { toast({ variant: 'destructive', title: '단계 제목 필요', description: '제목이 빈 단계가 있습니다.' }); return; }
    }
    setSaving(true);
    try {
      // 빈 줄 정리 후 저장
      const clean: UsageGuideData = {
        steps: data.steps.map((s) => ({ ...s, content: s.content.filter((c) => c.trim()), tip: s.tip?.trim() ? s.tip : undefined })),
        benefit: { ...data.benefit, lines: data.benefit.lines.filter((l) => l.trim()) },
        caution: { ...data.caution, lines: data.caution.lines.filter((l) => l.trim()) },
      };
      await saveGuide(clean);
      toast({ title: '저장 완료', description: '이용안내 페이지가 업데이트되었습니다.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '저장 실패', description: '관리자 권한/보안 규칙을 확인하세요.' });
    } finally { setSaving(false); }
  };

  if (!data) return <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const renderCard = (key: 'benefit' | 'caution', label: string) => {
    const card = data[key];
    return (
      <div className="space-y-3 rounded-xl border bg-card p-5">
        <p className="text-sm font-semibold">{label}</p>
        <div className="space-y-1.5">
          <Label className="text-xs">카드 제목</Label>
          <Input value={card.title} onChange={(e) => setCard(key, { title: e.target.value })} />
        </div>
        {card.lines.map((l, i) => (
          <div key={i} className="flex items-start gap-2">
            <Textarea rows={2} value={l} onChange={(e) => setCardLine(key, i, e.target.value)} placeholder="문구 (**굵게** 지원)" />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" onClick={() => removeCardLine(key, i)} title="삭제"><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="border-dashed" onClick={() => addCardLine(key)}><Plus className="mr-1.5 h-3.5 w-3.5" /> 문구 추가</Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          이용 단계와 안내 카드를 편집합니다. 각 문구에 <b>**굵게**</b>를 쓸 수 있습니다. 번호·아이콘은 순서에 따라 자동 부여됩니다.
        </p>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}전체 저장
        </Button>
      </div>

      {data.steps.map((s, si) => (
        <div key={s.id} className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">{si + 1}</span>
            <Input className="font-semibold" value={s.title} onChange={(e) => setStep(s.id, { title: e.target.value })} placeholder="단계 제목" />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={si === 0} onClick={() => moveStep(si, -1)} title="위로"><ChevronUp className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={si === data.steps.length - 1} onClick={() => moveStep(si, 1)} title="아래로"><ChevronDown className="h-4 w-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" title="단계 삭제"><Trash2 className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>단계를 삭제할까요?</AlertDialogTitle>
                  <AlertDialogDescription>「{s.title || '(제목 없음)'}」 단계가 제거됩니다. <b>전체 저장</b> 시 반영됩니다.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => removeStep(s.id)}>삭제</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-2 pl-1">
            <Label className="text-xs text-muted-foreground">내용 (한 줄 = 체크 항목)</Label>
            {s.content.map((line, li) => (
              <div key={li} className="flex items-start gap-2">
                <Textarea rows={2} value={line} onChange={(e) => setLine(s.id, li, e.target.value)} placeholder="설명 문구 (**굵게** 지원)" />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" onClick={() => removeLine(s.id, li)} title="삭제"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="border-dashed" onClick={() => addLine(s.id)}><Plus className="mr-1.5 h-3.5 w-3.5" /> 내용 추가</Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tip (선택)</Label>
            <Input value={s.tip ?? ''} onChange={(e) => setStep(s.id, { tip: e.target.value })} placeholder="강조 팁 (비워두면 표시 안 함)" />
          </div>
        </div>
      ))}

      <Button variant="outline" className="w-full border-dashed" onClick={addStep}><Plus className="mr-2 h-4 w-4" /> 단계 추가</Button>

      {renderCard('benefit', '하단 카드 ① 특별 혜택')}
      {renderCard('caution', '하단 카드 ② 꼭 확인해주세요')}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}전체 저장
        </Button>
      </div>
    </div>
  );
}
