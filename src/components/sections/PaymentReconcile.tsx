'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Search, Download, CheckCircle2, CircleSlash } from 'lucide-react';
import { format } from 'date-fns';
import { normPhone, type Registration } from '@/components/sections/RegistrationsManager';

interface Purchase {
  name: string; phone: string; product: string; amount: string; regDate: string; status: string;
  tier: string; months: string;
}

// ── 입장권명 파싱 ────────────────────────────────────────────────────────────
/** 등급 키 추출(S프리미엄/프리미엄/골드/실버/블랙). 없으면 ''. */
function tierKey(s: string): string {
  const n = (s || '').toLowerCase().replace(/[\s-]/g, '');
  if (n.includes('블랙')) return '블랙';
  if (n.includes('실버')) return '실버';
  if (n.includes('골드')) return '골드';
  if (n.includes('s프리미엄') || n.includes('에스프리미엄')) return 'S프리미엄';
  if (n.includes('프리미엄')) return '프리미엄';
  return '';
}
/** 'N개월' → 'N'. 없으면 ''. */
function monthsOf(s: string): string {
  const m = (s || '').match(/(\d+)\s*개월/);
  return m ? m[1] : '';
}
/** 비교 대상(등급 올패스/패스권 + 이벤트)인지. 비회원·상품권·회차권 제외. */
function isAllpassProduct(name: string): boolean {
  const n = (name || '').replace(/\s/g, '');
  if (!n) return false;
  if (n.includes('비회원') || n.includes('상품권') || n.includes('회차') || n.includes('회권')) return false;
  const hasTier = tierKey(name) !== '';
  const isPass = n.includes('올패스') || n.includes('패스권');
  const isEvent = n.includes('이벤트');
  return (hasTier && isPass) || (isEvent && (n.includes('올패스') || n.includes('프리미엄')));
}

/** 우리 신규 이벤트(49,000): '2026 이벤트 프리미엄 올패스 1개월'. */
const isNewEvent = (name: string) => (name || '').replace(/\s/g, '').includes('2026이벤트프리미엄올패스');
/** 활성(환불·만료·취소 제외). 빈 상태/활성/예정은 유효로 간주. */
const isActiveStatus = (s: string) => !/(만료|환불|취소|미납|해지)/.test(s || '');

