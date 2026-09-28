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
import { PromoLandingView } from '@/components/sections/PromoLandingView';
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Upload, ExternalLink, X } from 'lucide-react';

const BUCKET = 'gymflex-pass-fgz47.firebasestorage.app';
const publicAssetUrl = (filename: string) =>
  `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/assets%2F${encodeURIComponent(filename)}?alt=media`;

const EMPTY_FORM: EventInput = {
  slug: '', title: '', subtitle: '', imageUrl: '', startDate: '', endDate: '',
  highlightText: '', body: '', ctaText: '자세히 보기', ctaLink: '', isActive: true, order: 0,
  originalPrice: undefined, salePrice: undefined, priceCaption: '', badges: '', benefits: '', conditions: '',
  noticeBoxTitle: '', noticeBoxBody: '',
};

// 신규 이벤트 생성 시 기본으로 채워지는 표준 유의사항(수정 가능).
const STD_NOTICE = {
  noticeBoxTitle: '이용 가능 등급 안내',
  noticeBoxBody:
    "본 상품은 '프리미엄' 등급권으로, 헬스보이짐의 프리미엄, 골드, 실버, 블랙 등급의 모든 지점을 이용할 수 있습니다. 단, 'S-프리미엄' 등급 지점(신촌점, 가락점, 전주송천점 등)은 이용이 제한됩니다.",
  conditions: [
    '본 상품은 헬보올패스 최초 구매 회원 및 기존 회원 모두 1인 1회에 한해 구매 가능합니다.',
    '온라인 결제 완료 후, 선택하신 주 이용지점에 방문하여 지류 계약서를 작성해야 최종 활성화됩니다.',
    '타 이벤트 및 지점 자체 할인 혜택과 중복 적용되지 않습니다.',
    '구매한 이용권의 양도 및 연기는 불가능합니다.',
  ].join('\n'),
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
  const [showPreview, setShowPreview] = useState(false);
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

  const openAdd = () => { setIsEditing(false); setOriginalSlug(''); setForm({ ...EMPTY_FORM, ...STD_NOTICE }); setSlugTouched(false); setDialogOpen(true); };
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

            {/* 할인(가격) 이벤트용 선택 항목 */}
            <details className="rounded-lg border bg-muted/30 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">
                💰 할인 이벤트 옵션 (선택) — 가격·혜택·조건
              </summary>
              <p className="mt-2 mb-3 text-xs text-muted-foreground">
                아래를 채우면 이벤트 페이지가 <strong>정가→할인가·할인율·혜택 카드·조건 체크리스트</strong> 형태로 표시됩니다. 비워두면 일반형(본문 위주)으로 나옵니다.
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="정가(원)">
                    <Input type="number" inputMode="numeric" value={form.originalPrice ?? ''}
                      onChange={(e) => set('originalPrice', e.target.value === '' ? undefined : Number(e.target.value))} placeholder="152000" />
                  </Field>
                  <Field label="이벤트가(원)">
                    <Input type="number" inputMode="numeric" value={form.salePrice ?? ''}
                      onChange={(e) => set('salePrice', e.target.value === '' ? undefined : Number(e.target.value))} placeholder="49000" />
                  </Field>
                </div>
                {form.originalPrice && form.salePrice && form.originalPrice > form.salePrice && (
                  <p className="text-xs text-primary font-semibold">
                    할인율 {Math.round((1 - form.salePrice / form.originalPrice) * 100)}% 자동 표시됩니다.
                  </p>
                )}
                <Field label="가격 아래 설명 (선택)">
                  <Input value={form.priceCaption} onChange={(e) => set('priceCaption', e.target.value)} placeholder="프리미엄 올패스 1개월권" />
                </Field>
                <Field label="상단 배지 (쉼표 또는 줄바꿈으로 구분)">
                  <Input value={form.badges} onChange={(e) => set('badges', e.target.value)} placeholder="신규 한정, 선착순 300, 1인 1회" />
                </Field>
                <Field label="혜택 카드 (한 줄에 하나, '제목 | 설명')">
                  <Textarea rows={3} value={form.benefits} onChange={(e) => set('benefits', e.target.value)}
                    placeholder={'전국 프리미엄급 지점 | S-프리미엄 제외 전국 대부분 이용\n어디서나 언제나 | 내 동선이 곧 헬스장\n프리미엄 시설 | 수입 웨이트·부대시설'} />
                </Field>

                <div className="pt-1 border-t border-border/50">
                  <p className="pt-3 text-xs font-semibold text-foreground">유의사항 및 안내</p>
                  <p className="mb-2 text-[11px] text-muted-foreground">신규 이벤트에는 표준 문구가 자동 입력됩니다. 필요에 맞게 수정하세요.</p>
                </div>
                <Field label="안내 박스 제목">
                  <Input value={form.noticeBoxTitle} onChange={(e) => set('noticeBoxTitle', e.target.value)} placeholder="이용 가능 등급 안내" />
                </Field>
                <Field label="안내 박스 본문">
                  <Textarea rows={3} value={form.noticeBoxBody} onChange={(e) => set('noticeBoxBody', e.target.value)}
                    placeholder="본 상품은 '프리미엄' 등급권으로, ... 'S-프리미엄' 지점은 이용이 제한됩니다." />
                </Field>
                <Field label="유의사항 불릿 (한 줄에 하나)">
                  <Textarea rows={4} value={form.conditions} onChange={(e) => set('conditions', e.target.value)}
                    placeholder={'1인 1회에 한해 구매 가능합니다.\n결제 후 주 이용지점에서 지류 계약서 작성 시 활성화됩니다.\n타 이벤트/지점 할인과 중복 적용되지 않습니다.\n양도 및 연기는 불가능합니다.'} />
                </Field>
              </div>
            </details>

            <label className="flex items-center gap-2 text-sm pt-1"><Switch checked={form.isActive !== false} onCheckedChange={(v) => set('isActive', v)} /> 공개(게시)</label>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button variant="secondary" type="button" onClick={() => setShowPreview(true)}>
              <Eye className="mr-2 h-4 w-4" /> 미리보기
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? '수정 저장' : '만들기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 이벤트 랜딩 미리보기 (실제 /promo 페이지와 동일 레이아웃) */}
      {showPreview && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-background">
          <div className="flex items-center justify-between border-b bg-card px-4 py-2.5">
            <span className="text-sm font-semibold">이벤트 미리보기 <span className="text-muted-foreground font-normal">— 저장 전 화면입니다</span></span>
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
              <X className="mr-1.5 h-4 w-4" /> 닫기
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PromoLandingView event={{ ...form, slug: form.slug || 'preview', isActive: true }} preview />
          </div>
        </div>
      )}
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
