'use client';

import { useEffect, useState } from 'react';
import {
  getPopups, savePopups, emptyCustomPopup, emptyWinnerRow,
  DEFAULT_BODY_CHALLENGE, DEFAULT_EVENT_WINNER, FREQUENCY_LABELS,
  type PopupItem, type PopupFrequency, type WinnerRow,
  type CustomPopup, type BodyChallengeItem, type EventWinnerItem,
} from '@/lib/popups';
import { BodyChallengePopup } from '@/components/sections/BodyChallengePopup';
import { EventWinnerPopup } from '@/components/sections/EventWinnerPopup';
import { CustomPopupDialog } from '@/components/sections/CustomPopupDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Plus, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react';

const FREQUENCIES: PopupFrequency[] = ['always', 'daily', 'once'];

const KIND_LABEL: Record<PopupItem['kind'], string> = {
  bodyChallenge: '바디챌린지 팝업',
  eventWinner: '당첨자 안내 팝업',
  custom: '커스텀 팝업',
};

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const t = i + dir;
  if (t < 0 || t >= next.length) return arr;
  [next[i], next[t]] = [next[t], next[i]];
  return next;
}

export function PopupManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<PopupItem[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<PopupItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => { getPopups().then(setItems).catch(() => setItems([])); }, []);

  const patch = (id: string, p: Partial<PopupItem>) =>
    setItems((its) => (its ? its.map((it) => (it.id === id ? ({ ...it, ...p } as PopupItem) : it)) : its));

  const removeItem = (id: string) => setItems((its) => (its ? its.filter((it) => it.id !== id) : its));
  const moveItem = (i: number, dir: -1 | 1) => setItems((its) => (its ? move(its, i, dir) : its));
  const addCustom = () => setItems((its) => (its ? [...its, emptyCustomPopup()] : its));
  const restore = (kind: 'bodyChallenge' | 'eventWinner') =>
    setItems((its) => (its ? [...its, kind === 'bodyChallenge' ? { ...DEFAULT_BODY_CHALLENGE } : { ...DEFAULT_EVENT_WINNER }] : its));

  const openPreview = (it: PopupItem) => { setPreview(it); setPreviewOpen(true); };

  const handleSave = async () => {
    if (!items) return;
    for (const it of items) {
      if (it.kind === 'custom') {
        if (it.enabled && !it.title.trim()) { toast({ variant: 'destructive', title: '제목 필요', description: '켜져 있는 커스텀 팝업에는 제목이 필요합니다.' }); return; }
        if (it.buttonLink?.trim() && !/^https?:\/\//.test(it.buttonLink.trim())) { toast({ variant: 'destructive', title: '링크 오류', description: '버튼 링크는 http(s)://로 시작해야 합니다.' }); return; }
        if (it.imageUrl?.trim() && !/^https?:\/\//.test(it.imageUrl.trim())) { toast({ variant: 'destructive', title: '이미지 URL 오류', description: '이미지 주소는 http(s)://로 시작해야 합니다.' }); return; }
      }
      if (it.kind === 'bodyChallenge') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(it.deadline)) { toast({ variant: 'destructive', title: '마감일 형식', description: '바디챌린지 접수 마감일은 날짜(YYYY-MM-DD)여야 합니다.' }); return; }
        if (!/^https?:\/\//.test(it.applyUrl.trim())) { toast({ variant: 'destructive', title: '링크 오류', description: '바디챌린지 신청 링크는 http(s)://로 시작해야 합니다.' }); return; }
      }
    }
    setSaving(true);
    try {
      await savePopups(items);
      toast({ title: '저장 완료', description: '홈 팝업 설정이 업데이트되었습니다.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '저장 실패', description: '관리자 권한/보안 규칙을 확인하세요.' });
    } finally { setSaving(false); }
  };

  if (!items) return <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const hasBody = items.some((i) => i.kind === 'bodyChallenge');
  const hasWinner = items.some((i) => i.kind === 'eventWinner');

  // 당첨자 목록(스탬프/랭킹) 편집 헬퍼
  const setWinners = (id: string, key: 'stampWinners' | 'rankingWinners', rows: WinnerRow[]) =>
    patch(id, { [key]: rows.map((r, i) => ({ ...r, rank: i + 1 })) } as Partial<PopupItem>);

  const renderWinnerTable = (it: EventWinnerItem, key: 'stampWinners' | 'rankingWinners', label: string) => {
    const rows = it[key];
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold">{label}</p>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 text-center text-xs text-muted-foreground">{i + 1}</span>
            <Input className="w-24" value={r.name} placeholder="이름(조*린)" onChange={(e) => setWinners(it.id, key, rows.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x))} />
            <Input className="w-20" value={r.phone} placeholder="뒷번호" onChange={(e) => setWinners(it.id, key, rows.map((x, xi) => xi === i ? { ...x, phone: e.target.value } : x))} />
            <Input className="flex-1" value={r.prize} placeholder="경품" onChange={(e) => setWinners(it.id, key, rows.map((x, xi) => xi === i ? { ...x, prize: e.target.value } : x))} />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" onClick={() => setWinners(it.id, key, rows.filter((_, xi) => xi !== i))} title="행 삭제"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="border-dashed" onClick={() => setWinners(it.id, key, [...rows, emptyWinnerRow(rows.length + 1)])}><Plus className="mr-1.5 h-3.5 w-3.5" /> 당첨자 추가</Button>
      </div>
    );
  };

  const renderFields = (it: PopupItem) => {
    if (it.kind === 'bodyChallenge') {
      const b = it as BodyChallengeItem;
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label className="text-xs">기수</Label><Input value={b.edition} onChange={(e) => patch(it.id, { edition: e.target.value } as Partial<PopupItem>)} placeholder="예: 35기" /></div>
          <div className="space-y-1.5"><Label className="text-xs">부제</Label><Input value={b.subtitle} onChange={(e) => patch(it.id, { subtitle: e.target.value } as Partial<PopupItem>)} placeholder="예: 10주간의 놀라운 변화" /></div>
          <div className="space-y-1.5"><Label className="text-xs">대상 상금</Label><Input value={b.prize} onChange={(e) => patch(it.id, { prize: e.target.value } as Partial<PopupItem>)} placeholder="예: 1,000만원" /></div>
          <div className="space-y-1.5"><Label className="text-xs">접수 마감일</Label><Input type="date" value={b.deadline} onChange={(e) => patch(it.id, { deadline: e.target.value } as Partial<PopupItem>)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">신청 링크</Label><Input value={b.applyUrl} onChange={(e) => patch(it.id, { applyUrl: e.target.value } as Partial<PopupItem>)} placeholder="https://..." /></div>
          <div className="space-y-1.5"><Label className="text-xs">헤더 이미지 URL</Label><Input value={b.imageUrl ?? ''} onChange={(e) => patch(it.id, { imageUrl: e.target.value } as Partial<PopupItem>)} placeholder="https://.../image.png" /></div>
          <p className="sm:col-span-2 text-[11px] text-muted-foreground">※ 스탯·전체 일정·부문 시상 등 세부 디자인은 고정입니다. 마감일이 지나면 자동으로 노출되지 않습니다.</p>
        </div>
      );
    }
    if (it.kind === 'eventWinner') {
      const e = it as EventWinnerItem;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs">제목</Label><Input value={e.title} onChange={(ev) => patch(it.id, { title: ev.target.value } as Partial<PopupItem>)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">부제</Label><Input value={e.subtitle ?? ''} onChange={(ev) => patch(it.id, { subtitle: ev.target.value } as Partial<PopupItem>)} /></div>
          </div>
          {renderWinnerTable(e, 'stampWinners', '스탬프 응모권 당첨자')}
          {renderWinnerTable(e, 'rankingWinners', '랭킹 미션 당첨자')}
        </div>
      );
    }
    const c = it as CustomPopup;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label className="text-xs">제목</Label><Input value={c.title} onChange={(ev) => patch(it.id, { title: ev.target.value } as Partial<PopupItem>)} placeholder="예: 여름 특가 이벤트" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs">노출 빈도</Label>
            <Select value={c.frequency} onValueChange={(v) => patch(it.id, { frequency: v as PopupFrequency } as Partial<PopupItem>)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{FREQUENCY_LABELS[f]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5"><Label className="text-xs">설명 문구 (선택)</Label><Textarea rows={2} value={c.description ?? ''} onChange={(ev) => patch(it.id, { description: ev.target.value } as Partial<PopupItem>)} placeholder="팝업 본문 내용" /></div>
        <div className="space-y-1.5"><Label className="text-xs">이미지 URL (선택)</Label><Input value={c.imageUrl ?? ''} onChange={(ev) => patch(it.id, { imageUrl: ev.target.value } as Partial<PopupItem>)} placeholder="https://.../image.png" /></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label className="text-xs">버튼 문구 (선택)</Label><Input value={c.buttonText ?? ''} onChange={(ev) => patch(it.id, { buttonText: ev.target.value } as Partial<PopupItem>)} placeholder="예: 자세히 보기" /></div>
          <div className="space-y-1.5"><Label className="text-xs">버튼 링크 (선택)</Label><Input value={c.buttonLink ?? ''} onChange={(ev) => patch(it.id, { buttonLink: ev.target.value } as Partial<PopupItem>)} placeholder="https://..." /></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          홈 팝업을 관리합니다. 여러 개가 켜져 있으면 <b>목록 위쪽부터 하나만</b> 노출됩니다. 모든 팝업은 켜기/끄기·순서·<b>수정·삭제</b>가 됩니다.
        </p>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}전체 저장
        </Button>
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">등록된 팝업이 없습니다. 아래에서 추가하세요.</div>
      )}

      {items.map((it, index) => (
        <div key={it.id} className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Switch checked={it.enabled} onCheckedChange={(v) => patch(it.id, { enabled: v } as Partial<PopupItem>)} />
              <span className="text-sm font-medium">{it.enabled ? '켜짐' : '꺼짐'}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{KIND_LABEL[it.kind]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPreview(it)} title="미리보기"><Eye className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => moveItem(index, -1)} title="위로"><ChevronUp className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === items.length - 1} onClick={() => moveItem(index, 1)} title="아래로"><ChevronDown className="h-4 w-4" /></Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="삭제"><Trash2 className="h-4 w-4" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>팝업을 삭제할까요?</AlertDialogTitle>
                    <AlertDialogDescription>「{KIND_LABEL[it.kind]}」이(가) 목록에서 제거됩니다. <b>전체 저장</b>을 눌러야 실제로 반영됩니다.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeItem(it.id)}>삭제</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          {renderFields(it)}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="border-dashed" onClick={addCustom}><Plus className="mr-2 h-4 w-4" /> 커스텀 팝업 추가</Button>
        {!hasBody && <Button variant="outline" className="border-dashed" onClick={() => restore('bodyChallenge')}><Plus className="mr-2 h-4 w-4" /> 바디챌린지 팝업 복원</Button>}
        {!hasWinner && <Button variant="outline" className="border-dashed" onClick={() => restore('eventWinner')}><Plus className="mr-2 h-4 w-4" /> 당첨자 팝업 복원</Button>}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}전체 저장
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">버튼 링크·이미지 주소는 http(s)://로 시작해야 합니다. 목록 위쪽이 우선순위가 높습니다.</p>

      {/* 미리보기 */}
      {preview?.kind === 'bodyChallenge' && (
        <BodyChallengePopup isOpen={previewOpen} onOpenChange={setPreviewOpen} onDontShowToday={() => setPreviewOpen(false)}
          edition={preview.edition} subtitle={preview.subtitle} prize={preview.prize} deadline={preview.deadline} applyUrl={preview.applyUrl} imageUrl={preview.imageUrl} />
      )}
      {preview?.kind === 'eventWinner' && (
        <EventWinnerPopup isOpen={previewOpen} onClose={() => setPreviewOpen(false)}
          title={preview.title} subtitle={preview.subtitle} stampWinners={preview.stampWinners} rankingWinners={preview.rankingWinners} />
      )}
      {preview?.kind === 'custom' && (
        <CustomPopupDialog popup={preview} isOpen={previewOpen} onOpenChange={setPreviewOpen} onDismiss={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
