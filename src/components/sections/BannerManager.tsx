'use client';

import { useEffect, useState } from 'react';
import { getBanner, saveBanner, FALLBACK_BANNER, type NoticeBanner } from '@/lib/banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, AlertTriangle, Info, Save } from 'lucide-react';

// 저장된 값이 없을 때는 '현재 사이트에 표시 중인' 폴백 배너를 그대로 불러온다.
const DEFAULT: NoticeBanner = { ...FALLBACK_BANNER, link: FALLBACK_BANNER.link ?? '' };

export function BannerManager() {
  const { toast } = useToast();
  const [form, setForm] = useState<NoticeBanner>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBanner()
      .then((b) => { setForm(b ? { ...DEFAULT, ...b } : DEFAULT); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof NoticeBanner>(k: K, v: NoticeBanner[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (form.enabled && !form.text.trim()) {
      toast({ variant: 'destructive', title: '문구 필요', description: '배너를 켜려면 문구를 입력하세요.' });
      return;
    }
    setSaving(true);
    try {
      await saveBanner(form);
      toast({ title: '저장 완료', description: '상단 배너가 업데이트되었습니다.' });
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

  const isWarning = form.variant !== 'info';
  const PreviewIcon = isWarning ? AlertTriangle : Info;

  return (
    <div className="max-w-2xl space-y-6">
      {/* 미리보기 */}
      <div>
        <p className="mb-2 text-xs font-semibold text-muted-foreground">미리보기</p>
        {form.enabled && form.text.trim() ? (
          <div className={cn('rounded-md border shadow-sm', isWarning ? 'bg-yellow-500 text-black border-yellow-600' : 'bg-blue-600 text-white border-blue-700')}>
            <div className="flex items-center justify-center gap-2 px-4 py-2.5">
              <PreviewIcon className="h-5 w-5 shrink-0" />
              <p className="text-xs sm:text-sm font-bold text-center">{form.text}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            배너가 꺼져 있거나 문구가 없어 표시되지 않습니다.
          </div>
        )}
      </div>

      {/* 편집 */}
      <div className="space-y-4 rounded-xl border bg-card p-5">
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium">상단 배너 표시</span>
          <Switch checked={form.enabled} onCheckedChange={(v) => set('enabled', v)} />
        </label>

        <div className="space-y-1.5">
          <Label className="text-xs">문구</Label>
          <Textarea
            rows={2}
            value={form.text}
            onChange={(e) => set('text', e.target.value)}
            placeholder="[공지] ○○점은 ○월 ○일 폐점으로 헬보올패스 사용이 불가합니다."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">색상</Label>
            <Select value={form.variant} onValueChange={(v) => set('variant', v as NoticeBanner['variant'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="warning">노랑 (경고/폐점)</SelectItem>
                <SelectItem value="info">파랑 (일반 안내)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">클릭 링크 (선택)</Label>
            <Input value={form.link ?? ''} onChange={(e) => set('link', e.target.value)} placeholder="/branch-locator 또는 비워두기" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            저장
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        저장하면 사이트 상단 배너에 즉시 반영됩니다. 배너를 끄면 방문자에게 표시되지 않습니다.
      </p>
    </div>
  );
}