function colIndex(header: any[], ...cands: string[]): number {
  const norm = (s: any) => String(s ?? '').replace(/\s/g, '');
  return header.findIndex((h) => cands.some((c) => norm(h) === norm(c) || norm(h).includes(norm(c))));
}
const escapeCsv = (v: unknown) => {
  const s = v == null ? '' : String(v);
  const g = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${g.replace(/"/g, '""')}"`;
};

export function PaymentReconcile({ registrations }: { registrations: Registration[] }) {
  const { toast } = useToast();
  const [raw, setRaw] = useState<Purchase[] | null>(null);
  const [excluded, setExcluded] = useState(0);
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [tab, setTab] = useState<'applicants' | 'branches' | 'products'>('applicants');
  const [view, setView] = useState<'all' | 'converted' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<'all' | 'newEvent'>('all'); // 신규 이벤트만 보기
  const [activeOnly, setActiveOnly] = useState(false);           // 환불·만료 제외
  const [groupTM, setGroupTM] = useState(false);                 // 상품별을 등급+개월로 묶기
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setParsing(true);
    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, blankrows: false });
      if (!rows.length) throw new Error('빈 파일');
      let hi = rows.findIndex((r) => Array.isArray(r) && r.some((c) => String(c).includes('연락처')) && r.some((c) => String(c).includes('고객') || String(c).includes('이름')));
      if (hi < 0) hi = 0;
      const header = rows[hi];
      const ci = {
        name: colIndex(header, '고객명', '이름', '회원명'),
        phone: colIndex(header, '연락처', '휴대폰', '전화'),
        product: colIndex(header, '입장권명', '상품명', '상품'),
        amount: colIndex(header, '판매 금액', '판매금액', '결제금액', '금액'),
        regDate: colIndex(header, '등록일', '결제일', '구매일'),
        status: colIndex(header, '상태'),
      };
      if (ci.phone < 0 || ci.product < 0) throw new Error("'연락처'/'입장권명' 컬럼을 찾을 수 없습니다");
      const list: Purchase[] = [];
      let skip = 0;
      for (let i = hi + 1; i < rows.length; i++) {
        const r = rows[i];
        if (!Array.isArray(r)) continue;
        const phone = normPhone(String(r[ci.phone] ?? ''));
        const product = String(r[ci.product] ?? '').trim();
        if (!phone || !product) continue;
        if (!isAllpassProduct(product)) { skip++; continue; } // 비교 대상 상품만
        list.push({
          name: String(r[ci.name] ?? '').trim(),
          phone, product,
          amount: ci.amount >= 0 ? String(r[ci.amount] ?? '').trim() : '',
          regDate: ci.regDate >= 0 ? String(r[ci.regDate] ?? '').trim() : '',
          status: ci.status >= 0 ? String(r[ci.status] ?? '').trim() : '',
          tier: tierKey(product), months: monthsOf(product),
        });
      }
      setRaw(list);
      setExcluded(skip);
      setFileName(file.name);
      toast({ title: '불러오기 완료', description: `비교대상 결제 ${list.length}건 (제외 ${skip}건)` });
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: '파일 읽기 실패', description: e?.message || 'BroJ 입장권 목록 엑셀이 맞는지 확인하세요.' });
    } finally {
      setParsing(false);
    }
  };

  // 필터 적용된 결제 집합(신규 이벤트만 / 활성만) — 모든 집계·매칭의 기준
  const rawFiltered = useMemo(() => {
    return (raw ?? []).filter((p) => {
      if (scope === 'newEvent' && !isNewEvent(p.product)) return false;
      if (activeOnly && !isActiveStatus(p.status)) return false;
      return true;
    });
  }, [raw, scope, activeOnly]);

  // 연락처 → 결제 목록(최신 등록일 우선)
  const byPhone = useMemo(() => {
    const m = new Map<string, Purchase[]>();
    for (const p of rawFiltered) {
      const a = m.get(p.phone) ?? []; a.push(p); m.set(p.phone, a);
    }
    m.forEach((a) => a.sort((x, y) => (x.regDate < y.regDate ? 1 : -1)));
    return m;
  }, [rawFiltered]);

  // 신청자 동일건(전화+주이용지점+등급+개월) 중복 제거
  const cases = useMemo(() => {
    const regTier = (r: Registration) => tierKey(r.passTier || '');
    const regMonths = (r: Registration) => (r.passDuration || '').replace(/[^\d]/g, '');
    const map = new Map<string, { reg: Registration; tier: string; months: string; dup: number }>();
    for (const r of registrations) {
      const t = regTier(r), mo = regMonths(r);
      const key = `${normPhone(r.phone)}|${(r.mainGym || '').trim()}|${t}|${mo}`;
      const cur = map.get(key);
      if (!cur) map.set(key, { reg: r, tier: t, months: mo, dup: 1 });
      else {
        cur.dup++;
        // 대표는 최신 신청으로
        const tc = cur.reg.createdAt?.toDate?.().getTime?.() ?? 0;
        const tr = r.createdAt?.toDate?.().getTime?.() ?? 0;
        if (tr > tc) cur.reg = r;
      }
    }
    return Array.from(map.values());
  }, [registrations]);

  // 매칭: 전화+등급+개월 (신청에 등급/개월 없으면 그 조건은 생략)
  const reconciled = useMemo(() => {
    return cases.map((c) => {
      const cand = byPhone.get(normPhone(c.reg.phone)) ?? [];
      const matches = cand.filter((p) => (!c.tier || p.tier === c.tier) && (!c.months || p.months === c.months));
      return { ...c, converted: matches.length > 0, rep: matches[0] ?? null, count: matches.length };
    });
  }, [cases, byPhone]);

  const stats = useMemo(() => {
    const total = reconciled.length;
    const conv = reconciled.filter((x) => x.converted).length;
    return { total, conv, pending: total - conv, rate: total ? Math.round((conv / total) * 1000) / 10 : 0 };
  }, [reconciled]);

  // 지점별 집계(신청자의 주이용지점 기준)
  const byBranch = useMemo(() => {
    const m = new Map<string, { apply: number; conv: number }>();
    for (const x of reconciled) {
      const b = (x.reg.mainGym || '(미지정)').replace('헬스보이짐', '').trim() || '(미지정)';
      const cur = m.get(b) ?? { apply: 0, conv: 0 };
      cur.apply++; if (x.converted) cur.conv++;
      m.set(b, cur);
    }
    return Array.from(m.entries())
      .map(([branch, v]) => ({ branch, ...v, rate: v.apply ? Math.round((v.conv / v.apply) * 1000) / 10 : 0 }))
      .sort((a, b) => b.apply - a.apply);
  }, [reconciled]);

  // 결제 상품별 집계(rawFiltered 기준). groupTM=true면 등급+개월로 묶어 합산.
  const byProduct = useMemo(() => {
    const m = new Map<string, { product: string; tier: string; months: string; count: number; amount: number }>();
    for (const p of rawFiltered) {
      const label = groupTM ? `${p.tier || '기타'} ${p.months ? p.months + '개월' : '기타'}` : p.product;
      const cur = m.get(label) ?? { product: label, tier: p.tier, months: p.months, count: 0, amount: 0 };
      cur.count++;
      cur.amount += Number((p.amount || '').replace(/[^\d]/g, '')) || 0;
      m.set(label, cur);
    }
    return Array.from(m.values()).sort((a, b) => b.count - a.count);
  }, [rawFiltered, groupTM]);
  const productTotal = useMemo(
    () => byProduct.reduce((s, x) => ({ count: s.count + x.count, amount: s.amount + x.amount }), { count: 0, amount: 0 }),
    [byProduct]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reconciled.filter((x) => {
      if (view === 'converted' && !x.converted) return false;
      if (view === 'pending' && x.converted) return false;
      if (q) {
        const hay = `${x.reg.name} ${x.reg.phone} ${x.reg.mainGym} ${x.rep?.product ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reconciled, view, search]);

  const downloadCSV = () => {
    const BOM = '﻿';
    const headers = ['신청일', '이름', '연락처', '주 이용지점', '신청 등급', '신청 개월', '중복건수', '결제여부', '결제상품', '결제일', '금액', '상태'];
    const csv = [
      headers.join(','),
      ...filtered.map((x) => [
        x.reg.createdAt?.toDate ? format(x.reg.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : '',
        x.reg.name, x.reg.phone, x.reg.mainGym, x.tier || '', x.months || '', x.dup,
        x.converted ? '결제' : '미결제', x.rep?.product || '', x.rep?.regDate || '', x.rep?.amount || '', x.rep?.status || '',
      ].map(escapeCsv).join(',')),
    ].join('\n');
    saveCsv(csv, `헬보올패스_결제대조_${format(new Date(), 'yyyyMMdd')}.csv`);
  };

  const saveCsv = (csv: string, filename: string) => {
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const downloadBranchCSV = () => {
    const rows = [['지점', '신청', '결제', '전환율(%)'].join(',')]
      .concat(byBranch.map((b) => [b.branch, b.apply, b.conv, b.rate].map(escapeCsv).join(',')));
    saveCsv(rows.join('\n'), `헬보올패스_지점별전환_${format(new Date(), 'yyyyMMdd')}.csv`);
  };

  const downloadProductCSV = () => {
    const rows = [['결제상품(입장권명)', '등급', '개월', '건수', '매출합계'].join(',')]
      .concat(byProduct.map((p) => [p.product, p.tier, p.months ? `${p.months}개월` : '', p.count, p.amount].map(escapeCsv).join(',')))
      .concat([['합계', '', '', productTotal.count, productTotal.amount].map(escapeCsv).join(',')]);
    saveCsv(rows.join('\n'), `헬보올패스_결제상품별_${format(new Date(), 'yyyyMMdd')}.csv`);
  };

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />

      {/* 업로드 */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">BroJ 입장권 목록 업로드</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <b>등급 올패스/패스권 + 이벤트</b> 상품만 비교합니다(비회원·상품권·회차권 제외). 매칭은 <b>연락처+등급+개월</b>, 동일 신청(전화+지점+등급+개월)은 1건으로 묶습니다. 파일은 저장하지 않습니다.
            </p>
          </div>
          <Button onClick={() => fileRef.current?.click()} disabled={parsing}>
            {parsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} 엑셀 업로드
          </Button>
        </div>
        {fileName && <p className="mt-2 text-xs text-muted-foreground">파일: <b className="text-foreground">{fileName}</b> · 비교대상 결제 {raw?.length ?? 0}건 · 제외 {excluded}건</p>}
      </div>

      {!raw ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          아직 업로드된 결제 데이터가 없습니다. 위 <b className="text-foreground">엑셀 업로드</b>로 BroJ 입장권 목록을 올려주세요.
        </div>
      ) : (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border bg-card p-3"><p className="text-[11px] text-muted-foreground">신청(동일건)</p><p className="mt-1 text-2xl font-black">{stats.total}</p></div>
            <div className="rounded-lg border bg-card p-3"><p className="text-[11px] text-muted-foreground">실결제 전환</p><p className="mt-1 text-2xl font-black text-primary">{stats.conv}</p></div>
            <div className="rounded-lg border bg-card p-3"><p className="text-[11px] text-muted-foreground">미결제</p><p className="mt-1 text-2xl font-black">{stats.pending}</p></div>
            <div className="rounded-lg border bg-card p-3"><p className="text-[11px] text-muted-foreground">전환율</p><p className="mt-1 text-2xl font-black text-primary">{stats.rate}%</p></div>
          </div>

          {/* 전역 필터: 신규 이벤트만 / 활성만 */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-secondary/20 px-3 py-2">
            <span className="text-[11px] font-semibold text-muted-foreground">필터</span>
            <button onClick={() => setScope('all')}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${scope === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>전체 상품</button>
            <button onClick={() => setScope('newEvent')}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${scope === 'newEvent' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>신규 이벤트(49,000)만</button>
            <span className="mx-1 h-4 w-px bg-border" />
            <button onClick={() => setActiveOnly((v) => !v)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${activeOnly ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {activeOnly ? '✓ ' : ''}활성만(환불·만료 제외)
            </button>
            <span className="ml-auto text-[11px] text-muted-foreground">비교대상 {rawFiltered.length}건{(scope !== 'all' || activeOnly) ? ` (전체 ${raw.length}건 중)` : ''}</span>
          </div>

          {/* 뷰 전환 */}
          <div className="flex gap-1.5">
            {(['applicants', 'branches', 'products'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {t === 'applicants' ? '신청자별' : t === 'branches' ? '지점별' : '결제 상품별'}
              </button>
            ))}
          </div>

          {tab === 'branches' ? (
            <div className="space-y-2">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={downloadBranchCSV} className="text-xs"><Download className="mr-1.5 h-3.5 w-3.5" /> CSV ({byBranch.length})</Button>
            </div>
            <div className="rounded-md border bg-card overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>지점</TableHead><TableHead className="text-right">신청</TableHead>
                  <TableHead className="text-right">결제</TableHead><TableHead className="text-right">전환율</TableHead>
                  <TableHead className="w-[160px]"></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {byBranch.map((b) => (
                    <TableRow key={b.branch}>
                      <TableCell className="font-medium">{b.branch}</TableCell>
                      <TableCell className="text-right">{b.apply}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{b.conv}</TableCell>
                      <TableCell className="text-right">{b.rate}%</TableCell>
                      <TableCell><div className="h-2 w-full rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${b.rate}%` }} /></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            </div>
          ) : tab === 'products' ? (
            <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <button onClick={() => setGroupTM((v) => !v)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${groupTM ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {groupTM ? '✓ ' : ''}등급+개월로 묶기
              </button>
              <Button size="sm" variant="outline" onClick={downloadProductCSV} className="text-xs"><Download className="mr-1.5 h-3.5 w-3.5" /> CSV ({byProduct.length})</Button>
            </div>
            <div className="rounded-md border bg-card overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{groupTM ? '등급 + 개월' : '결제 상품(입장권명)'}</TableHead><TableHead>등급</TableHead><TableHead>개월</TableHead>
                  <TableHead className="text-right">건수</TableHead><TableHead className="text-right">매출 합계</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {byProduct.map((p) => (
                    <TableRow key={p.product}>
                      <TableCell className="font-medium">{p.product}</TableCell>
                      <TableCell className="text-xs">{p.tier || '-'}</TableCell>
                      <TableCell className="text-xs">{p.months ? `${p.months}개월` : '-'}</TableCell>
                      <TableCell className="text-right font-semibold">{p.count}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{p.amount.toLocaleString()}원</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold" colSpan={3}>합계</TableCell>
                    <TableCell className="text-right font-bold text-primary">{productTotal.count}</TableCell>
                    <TableCell className="text-right font-bold text-primary whitespace-nowrap">{productTotal.amount.toLocaleString()}원</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1.5">
                  {(['all', 'converted', 'pending'] as const).map((v) => (
                    <button key={v} onClick={() => setView(v)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${view === v ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                      {v === 'all' ? '전체' : v === 'converted' ? '결제' : '미결제'} <span className="ml-0.5 opacity-70">{v === 'all' ? stats.total : v === 'converted' ? stats.conv : stats.pending}</span>
                    </button>
                  ))}
                </div>
                <div className="relative ml-auto">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름·연락처·지점 검색" className="h-9 w-[200px] pl-8 text-xs" />
                </div>
                <Button size="sm" variant="outline" onClick={downloadCSV} className="text-xs"><Download className="mr-1.5 h-3.5 w-3.5" /> CSV ({filtered.length})</Button>
              </div>

              <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>신청일</TableHead><TableHead>이름</TableHead><TableHead>연락처</TableHead>
                    <TableHead>주 이용지점</TableHead><TableHead>신청(등급/개월)</TableHead>
                    <TableHead>결제여부</TableHead><TableHead>결제 상품</TableHead><TableHead>결제일</TableHead><TableHead>금액</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filtered.length ? filtered.map((x) => (
                      <TableRow key={x.reg.id} className={x.converted ? '' : 'opacity-70'}>
                        <TableCell className="whitespace-nowrap text-xs">{x.reg.createdAt?.toDate ? format(x.reg.createdAt.toDate(), 'yy-MM-dd') : '-'}</TableCell>
                        <TableCell>{x.reg.name}{x.dup > 1 && <span className="ml-1 text-[10px] text-muted-foreground">(중복 {x.dup})</span>}</TableCell>
                        <TableCell className="whitespace-nowrap">{x.reg.phone}</TableCell>
                        <TableCell><span className="font-semibold text-primary">{(x.reg.mainGym || '').replace('헬스보이짐', '').trim()}</span></TableCell>
                        <TableCell className="text-xs">{x.tier || '-'}{x.months ? ` / ${x.months}개월` : ''}</TableCell>
                        <TableCell>{x.converted
                          ? <Badge className="bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />결제</Badge>
                          : <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><CircleSlash className="h-3.5 w-3.5" />미결제</span>}</TableCell>
                        <TableCell className="text-xs">{x.rep?.product || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">{x.rep?.regDate || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs">{x.rep?.amount || '-'}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">조건에 맞는 신청자가 없습니다.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            동일건(전화+지점+등급+개월) {stats.total}건 중 <b className="text-primary">{stats.conv}건</b> 실결제({stats.rate}%). 매칭 기준: 연락처+등급+개월(입장권명에서 추출). BroJ엔 지점 정보가 없어 지점별 집계는 신청자의 주 이용지점 기준입니다.
          </p>
        </>
      )}
    </div>
  );
}
