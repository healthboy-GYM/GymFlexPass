'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User, type AuthError } from "firebase/auth";
import { auth, db, collection, onSnapshot, query, orderBy, Timestamp, updateDoc, doc } from '@/lib/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, LogOut, Loader2, Users, Ticket, Download, MapPin, Megaphone, Bell, Tag, Sparkles, BookOpen, HelpCircle, LifeBuoy, ExternalLink, Receipt } from 'lucide-react';
import Link from 'next/link';
import { GymManager } from '@/components/sections/GymManager';
import { RegistrationsManager, type Registration } from '@/components/sections/RegistrationsManager';
import { PaymentReconcile } from '@/components/sections/PaymentReconcile';
import { EventManager } from '@/components/sections/EventManager';
import { BannerManager } from '@/components/sections/BannerManager';
import { PricingManager } from '@/components/sections/PricingManager';
import { PopupManager } from '@/components/sections/PopupManager';
import { UsageGuideManager } from '@/components/sections/UsageGuideManager';
import { FaqManager } from '@/components/sections/FaqManager';
import { AdminManual } from '@/components/sections/AdminManual';
import { subscribeGyms } from '@/lib/gyms';
import { subscribeEvents } from '@/lib/events';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Data types
interface UsedCoupon {
    id: string;
    branch: string;
    usedAt: Timestamp;
}

type Column<T> = {
  key: keyof T | 'createdAt' | 'usedAt' | 'passInfo';
  header: string;
  render?: (item: T) => React.ReactNode;
};

function DataTable<T extends { id: string, status?: string }>({
  data,
  columns,
  onStatusChange,
  statusOptions,
  statusMap,
}: {
  data: T[];
  columns: Column<T>[];
  onStatusChange?: (id: string, newStatus: string) => void;
  statusOptions?: { value: string; label: string }[];
  statusMap?: { [key: string]: string };
}) {
  return (
    <div className="rounded-md border bg-card">
        <Table>
            <TableHeader>
            <TableRow>
                {columns.map((col) => (
                <TableHead key={String(col.key)}>{col.header}</TableHead>
                ))}
                {onStatusChange && <TableHead>상태 변경</TableHead>}
            </TableRow>
            </TableHeader>
            <TableBody>
            {data.length > 0 ? (
                data.map((item) => (
                <TableRow key={item.id}>
                    {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                        {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                    </TableCell>
                    ))}
                    {onStatusChange && item.status && statusOptions && (
                    <TableCell>
                        <Select onValueChange={(newStatus) => onStatusChange(item.id, newStatus)} defaultValue={item.status}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </TableCell>
                    )}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length + (onStatusChange ? 1 : 0)} className="h-24 text-center">
                    데이터가 없습니다.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
    </div>
  );
}


function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: React.ReactNode; sub?: string }) {
    return (
        <div className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{value}</span>
                {sub && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{sub}</span>}
            </div>
        </div>
    );
}

