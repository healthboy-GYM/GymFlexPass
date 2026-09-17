'use client';

import { useEffect, useRef, useState } from 'react';
import gymsData from '@/data/gyms_update.json';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  type Gym,
  type GymInput,
  subscribeGyms,
  addGym,
  updateGym,
  deleteGym,
  setGymActive,
  importLegacyGyms,
} from '@/lib/gyms';
import { geocodeAddress } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Download, ExternalLink, Upload, Video, MapPin, ImageIcon, X } from 'lucide-react';

const TIERS = [
  { value: 'S-PREMIUM', label: 'S-프리미엄' },
  { value: 'PREMIUM', label: '프리미엄' },
  { value: 'GOLD', label: '골드' },
  { value: 'SILVER', label: '실버' },
  { value: 'BLACK', label: '블랙' },
];

const EMPTY_FORM: GymInput = {
  name: '', address: '', region: '', tier: 'SILVER', lat: 0, lng: 0,
  phone: '', hours: '', transport: '', description: '', naverPlaceUrl: '',
  freeParkingHours: '', is24h: false, droneVideoUrl: '', imageUrl: '', isNew: false,
  isActive: true, order: 0,
};

export function GymManager() {
  const { toast } = useToast();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GymInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgUploadPct, setImgUploadPct] = useState(0);
  const [geocoding, setGeocoding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeGyms(
      (data) => { setGyms(data); setLoading(false); },
      {
        includeInactive: true,
        onError: (e) => {
          console.error('지점 구독 오류:', e);
          toast({ variant: 'destructive', title: '불러오기 실패', description: '지점 데이터를 불러오지 못했습니다. 보안 규칙/권한을 확인하세요.' });
          setLoading(false);
        },
      }
    );
    return () => unsub();
  }, [toast]);

  const set = <K extends keyof GymInput>(key: K, value: GymInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (g: Gym) => {
    const { id, ...rest } = g;
    setEditingId(id);
    setForm({ ...EMPTY_FORM, ...rest });
    setDialogOpen(true);
  };

  const handleGeocode = async () => {
    if (!form.address.trim()) {
      toast({ variant: 'destructive', title: '주소 입력 필요', description: '주소를 먼저 입력한 뒤 좌표를 찾아주세요.' });
      return;
    }
    setGeocoding(true);
    try {
      const r = await geocodeAddress(form.address);
      if ('error' in r) {
        toast({ variant: 'destructive', title: '좌표 찾기 실패', description: r.error });
      } else {
        setForm((f) => ({ ...f, lat: r.lat, lng: r.lng }));
        toast({ title: '좌표를 찾았습니다', description: `위도 ${r.lat.toFixed(6)}, 경도 ${r.lng.toFixed(6)}` });
      }
    } finally {
      setGeocoding(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.region.trim() || !form.tier) {
      toast({ variant: 'destructive', title: '필수 항목 누락', description: '지점명·주소·지역·등급은 필수입니다.' });
      return;
    }
    if (!Number.isFinite(form.lat) || !Number.isFinite(form.lng) || (form.lat === 0 && form.lng === 0)) {
      toast({ variant: 'destructive', title: '좌표 확인', description: '지도 표시를 위해 위도(lat)·경도(lng)를 정확히 입력하세요.' });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateGym(editingId, form);
        toast({ title: '수정 완료', description: `'${form.name}' 정보가 업데이트되었습니다.` });
      } else {
        await addGym(form);
        toast({ title: '추가 완료', description: `'${form.name}' 지점이 추가되었습니다.` });
      }
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '저장 실패', description: '권한(관리자 로그인/보안 규칙)을 확인하세요.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (g: Gym) => {
    if (!confirm(`'${g.name}' 지점을 완전히 삭제할까요?\n(되돌릴 수 없습니다. 일시적으로 감추려면 '숨김'을 사용하세요.)`)) return;
    try {
      await deleteGym(g.id);
      toast({ title: '삭제됨', description: `'${g.name}' 지점이 삭제되었습니다.` });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '삭제 실패', description: '권한을 확인하세요.' });
    }
  };

  const handleToggleActive = async (g: Gym) => {
    try {
      await setGymActive(g.id, !(g.isActive !== false));
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '변경 실패', description: '권한을 확인하세요.' });
    }
  };

  const handleImport = async () => {
    if (!confirm('기존 71개 지점을 Firestore로 가져올까요? (이미 데이터가 있으면 건너뜁니다.)')) return;
    setImporting(true);
    try {
      const count = await importLegacyGyms(gymsData as any[]);
      if (count === 0) {
        toast({ title: '이미 데이터 있음', description: '지점 컬렉션에 데이터가 이미 있어 가져오기를 건너뛰었습니다.' });
      } else {
        toast({ title: '가져오기 완료', description: `${count}개 지점을 불러왔습니다.` });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '가져오기 실패', description: '관리자 권한/보안 규칙을 확인하세요.' });
    } finally {
      setImporting(false);
    }
  };

  const handleVideoUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast({ variant: 'destructive', title: '영상 파일만 가능', description: '동영상(mp4 등) 파일을 선택하세요.' });
      return;
    }
    setUploading(true);
    setUploadPct(0);
    // 공개 읽기가 허용된 assets/ 폴더에 업로드 (원본 파일명 유지)
    const task = uploadBytesResumable(storageRef(storage, `assets/${file.name}`), file);
    task.on(
      'state_changed',
      (snap) => setUploadPct(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        console.error('영상 업로드 오류:', err);
        toast({ variant: 'destructive', title: '업로드 실패', description: '권한(관리자 로그인)/네트워크를 확인하세요.' });
        setUploading(false);
      },
      () => {
        set('droneVideoUrl', file.name); // BranchLocator가 assets/ 를 자동으로 붙여 재생
        setUploading(false);
        toast({ title: '영상 업로드 완료', description: `${file.name} 이(가) 등록되었습니다.` });
      }
    );
  };

  const handleImageUpload = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: '이미지 파일만 가능', description: '사진(jpg/png 등) 파일을 선택하세요.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ variant: 'destructive', title: '파일이 너무 큼', description: '10MB 이하 이미지를 올려주세요.' });
      return;
    }
    setImgUploading(true);
    setImgUploadPct(0);
    // 공개 읽기가 허용된 assets/branch-images/ 에 업로드(파일명 충돌 방지).
    const safe = file.name.replace(/[^\w.\-가-힣]/g, '_');
    const path = `assets/branch-images/${Date.now()}-${safe}`;
    const task = uploadBytesResumable(storageRef(storage, path), file);
    task.on(
      'state_changed',
      (snap) => setImgUploadPct(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        console.error('이미지 업로드 오류:', err);
        toast({ variant: 'destructive', title: '업로드 실패', description: '권한(관리자 로그인)/네트워크를 확인하세요.' });
        setImgUploading(false);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          set('imageUrl', url); // 전체 URL 저장
          toast({ title: '사진 업로드 완료', description: '지점 대표 사진이 등록되었습니다.' });
        } catch (e) {
          console.error(e);
          toast({ variant: 'destructive', title: '주소 가져오기 실패', description: '업로드는 됐지만 URL을 못 받았습니다. 다시 시도하세요.' });
        } finally {
          setImgUploading(false);
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">지점 목록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
        <p className="text-sm text-muted-foreground">
          총 <strong className="text-foreground">{gyms.length}</strong>개 지점
          {gyms.some((g) => g.isActive === false) && ` (숨김 ${gyms.filter((g) => g.isActive === false).length})`}
        </p>
        <div className="flex gap-2">
          {gyms.length === 0 && (
            <Button size="sm" variant="outline" onClick={handleImport} disabled={importing}>
              {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              기존 71개 지점 가져오기
            </Button>
          )}
          <Button size="sm" onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> 지점 추가
          </Button>
        </div>
      </div>

      {gyms.length === 0 ? (
        <div className="rounded-md border bg-card p-10 text-center text-muted-foreground">
          아직 지점 데이터가 없습니다. <strong className="text-foreground">‘기존 71개 지점 가져오기’</strong>로 시작하거나 직접 추가하세요.
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>지점명</TableHead>
                <TableHead>지역</TableHead>
                <TableHead>등급</TableHead>
                <TableHead>좌표</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gyms.map((g) => (
                <TableRow key={g.id} className={g.isActive === false ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">
                    {g.name.replace('헬스보이짐', '').trim()}
                    {g.isActive === false && <Badge variant="outline" className="ml-2 text-[10px]">숨김</Badge>}
                    {g.isNew && <Badge className="ml-2 text-[10px] bg-primary">NEW</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{g.region}</TableCell>
                  <TableCell><Badge variant="outline">{g.tier}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{g.lat?.toFixed(4)}, {g.lng?.toFixed(4)}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" className="h-8 w-8" title={g.isActive === false ? '표시' : '숨김'} onClick={() => handleToggleActive(g)}>
                      {g.isActive === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="수정" onClick={() => openEdit(g)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" title="삭제" onClick={() => handleDelete(g)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 추가/수정 폼 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? '지점 수정' : '지점 추가'}</DialogTitle>
            <DialogDescription>필수: 지점명 · 주소 · 지역 · 등급 · 좌표</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Field label="지점명 *"><Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="헬스보이짐 서울시청점" /></Field>
            <Field label="주소 *"><Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="서울 중구 무교로 21 지하1층" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="지역 *"><Input value={form.region} onChange={(e) => set('region', e.target.value)} placeholder="서울특별시" /></Field>
              <Field label="등급 *">
                <Select value={form.tier} onValueChange={(v) => set('tier', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIERS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="flex items-end gap-2">
              <div className="grid flex-1 grid-cols-2 gap-3">
                <Field label="위도 (lat) *"><Input type="number" step="any" value={form.lat} onChange={(e) => set('lat', parseFloat(e.target.value))} /></Field>
                <Field label="경도 (lng) *"><Input type="number" step="any" value={form.lng} onChange={(e) => set('lng', parseFloat(e.target.value))} /></Field>
              </div>
              <Button type="button" variant="outline" onClick={handleGeocode} disabled={geocoding} className="shrink-0" title="주소로 좌표 자동 찾기">
                {geocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              </Button>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              위 <strong className="text-foreground">주소를 입력한 뒤 핀 버튼</strong>을 누르면 좌표가 자동 입력됩니다. 안 되면 <a href="https://map.naver.com" target="_blank" rel="noreferrer" className="underline">네이버 지도</a>에서 우클릭해 직접 입력하세요.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Field label="전화"><Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0507-1345-4222" /></Field>
              <Field label="무료주차"><Input value={form.freeParkingHours} onChange={(e) => set('freeParkingHours', e.target.value)} placeholder="2시간 / X" /></Field>
            </div>
            <Field label="운영시간"><Input value={form.hours} onChange={(e) => set('hours', e.target.value)} placeholder="평일 06:00~24:00 ..." /></Field>
            <Field label="교통편"><Input value={form.transport} onChange={(e) => set('transport', e.target.value)} placeholder="1호선 시청역 4번 출구 260m" /></Field>
            <Field label="설명"><Textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="시청역헬스장, 필라테스, PT ..." rows={2} /></Field>
            <Field label="네이버 플레이스 URL"><Input value={form.naverPlaceUrl} onChange={(e) => set('naverPlaceUrl', e.target.value)} placeholder="https://m.place.naver.com/place/..." /></Field>
            <Field label="드론 영상">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Video className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8" value={form.droneVideoUrl} onChange={(e) => set('droneVideoUrl', e.target.value)} placeholder="파일 업로드 또는 파일명 입력" />
                </div>
                <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="shrink-0">
                  {uploading ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{uploadPct}%</> : <><Upload className="mr-1.5 h-4 w-4" />업로드</>}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); e.target.value = ''; }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">동영상을 선택하면 Storage에 업로드되고 파일명이 자동 입력됩니다.</p>
            </Field>

            <Field label="지점 대표 사진">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8" value={form.imageUrl ?? ''} onChange={(e) => set('imageUrl', e.target.value)} placeholder="사진 업로드 또는 이미지 URL" />
                </div>
                <Button type="button" variant="outline" disabled={imgUploading} onClick={() => imgInputRef.current?.click()} className="shrink-0">
                  {imgUploading ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{imgUploadPct}%</> : <><Upload className="mr-1.5 h-4 w-4" />업로드</>}
                </Button>
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }}
                />
              </div>
              {form.imageUrl ? (
                <div className="relative mt-2 w-full max-w-[220px] overflow-hidden rounded-md border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="지점 대표 사진 미리보기" className="aspect-[4/3] w-full object-cover" />
                  <button type="button" onClick={() => set('imageUrl', '')} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80" title="사진 제거">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">홈 지점 사진 흐름과 지점 상세에 사용됩니다. 비우면 기본 사진(있으면)이 표시됩니다. 권장 4:3 가로.</p>
              )}
            </Field>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.is24h} onCheckedChange={(v) => set('is24h', v)} /> 24시간 운영</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.isNew} onCheckedChange={(v) => set('isNew', v)} /> 신규(NEW)</label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? '수정 저장' : '추가'}
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
