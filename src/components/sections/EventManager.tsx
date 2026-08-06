'use client';

import { useEffect, useRef, useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import {
  type EventDoc,
  type EventInput,
  subscribeEvents,
  saveEvent,
  deleteEvent,
  setEventActive,
  toSlug,
} from '@/lib/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Upload, ExternalLink } from 'lucide-react';

const BUCKET = 'gymflex-pass-fgz47.firebasestorage.app';
const publicAssetUrl = (filename: string) =>
  `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/assets%2F${encodeURIComponent(filename)}?alt=media`;

const EMPTY_FORM: EventInput = {
  slug: '', title: '', subtitle: '', imageUrl: '', startDate: '', endDate: '',
  highlightText: '', body: '', ctaText: '자세히 보기', ctaLink: '', isActive: true, order: 0,
};

export function EventManager() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalSlug, setOriginalSlug] = useState<string>('');
  const [form, setForm] = useState<EventInput>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeEvents(
      (data) => { setEvents(data); setLoading(false); },
      {
        includeInactive: true,
        onError: (e) => {
          console.error('이벤트 구독 오류:', e);
          toast({ variant: 'destructive', title: '불러오기 실패', description: '보안 규칙/권한을 확인하세요.' });
          setLoading(false);
        },
      }
    );
    return () => unsub();
  }, [toast]);

  const set = <K extends keyof EventInput>(key: K, value: EventInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : toSlug(title) }));
  };

  const openAdd = () => { setIsEditing(false); setOriginalSlug(''); setForm(EMPTY_FORM); setSlugTouched(false); setDialogOpen(true); };
  const openEdit = (e: EventDoc) => {
    setIsEditing(true);
    setOriginalSlug(e.slug);
    setForm({ ...EMPTY_FORM, ...e });
    setSlugTouched(true);
    setDialogOpen(true);
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: '이미지만 가능', description: '이미지 파일(jpg/png 등)을 선택하세요.' });
      return;
    }
    setUploading(true);
    setUploadPct(0);
    const task = uploadBytesResumable(storageRef(storage, `assets/${file.name}`), file);
    task.on(
      'state_changed',
      (snap) => setUploadPct(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        console.error('이미지 업로드 오류:', err);
        toast({ variant: 'destructive', title: '업로드 실패', description: '권한(관리자 로그인)/네트워크를 확인하세요.' });
        setUploading(false);
      },
      () => {
        set('imageUrl', publicAssetUrl(file.name));
        setUploading(false);
        toast({ title: '이미지 업로드 완료', description: file.name });
      }
    );
  };

  const handleSave = async () => {
    const slug = toSlug(form.slug || form.title);
    if (!form.title.trim() || !slug) {
      toast({ variant: 'destructive', title: '필수 항목', description: '제목과 슬러그(URL)는 필수입니다.' });
      return;
    }
    // 슬러그 중복 검사 (다른 이벤트와 겹치면 안 됨)
    if (events.some((e) => e.slug === slug && e.slug !== originalSlug)) {
      toast({ variant: 'destructive', title: '슬러그 중복', description: `'${slug}'는 이미 사용 중입니다. 다른 값으로 변경하세요.` });
      return;
    }
    setSaving(true);
    try {
      // 편집 중 슬러그가 바뀌면 기존 문서 삭제 후 새로 저장(문서 ID = 슬러그)
      if (isEditing && originalSlug && originalSlug !== slug) {
        await deleteEvent(originalSlug);
      }
      await saveEvent({ ...form, slug });
      toast({ title: isEditing ? '수정 완료' : '이벤트 생성', description: `/promo/${slug}` });
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '저장 실패', description: '관리자 권한/보안 규칙을 확인하세요.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: EventDoc) => {
    if (!confirm(`'${e.title}' 이벤트를 완전히 삭제할까요? (되돌릴 수 없습니다)`)) return;
    try {
      await deleteEvent(e.slug);
      toast({ title: '삭제됨', description: e.title });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: '삭제 실패', description: '권한을 확인하세요.' });
    }
  };

  const handleToggle = async (e: EventDoc) => {
    try {
      await setEventActive(e.slug, !(e.isActive !== false));
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: '변경 실패', description: '권한을 확인하세요.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">이벤트 목록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">총 <strong className="text-foreground">{events.length}</strong>개 이벤트</p>
        <Button size="sm" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> 이벤트 만들기</Button>
      </div>

      {events.length === 0 ? (
        <div className="rounded-md border bg-card p-10 text-center text-muted-foreground">
          아직 이벤트가 없습니다. <strong className="text-foreground">‘이벤트 만들기’</strong>로 첫 이벤트 페이지를 생성하세요.
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>주소(URL)</TableHead>
                <TableHead>기간</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.slug} className={e.isActive === false ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">
                    {e.title}
                    {e.isActive === false && <Badge variant="outline" className="ml-2 text-[10px]">숨김</Badge>}
                  </TableCell>
                  <TableCell className="text-xs">
                    <a href={`/promo/${e.slug}`} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      /promo/{e.slug} <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.startDate || '-'} ~ {e.endDate || '-'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" className="h-8 w-8" title={e.isActive === false ? '공개' : '숨김'} onClick={() => handleToggle(e)}>
                      {e.isActive === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="수정" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" title="삭제" onClick={() => handleDelete(e)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 생성/수정 폼 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? '이벤트 수정' : '이벤트 만들기'}</DialogTitle>
            <DialogDescription>필수: 제목 · 주소(URL 슬러그)</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Field label="제목 *"><Input value={form.title} onChange={(e) => onTitleChange(e.target.value)} placeholder="여름 특별 이벤트" /></Field>
            <Field label="주소(URL 슬러그) *">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">/promo/</span>
                <Input value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', toSlug(e.target.value)); }} placeholder="summer-2026" />
              </div>
            </Field>
            <Field label="부제 (한 줄 설명)"><Input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="이번 여름, 헬보올패스로 시작하세요" /></Field>

            <Field label="히어로 이미지">
              <div className="flex gap-2">
                <Input className="flex-1" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} placeholder="이미지 업로드 또는 URL" />
                <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="shrink-0">
                  {uploading ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{uploadPct}%</> : <><Upload className="mr-1.5 h-4 w-4" />업로드</>}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
              </div>
              {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 h-28 w-full rounded-md object-cover border" />}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="시작일"><Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} /></Field>
              <Field label="종료일"><Input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} /></Field>
            </div>
            <Field label="강조 배지 (선택)"><Input value={form.highlightText} onChange={(e) => set('highlightText', e.target.value)} placeholder="최대 50% 할인" /></Field>
            <Field label="본문 내용"><Textarea rows={5} value={form.body} onChange={(e) => set('body', e.target.value)} placeholder="이벤트 상세 내용을 입력하세요. 줄바꿈은 그대로 표시됩니다." /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="버튼 텍스트"><Input value={form.ctaText} onChange={(e) => set('ctaText', e.target.value)} placeholder="지금 신청하기" /></Field>
              <Field label="버튼 링크"><Input value={form.ctaLink} onChange={(e) => set('ctaLink', e.target.value)} placeholder="/purchase 또는 https://..." /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm pt-1"><Switch checked={form.isActive !== false} onCheckedChange={(v) => set('isActive', v)} /> 공개(게시)</label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? '수정 저장' : '만들기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