function AdminDashboard() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [usedCoupons, setUsedCoupons] = useState<UsedCoupon[]>([]);
    const [gymCount, setGymCount] = useState<number | null>(null);
    const [eventCount, setEventCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('registrations');
    const { toast } = useToast();

    useEffect(() => {
        const fetchCollection = (collectionName: string, setData: (data: any[]) => void) => {
            const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
                setData(items);
                setLoading(false);
            }, (error) => {
                console.error(`Error fetching ${collectionName}:`, error);
                toast({ variant: 'destructive', title: '데이터 로딩 실패', description: `[${collectionName}] 데이터를 불러오는 중 오류가 발생했습니다.` });
                setLoading(false);
            });
            return unsubscribe;
        };

        const unsubRegistrations = fetchCollection('registrations', setRegistrations);
        const unsubUsedCoupons = onSnapshot(query(collection(db, "usedCoupons"), orderBy('usedAt', 'desc')), (snapshot) => {
            const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UsedCoupon[];
            setUsedCoupons(coupons);
        });
        const unsubGyms = subscribeGyms((g) => setGymCount(g.length), { includeInactive: true, onError: () => setGymCount(null) });
        const unsubEvents = subscribeEvents((e) => setEventCount(e.length), { includeInactive: true, onError: () => setEventCount(null) });

        return () => {
            unsubRegistrations();
            unsubUsedCoupons();
            unsubGyms();
            unsubEvents();
        };
    }, [toast]);


    /* 가입신청 CSV·상태변경은 RegistrationsManager 로 이전됨(아래 레거시 미사용)
    const downloadCSV = () => {
        let csvContent = "";
        let fileName = "";
        const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility

        {
            fileName = `헬보올패스_가입신청목록_${format(new Date(), 'yyyyMMdd')}.csv`;
            const headers = ["신청일", "이름", "연락처", "주 이용지점", "패스 등급", "기간", "가격", "상태"];
            csvContent = [
                headers.join(","),
                ...registrations.map(r => [
                    format(r.createdAt.toDate(), 'yyyy-MM-dd HH:mm'),
                    r.name,
                    r.phone,
                    r.mainGym,
                    r.passTier || "N/A",
                    r.passDuration ? `${r.passDuration}개월` : "N/A",
                    r.passPrice ? r.passPrice.toLocaleString() : "0",
                    statusMap.registration[r.status]
                ].map(escapeCsvCell).join(","))
            ].join("\n");
        }

        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    */

    const usedCouponColumns: Column<UsedCoupon>[] = [
        { key: 'usedAt', header: '사용일', render: (item: UsedCoupon) => format(item.usedAt.toDate(), 'yy-MM-dd HH:mm', { locale: ko }) },
        { key: 'id', header: '쿠폰 번호' },
        { key: 'branch', header: '등록 지점' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">데이터를 불러오는 중입니다...</p>
            </div>
        );
    }

    const newRegistrations = registrations.filter(r => r.status === 'new').length;

    type SectionDef = { value: string; group: '조회' | '관리' | '도움말'; label: string; icon: React.ElementType; count?: number; desc: string };
    const sections: SectionDef[] = [
        { value: 'registrations', group: '조회', label: '가입 신청', icon: Users, count: registrations.length, desc: '온라인 가입 신청을 확인하고 처리 상태를 바꿉니다. CSV로 내려받을 수 있습니다.' },
        { value: 'usedCoupons', group: '조회', label: '쿠폰 사용', icon: Ticket, count: usedCoupons.length, desc: '사용된 쿠폰 내역입니다.' },
        { value: 'reconcile', group: '조회', label: '결제 대조', icon: Receipt, desc: 'BroJ 입장권 목록 엑셀을 올려 신청자의 실결제 전환(전환율·미결제 명단)을 확인합니다.' },
        { value: 'gyms', group: '관리', label: '지점 관리', icon: MapPin, desc: '지점 정보·등급·좌표·드론영상을 추가/수정/삭제합니다.' },
        { value: 'events', group: '관리', label: '이벤트 관리', icon: Megaphone, desc: '이벤트(프로모션) 페이지를 만들고 홈에 노출합니다.' },
        { value: 'pricing', group: '관리', label: '가격 관리', icon: Tag, desc: '상품·기간별 가격과 결제 링크를 편집합니다. 구매·안내 페이지에 함께 반영됩니다.' },
        { value: 'popups', group: '관리', label: '팝업 관리', icon: Sparkles, desc: '홈 팝업을 만들고 켜고 끄거나 삭제합니다.' },
        { value: 'usageGuide', group: '관리', label: '이용안내', icon: BookOpen, desc: '이용 프로세스 단계와 안내 카드를 편집합니다.' },
        { value: 'faq', group: '관리', label: 'FAQ', icon: HelpCircle, desc: '자주 묻는 질문을 카테고리별로 관리합니다.' },
        { value: 'banner', group: '관리', label: '배너·공지', icon: Bell, desc: '사이트 상단 띠 배너의 문구·색상·표시 여부를 관리합니다.' },
        { value: 'manual', group: '도움말', label: '사용법', icon: LifeBuoy, desc: '관리자 화면 사용 안내입니다.' },
    ];
    const groups: SectionDef['group'][] = ['조회', '관리', '도움말'];
    const active = sections.find(s => s.value === tab) ?? sections[0];
    const ActiveIcon = active.icon;

    const renderContent = () => {
        switch (tab) {
            case 'registrations':
                return <RegistrationsManager registrations={registrations} />;
            case 'reconcile':
                return <PaymentReconcile registrations={registrations} />;
            case 'usedCoupons':
                return <DataTable data={usedCoupons} columns={usedCouponColumns} />;
            case 'gyms': return <GymManager />;
            case 'events': return <EventManager />;
            case 'pricing': return <PricingManager />;
            case 'popups': return <PopupManager />;
            case 'usageGuide': return <UsageGuideManager />;
            case 'faq': return <FaqManager />;
            case 'banner': return <BannerManager />;
            case 'manual': return <AdminManual />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* 요약 통계 카드 */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard icon={Users} label="가입 신청" value={registrations.length} sub={newRegistrations > 0 ? `신규 ${newRegistrations}` : undefined} />
                <StatCard icon={Ticket} label="쿠폰 사용" value={usedCoupons.length} />
                <StatCard icon={MapPin} label="운영 지점" value={gymCount ?? '–'} />
                <StatCard icon={Megaphone} label="이벤트" value={eventCount ?? '–'} />
            </div>

            {/* 모바일: 섹션 선택 드롭다운 */}
            <div className="lg:hidden">
                <Select value={tab} onValueChange={setTab}>
                    <SelectTrigger className="h-11">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {groups.map((g) => (
                            <SelectGroup key={g}>
                                <SelectLabel>{g}</SelectLabel>
                                {sections.filter((s) => s.group === g).map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}{s.count != null ? ` (${s.count})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:items-start">
                {/* 데스크톱: 좌측 사이드바 내비게이션 */}
                <nav className="hidden lg:block lg:sticky lg:top-6 space-y-5">
                    {groups.map((g) => (
                        <div key={g}>
                            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{g}</p>
                            <div className="space-y-1">
                                {sections.filter((s) => s.group === g).map((s) => {
                                    const Icon = s.icon;
                                    const isActive = tab === s.value;
                                    return (
                                        <button
                                            key={s.value}
                                            onClick={() => setTab(s.value)}
                                            className={cn(
                                                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                                isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                            )}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span className="flex-1 text-left">{s.label}</span>
                                            {s.count != null && (
                                                <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-muted-foreground')}>
                                                    {s.count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* 콘텐츠 영역 */}
                <div className="min-w-0 space-y-5">
                    <div className="flex items-start gap-3 border-b pb-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ActiveIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold leading-tight">{active.label}</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">{active.desc}</p>
                        </div>
                    </div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

function LoginForm({ onLogin }: { onLogin: (user: User) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            onLogin(userCredential.user);
            toast({ title: '로그인 성공', description: '관리자 페이지에 오신 것을 환영합니다.' });
        } catch (error) {
            const authError = error as AuthError;
            console.error("Login failed: ", authError);
            let description = '로그인 중 오류가 발생했습니다.';
            if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
                description = '이메일 또는 비밀번호가 올바르지 않습니다.';
            }
            toast({ variant: 'destructive', title: '로그인 실패', description });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">관리자 로그인</CardTitle>
                <CardDescription>계속하려면 이메일과 비밀번호를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">이메일</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">비밀번호</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                        로그인
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default function AdminPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary/30">
            <Header />
            <main className="flex-grow container py-12 md:py-20 px-4 md:px-6">
                {user ? (
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 rounded-2xl border bg-card p-5 md:p-6">
                            <div className="min-w-0">
                                <h1 className="text-2xl md:text-3xl font-bold">관리자 대시보드</h1>
                                <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/" target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        사이트 보기
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    로그아웃
                                </Button>
                            </div>
                        </div>
                        <AdminDashboard />
                    </div>
                ) : (
                    <div className="flex justify-center items-center">
                        <LoginForm onLogin={setUser} />
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
