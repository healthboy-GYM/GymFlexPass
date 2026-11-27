'use client';

import { useMemo, useState } from 'react';
import { db, Timestamp } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, Search, Loader2, X, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export type RegStatus = 'new' | 'processed' | 'cancelled';

export interface Registration {
  id: string;
  name: string;
  phone: string;
  mainGym: string;
  passTier?: string;
  passDuration?: string;
  passPrice?: number;
  createdAt: Timestamp;
  status: RegStatus;
  source?: string;
}

export const REG_STATUS_LABEL: Record<RegStatus, string> = { new: '신규', processed: '처리완료', cancelled: '취소' };
const REG_STATUS_COLOR: Record<RegStatus, string> = { new: 'bg-blue-500', processed: 'bg-green-500', cancelled: 'bg-gray-500' };

type StatusFilter = 'all' | RegStatus | 'dup';
type PeriodFilter = 'all' | 'today' | '7d' | '30d';

/** 연락처 정규화(숫자만) — 중복 판별 기준. */
export const normPhone = (p: string) => (p || '').replace(/[^\d]/g, '');
const PERIOD_LABEL: Record<PeriodFilter, string> = { all: '전체 기간', today: '오늘', '7d': '최근 7일', '30d': '최근 30일' };

// CSV 셀 이스케이프: 수식 인젝션 방어 + 따옴표 처리
const escapeCsvCell = (value: unknown): string => {
  const str = value == null ? '' : String(value);
  const guarded = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${guarded.replace(/"/g, '""')}"`;
};

function periodStart(p: PeriodFilter): number | null {
  if (p === 'all') return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (p === 'today') return d.getTime();
  if (p === '7d') return d.getTime() - 6 * 864e5;
  if (p === '30d') return d.getTime() - 29 * 864e5;
  return null;
}

export function RegistrationsManager({ registrations }: { registrations: Registration[] }) {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  // 같은 연락처가 2건 이상이면 중복으로 간주
  const dupPhones = useMemo(() => {
    const byPhone = new Map<string, number>();
    for (const r of registrations) {
      const k = normPhone(r.phone);
      if (k) byPhone.set(k, (byPhone.get(k) ?? 0) + 1);
    }
    const set = new Set<string>();
    byPhone.forEach((n, k) => { if (n > 1) set.add(k); });
    return set;
  }, [registrations]);
  const isDup = (r: Registration) => dupPhones.has(normPhone(r.phone));

  const counts = useMemo(() => {
    const c = { all: registrations.length, new: 0, processed: 0, cancelled: 0, dup: 0 } as Record<StatusFilter, number>;
    for (const r of registrations) {
      c[r.status] = (c[r.status] ?? 0) + 1;
      if (dupPhones.has(normPhone(r.phone))) c.dup += 1;
    }
    return c;
  }, [registrations, dupPhones]);

  // 상단 대시보드용 집계
  const kpi = useMemo(() => {
    const t0 = periodStart('today')!, s7 = periodStart('7d')!, s30 = periodStart('30d')!;
    let today = 0, last7 = 0, last30 = 0;
    for (const r of registrations) {
      const t = r.createdAt?.toDate?.().getTime?.() ?? 0;
      if (t >= t0) today++;
      if (t >= s7) last7++;
      if (t >= s30) last30++;
    }
    return { today, last7, last30, pending: counts.new };
  }, [registrations, counts.new]);

  const trend = useMemo(() => {
    const DAYS = 14;
    const base = new Date(); base.setHours(0, 0, 0, 0);
    const buckets = Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(base.getTime() - (DAYS - 1 - i) * 864e5);
      return { d, ymd: format(d, 'yyyy-MM-dd'), count: 0 };
    });
    const idx = new Map(buckets.map((b, i) => [b.ymd, i]));
    for (const r of registrations) {
      const dt = r.createdAt?.toDate?.();
      if (!dt) continue;
      const k = format(dt, 'yyyy-MM-dd');
      const i = idx.get(k);
      if (i != null) buckets[i].count++;
    }
    const max = Math.max(1, ...buckets.map((b) => b.count));
    return { buckets, max };
  }, [registrations]);

  const filtered = useMemo(() => {
    const start = periodStart(period);
    const q = search.trim().toLowerCase();
    const list = registrations.filter((r) => {
      if (statusFilter === 'dup') { if (!dupPhones.has(normPhone(r.phone))) return false; }
      else if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (start != null) {
        const t = r.createdAt?.toDate?.().getTime?.() ?? 0;
        if (t < start) return false;
      }
      if (q) {
        const hay = `${r.name} ${r.phone} ${r.mainGym} ${r.passTier ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    // 중복 보기에서는 같은 번호끼리 붙여 보여준다(번호→최신순)
    if (statusFilter === 'dup') {
      list.sort((a, b) => {
        const pa = normPhone(a.phone), pb = normPhone(b.phone);
        if (pa !== pb) return pa < pb ? -1 : 1;
        return (b.createdAt?.toDate?.().getTime?.() ?? 0) - (a.createdAt?.toDate?.().getTime?.() ?? 0);
      });
    }
    return list;
  }, [registrations, statusFilter, period, search, dupPhones]);

  const filteredIds = useMemo(() => filtered.map((r) => r.id), [filtered]);
  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const changeOne = async (id: string, status: RegStatus) => {
    try {
      await updateDoc(doc(db, 'registrations', id), { status });
      toast({ title: '상태 변경', description: `1건 → ${REG_STATUS_LABEL[status]}` });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '변경 실패', description: '권한/네트워크를 확인하세요.' });
    }
  };

  const bulkChange = async (status: RegStatus) => {
    const ids = filteredIds.filter((id) => selected.has(id));
    if (ids.length === 0) return;
    if (!confirm(`선택한 ${ids.length}건의 상태를 '${REG_STATUS_LABEL[status]}'(으)로 변경할까요?`)) return;
    setBusy(true);
    try {
      // Firestore batch 최대 500건 → 400건씩 나눠서 처리
      for (let i = 0; i < ids.length; i += 400) {
        const batch = writeBatch(db);
        ids.slice(i, i + 400).forEach((id) => batch.update(doc(db, 'registrations', id), { status }));
        await batch.commit();
      }
      toast({ title: '일괄 변경 완료', description: `${ids.length}건 → ${REG_STATUS_LABEL[status]}` });
      clearSelection();
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: '일괄 변경 실패', description: '권한/네트워크를 확인하세요.' });
    } finally {
      setBusy(false);
    }
  };

  const deleteIds = async (ids: string[]) => {
    if (ids.length === 0) return;
    if (!confirm(`선택한 ${ids.length}건을 완전히 삭제할까요?\n(되돌릴 수 없습니다)`)) return;
    setBusy(true);
    try {
      if (ids.length === 1) {
        await deleteDoc(doc(db, 'registrations', ids[0]));
      } else {
        for (let i = 0; i < ids.length; i += 400) {
          const batch = writeBatch(db);
          ids.slice(i, i + 400).forEach((id) => batch.delete(doc(db, 'registrations', id)));
          await batch.commit();
        }
      }
      toast({ title: '삭제 완료', description: `${ids.length}건 삭제됨` });
      clearSelection();
    } catch (e: any) {
      console.error(e);
      const denied = e?.code === 'permission-denied' || /permission/i.test(e?.message || '');
      toast({
        variant: 'destructive',
        title: '삭제 실패',
        description: denied ? '삭제 권한이 아직 배포되지 않았습니다(보안 규칙). 규칙 배포 후 다시 시도하세요.' : '네트워크/권한을 확인하세요.',
      });
    } finally {
      setBusy(false);
    }
  };

  const bulkDelete = () => deleteIds(filteredIds.filter((id) => selected.has(id)));

  // 번호별 '최신 1건'만 남기고 나머지 중복 건을 선택 → 정리용
  const selectDuplicatesToClean = () => {
    const latestByPhone = new Map<string, { id: string; t: number }>();
    for (const r of registrations) {
      const k = normPhone(r.phone);
      if (!k || !dupPhones.has(k)) continue;
      const t = r.createdAt?.toDate?.().getTime?.() ?? 0;
      const cur = latestByPhone.get(k);
      if (!cur || t > cur.t) latestByPhone.set(k, { id: r.id, t });
    }
    const keepIds = new Set(Array.from(latestByPhone.values()).map((v) => v.id));
    const toSelect = registrations.filter((r) => dupPhones.has(normPhone(r.phone)) && !keepIds.has(r.id)).map((r) => r.id);
    setSelected(new Set(toSelect));
    setStatusFilter('dup');
    toast({ title: '중복 정리 선택', description: `번호별 최신 1건 제외, ${toSelect.length}건 선택됨. 확인 후 '선택 삭제'` });
  };

  const downloadCSV = () => {
    const rows = someSelected ? filtered.filter((r) => selected.has(r.id)) : filtered;
    const BOM = '﻿';
    const headers = ['신청일', '이름', '연락처', '주 이용지점', '패스 등급', '기간', '가격', '상태'];
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.createdAt?.toDate ? format(r.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : '',
          r.name,
          r.phone,
          r.mainGym,
          r.passTier || 'N/A',
          r.passDuration ? `${r.passDuration}개월` : 'N/A',
          r.passPrice ? r.passPrice.toLocaleString() : '0',
          REG_STATUS_LABEL[r.status],
        ]
          .map(escapeCsvCell)
          .join(',')
      ),
    ].join('\n');
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `헬보올패스_가입신청${someSelected ? '_선택' : ''}_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statusTabs: StatusFilter[] = ['all', 'new', 'processed', 'cancelled', 'dup'];
  const tabLabel = (s: StatusFilter) => (s === 'all' ? '전체' : s === 'dup' ? '⚠ 중복' : REG_STATUS_LABEL[s as RegStatus]);

  const kpiTiles = [
    { label: '오늘 신청', value: kpi.today, hint: '자정 이후' },
    { label: '최근 7일', value: kpi.last7 },
    { label: '최근 30일', value: kpi.last30 },
    { label: '미처리(신규)', value: kpi.pending, accent: kpi.pending > 0 },
  ];

  return (
    <div className="space-y-4">
      {/* 상단 대시보드 */}
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpiTiles.map((t) => (
            <div key={t.label} className="rounded-lg border bg-background/50 p-3">
              <p className="text-[11px] text-muted-foreground">{t.label}</p>
              <p className={`mt-1 text-2xl font-black leading-none ${t.accent ? 'text-primary' : 'text-foreground'}`}>{t.value}</p>
              {t.hint && <p className="mt-1 text-[10px] text-muted-foreground">{t.hint}</p>}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">최근 14일 신청 추이</p>
          <p className="text-[10px] text-muted-foreground">막대에 커서를 올리면 상세</p>
        </div>
        <div className="mt-2 flex items-end gap-1" style={{ height: 64 }}>
          {trend.buckets.map((b) => {
            const isToday = b.ymd === format(new Date(), 'yyyy-MM-dd');
            const h = Math.round((b.count / trend.max) * 100);
            return (
              <div
                key={b.ymd}
                className="group relative flex h-full flex-1 items-end"
                title={`${format(b.d, 'M월 d일 (E)', { locale: ko })} · ${b.count}건`}
              >
                <div
                  className={`w-full rounded-t transition-colors ${isToday ? 'bg-primary' : 'bg-primary/45 group-hover:bg-primary/70'}`}
                  style={{ height: b.count ? `max(${h}%, 4px)` : '2px' }}
                />
                {b.count > 0 && (
                  <span className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100">
                    {b.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex gap-1">
          {trend.buckets.map((b, i) => (
            <div key={b.ymd} className="flex-1 text-center text-[9px] leading-tight text-muted-foreground">
              {i === 0 || i === trend.buckets.length - 1 || b.d.getDate() === 1 ? format(b.d, 'M/d') : ''}
            </div>
          ))}
        </div>
      </div>

      {/* 필터 바 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {statusTabs.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? s === 'dup' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
                  : `bg-secondary hover:text-foreground ${s === 'dup' && counts.dup > 0 ? 'text-destructive' : 'text-muted-foreground'}`
              }`}
            >
              {tabLabel(s)} <span className="ml-0.5 opacity-70">{counts[s] ?? 0}</span>
            </button>
          ))}
          {counts.dup > 0 && (
            <Button size="sm" variant="outline" onClick={selectDuplicatesToClean} className="h-8 border-destructive/40 text-xs text-destructive hover:text-destructive">
              <Copy className="mr-1.5 h-3.5 w-3.5" /> 중복 정리(최신 1건만 남기고 선택)
            </Button>
          )}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIOD_LABEL) as PeriodFilter[]).map((p) => (
                <SelectItem key={p} value={p}>{PERIOD_LABEL[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름·연락처·지점 검색" className="h-9 w-[200px] pl-8 text-xs" />
          </div>
          <Button size="sm" variant="outline" onClick={downloadCSV} className="text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" /> CSV{someSelected ? ` (선택 ${selected.size})` : ` (${filtered.length})`}
          </Button>
        </div>
      </div>

      {/* 일괄 변경 바 */}
      {someSelected && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2">
          <span className="text-sm font-semibold text-primary">{selected.size}건 선택됨</span>
          <span className="text-xs text-muted-foreground">상태 일괄 변경:</span>
          {(['new', 'processed', 'cancelled'] as RegStatus[]).map((s) => (
            <Button key={s} size="sm" variant="outline" disabled={busy} onClick={() => bulkChange(s)} className="h-8 text-xs">
              {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
              {REG_STATUS_LABEL[s]}로
            </Button>
          ))}
          <Button size="sm" variant="destructive" disabled={busy} onClick={bulkDelete} className="h-8 text-xs">
            <Trash2 className="mr-1 h-3.5 w-3.5" /> 선택 삭제
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection} className="h-8 text-xs text-muted-foreground">
            <X className="mr-1 h-3.5 w-3.5" /> 선택 해제
          </Button>
        </div>
      )}

      {/* 표 */}
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="전체 선택" />
              </TableHead>
              <TableHead>신청일</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>주 이용지점</TableHead>
              <TableHead>구매 예정 상품</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>상태 변경</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((r) => (
                <TableRow key={r.id} className={selected.has(r.id) ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} aria-label={`${r.name} 선택`} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {r.createdAt?.toDate ? format(r.createdAt.toDate(), 'yy-MM-dd HH:mm', { locale: ko }) : '-'}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      {r.name}
                      {isDup(r) && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive" title="같은 연락처로 2건 이상 신청됨">
                          <AlertTriangle className="h-3 w-3" /> 중복
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{r.phone}</TableCell>
                  <TableCell><span className="font-semibold text-primary">{r.mainGym?.replace('헬스보이짐', '').trim()}</span></TableCell>
                  <TableCell>
                    {r.passTier ? (
                      <div className="flex flex-col gap-0.5">
                        <Badge variant="outline" className="w-fit text-[10px] border-primary/50 text-primary">{r.passTier}</Badge>
                        <span className="text-xs">{r.passDuration}개월 {r.passPrice ? `(₩${r.passPrice.toLocaleString()})` : ''}</span>
                      </div>
                    ) : <span className="text-muted-foreground text-xs">정보 없음</span>}
                  </TableCell>
                  <TableCell><Badge className={REG_STATUS_COLOR[r.status]}>{REG_STATUS_LABEL[r.status]}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Select value={r.status} onValueChange={(v) => changeOne(r.id, v as RegStatus)}>
                        <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(['new', 'processed', 'cancelled'] as RegStatus[]).map((s) => (
                            <SelectItem key={s} value={s}>{REG_STATUS_LABEL[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" title="삭제" onClick={() => deleteIds([r.id])}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  조건에 맞는 신청이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        총 {registrations.length}건 중 <b className="text-foreground">{filtered.length}건</b> 표시. 체크박스로 여러 건을 선택해 상태를 한 번에 바꿀 수 있습니다.
      </p>
    </div>
  );
}
