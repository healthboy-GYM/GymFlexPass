'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Lightbulb, BarChart3, AlertTriangle, CheckCircle, Crown, Gem, Medal, Heart, X, LocateFixed, Loader2, Info, XCircle, Search, CircleHelp, ShoppingCart, Percent, Clock, Car, ArrowLeft, Rocket, Megaphone } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useGyms } from '@/hooks/use-gyms';
import { recommendGymPass, type GymRecommendationOutput } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { storage, ref, getDownloadURL } from '@/lib/firebase';


declare global {
    interface Window {
      naver: any;
    }
}

interface Gym {
  id: string;
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  parking?: string;
  transport?: string;
  image: string;
  imageHint?: string;
  thumbnailImage: string;
  thumbnailImageHint?: string;
  region: string;
  isNew?: boolean;
  tier: string;
  description?: string;
  lat: number;
  lng: number;
  naverplaceUrl?: string;
  c: string;
  "24시간 운영여부"?: string | null;
  "무료주차시간"?: string | null;
  droneVideoUrl?: string;
}

const tierOrder = ['S Premium', 'Premium', 'Gold', 'Silver', 'Black'];
const tierDisplayOrder = ['Black', 'Silver', 'Gold', 'Premium', 'S Premium'];


const tierNormalizationMap: { [key: string]: string } = {
  'S-PREMIUM': 'S Premium',
  'PREMIUM': 'Premium',
  'GOLD': 'Gold',
  'SILVER': 'Silver',
  'BLACK': 'Black',
};

const normalizeTier = (tier: string): string => {
  const upperTier = tier.toUpperCase().replace(/\s+/g, '-');
  return tierNormalizationMap[upperTier] || tier;
};

const pricingData: { [key: string]: { [key: string]: { price: number; link: string } } } = {
    'S Premium': {
        '1': { price: 180000, link: 'https://bmarket.broj.co.kr/products/253448' },
        '3': { price: 405000, link: 'https://bmarket.broj.co.kr/products/253364' },
        '6': { price: 600000, link: 'https://bmarket.broj.co.kr/products/253280' },
    },
    'Premium': {
        '1': { price: 152000, link: 'https://bmarket.broj.co.kr/products/253852' },
        '3': { price: 365000, link: 'https://bmarket.broj.co.kr/products/253775' },
        '6': { price: 547000, link: 'https://bmarket.broj.co.kr/products/253690' },
    },
    'Gold': {
        '1': { price: 124000, link: 'https://bmarket.broj.co.kr/products/254133' },
        '3': { price: 298000, link: 'https://bmarket.broj.co.kr/products/254064' },
        '6': { price: 446000, link: 'https://bmarket.broj.co.kr/products/253995' },
    },
    'Silver': {
        '1': { price: 110000, link: 'https://bmarket.broj.co.kr/products/254326' },
        '3': { price: 264000, link: 'https://bmarket.broj.co.kr/products/254298' },
        '6': { price: 396000, link: 'https://bmarket.broj.co.kr/products/254243' },
    },
    'Black': {
        '1': { price: 99000, link: 'https://bmarket.broj.co.kr/products/254414' },
        '3': { price: 211000, link: 'https://bmarket.broj.co.kr/products/254392' },
        '6': { price: 317000, link: 'https://bmarket.broj.co.kr/products/254370' },
    },
};

const durationOptions = [
  { value: '1', label: '1개월' },
  { value: '3', label: '3개월' },
  { value: '6', label: '6개월' },
];


const passTiers = [
  { name: 'S-PREMIUM', koreanName: 'S-프리미엄 올패스', tier: 'S Premium', icon: Crown, iconBg: 'bg-red-500' },
  { name: 'PREMIUM', koreanName: '프리미엄 올패스', tier: 'Premium', icon: Gem, iconBg: 'bg-blue-500' },
  { name: 'GOLD', koreanName: '골드 올패스', tier: 'Gold', icon: Medal, iconBg: 'bg-yellow-500' },
  { name: 'SILVER', koreanName: '실버 올패스', tier: 'Silver', icon: BarChart3, iconBg: 'bg-slate-500' },
  { name: 'BLACK', koreanName: '블랙 올패스', tier: 'Black', icon: Heart, iconBg: 'bg-neutral-800' },
].map(pass => ({
  ...pass,
  price: pricingData[pass.tier]?.['1']?.price || 0,
}));


const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    }
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI/180;
    const dLon = (lon2 - lon1) * Math.PI/180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

const shortenRegionName = (region: string) => {
    switch(region) {
        case '서울특별시': return '서울';
        case '대전광역시': return '대전';
        case '부산광역시': return '부산';
        case '경기도': return '경기';
        case '충청남도': return '충남';
        case '충청북도': return '충북';
        case '울산광역시': return '울산';
        case '경상남도': return '경남';
        case '전라북도': return '전북';
        case '대구광역시': return '대구';
        default: return region;
    }
};

const normalizeAssetPath = (p?: string | null): string | null => {
    if (!p) return null;
    const clean = p.replace(/^\/+/, ''); // Remove leading slashes
    return clean.startsWith('assets/') ? clean : `assets/${clean}`;
};

const PurchaseModal = ({ passInfo, children, gtmIdPrefix }: { passInfo: typeof passTiers[0] | undefined, children: React.ReactNode, gtmIdPrefix: string }) => {
  const [selectedDuration, setSelectedDuration] = useState<string | null>('1');

  if (!passInfo) return null;

  const selectedPriceInfo = selectedDuration ? pricingData[passInfo.tier]?.[selectedDuration] : null;
  
  const getMonthlyPrice = (tier: string, duration: string) => {
    const durationMonths = parseInt(duration, 10);
    const totalPrice = pricingData[tier]?.[duration]?.price;
    if (totalPrice && durationMonths > 0) {
      return Math.round(totalPrice / durationMonths);
    }
    return null;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>구매하기: {passInfo.koreanName}</DialogTitle>
          <DialogDescription>
            이용 기간을 선택하고 결제를 진행해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="font-semibold">이용 기간 선택</Label>
            <RadioGroup
              value={selectedDuration ?? ''}
              onValueChange={setSelectedDuration}
              className="grid grid-cols-3 gap-4 mt-2"
            >
              {durationOptions.map((option) => {
                 const monthlyPrice = getMonthlyPrice(passInfo.tier, option.value);
                 const oneMonthPrice = getMonthlyPrice(passInfo.tier, '1');
                 let discountRate = 0;
                 if (oneMonthPrice && monthlyPrice && oneMonthPrice > monthlyPrice) {
                     discountRate = Math.round(((oneMonthPrice - monthlyPrice) / oneMonthPrice) * 100);
                 }

                return (
                    <Label
                      key={option.value}
                      htmlFor={`duration-${option.value}-${passInfo.tier}`}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-md border p-4 cursor-pointer transition-all h-28 relative",
                        selectedDuration === option.value ? "border-primary ring-2 ring-primary bg-primary/5" : "border-border/50 hover:bg-secondary/50",
                      )}
                    >
                      <span className="font-bold text-xl">{option.label}</span>
                      {monthlyPrice && (
                          <span className="text-sm text-muted-foreground mt-1">
                              월 {monthlyPrice.toLocaleString()}원
                          </span>
                      )}
                      <RadioGroupItem value={option.value} id={`duration-${option.value}-${passInfo.tier}`} className="sr-only" />
                    </Label>
                )
              })}
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button
            asChild
            size="lg"
            className="w-full"
            disabled={!selectedPriceInfo}
            data-gtm-id={`${gtmIdPrefix}-purchase-modal-confirm-click`}
          >
            <Link href={selectedPriceInfo?.link ?? '#'} target="_blank" rel="noopener noreferrer">
              <ShoppingCart className="mr-2 h-5 w-5" />
              {selectedPriceInfo ? `${selectedPriceInfo.price.toLocaleString()}원 결제하기` : '기간을 선택해주세요'}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const GymInfoCard = ({ gym, onSelectToggle, onDeselect, isSelected, videoUrl, videoError }: { gym: Gym; onSelectToggle: (id: string) => void; onDeselect: () => void; isSelected: boolean; videoUrl: string | null; videoError: string | null; }) => {
    const isMobile = useIsMobile();
    const parkingInfo = (gym['무료주차시간'] && gym['무료주차시간'] !== 'X')
        ? `무료주차: ${gym['무료주차시간']}`
        : '유료 주차';
    
    return (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-2 md:p-4 animate-in slide-in-from-bottom-10 duration-300">
            <Card className="w-full max-w-7xl mx-auto shadow-2xl border-t-2 border-primary overflow-hidden">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full bg-secondary/50 hover:bg-secondary z-30" onClick={onDeselect}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">정보창 닫기</span>
                </Button>
                <div className="flex flex-row">
                    <div className="w-1/3 aspect-video relative bg-black">
                        {videoError ? (
                            <div className="w-full h-full bg-secondary flex flex-col items-center justify-center p-4 text-center">
                                <Info className="h-6 w-6 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium text-foreground">드론 영상 없음</span>
                                <span className="text-xs text-muted-foreground">{videoError}</span>
                            </div>
                        ) : videoUrl ? (
                            <video
                                key={gym.id}
                                src={videoUrl}
                                preload="metadata"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                             <div className="w-full h-full bg-secondary flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                    <div className="w-2/3 p-4 space-y-3">
                         <div className="flex items-start justify-between">
                            <h3 className="font-bold text-base md:text-lg leading-tight pr-10">{gym.name}</h3>
                            <Badge variant="secondary" className="font-bold">{gym.tier}</Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">{gym.address}</p>
                        <div className="flex gap-2 flex-wrap">
                            {(gym['24시간 운영여부'] && gym['24시간 운영여부'] !== 'X') && (
                                <Badge variant="outline" className="text-xs font-medium"><Clock className="mr-1.5 h-3 w-3" /> 24시간 운영</Badge>
                            )}
                            <Badge variant="outline" className="text-xs font-medium"><Car className="mr-1.5 h-3 w-3" /> {parkingInfo}</Badge>
                        </div>
                         <div className="flex flex-col sm:flex-row gap-2 pt-2">
                           <Button 
                              onClick={() => onSelectToggle(gym.id)}
                              variant={isSelected ? "destructive" : "default"}
                              className="w-full"
                           >
                               {isSelected ? '이 지점 제외' : '이 지점 선택'}
                           </Button>
                           {gym.naverplaceUrl && (
                               <Button asChild variant="outline" className="w-full">
                                   <a href={gym.naverplaceUrl} target="_blank" rel="noopener noreferrer">지점 상세 보기</a>
                               </Button>
                           )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export function BranchLocator({ hideNavigation = false }: { hideNavigation?: boolean }) {
  const ncpKeyId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  const { toast } = useToast();

  // 지점 데이터: Firestore(관리자 편집 반영) + JSON 폴백. 기존 allGyms 형태로 매핑.
  const { gyms: rawGyms } = useGyms();
  const allGyms: Gym[] = useMemo(() => {
    const map = new Map<string, any>();
    (rawGyms as any[]).forEach((gym) => { if (!map.has(gym.c)) map.set(gym.c, gym); });
    return Array.from(map.values()).map((gym: any) => ({
      ...gym,
      id: gym.c,
      tier: normalizeTier(gym.tier),
      naverplaceUrl: gym['naverplace URL'],
      droneVideoUrl: gym.droneVideoUrl,
    }));
  }, [rawGyms]);

  const mapRef = useRef<HTMLDivElement>(null);
  const naverMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userLocationMarkerRef = useRef<any>(null);
  const markerClustererRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  
  const [isMapLoading, setIsMapLoading] = useState(true);
  const isMobile = useIsMobile();

  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [nearbyGyms, setNearbyGyms] = useState<(Gym & { distance: number })[]>([]);

  const [selectedGymIds, setSelectedGymIds] = useState<Set<string>>(new Set());
  const [recommendation, setRecommendation] = useState<GymRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCta, setActiveCta] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const [selectedGymForInfo, setSelectedGymForInfo] = useState<Gym | null>(null);
  const [infoVideoUrl, setInfoVideoUrl] = useState<string | null>(null);
  const [infoVideoError, setInfoVideoError] = useState<string | null>(null);

  const [accessibleGyms, setAccessibleGyms] = useState<Gym[]>([]);
  const [accessibleGymsByRegion, setAccessibleGymsByRegion] = useState<Record<string, Gym[]>>({});
  
  const handleGymSelectionToggle = useCallback((gymId: string) => {
    setSelectedGymIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gymId)) {
        newSet.delete(gymId);
      } else {
        newSet.add(gymId);
      }
      return newSet;
    });
    setActiveCta(null);
  }, []);

  const handlePanToGym = useCallback((gym: Gym) => {
    const map = naverMapRef.current;
    if (map && window.naver && gym.lat && gym.lng) {
        map.morph(new window.naver.maps.LatLng(gym.lat, gym.lng), 15, {
            duration: 800,
            easing: 'easeOutCubic',
        });
        setSelectedGymForInfo(gym);
    }
  }, []);

  const { listTitle, listData } = useMemo(() => {
    if (nearbyGyms.length > 0) {
        return {
            listTitle: `내 주변 지점 (${nearbyGyms.length})`,
            listData: nearbyGyms
        };
    }

    let gyms = allGyms;
    if (selectedRegion !== 'all') {
        gyms = gyms.filter(gym => gym.region === selectedRegion);
    }
    if (selectedTier !== 'all') {
        gyms = gyms.filter(gym => gym.tier === selectedTier);
    }
    if (searchTerm.trim()) {
        gyms = gyms.filter(gym => gym.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    }

    let title = '전체 지점';
    if (selectedRegion !== 'all' || searchTerm.trim() || selectedTier !== 'all') {
        title = '검색 결과';
    }

    return {
        listTitle: `${title} (${gyms.length})`,
        listData: gyms,
    };
  }, [nearbyGyms, selectedRegion, selectedTier, searchTerm, allGyms]);

  useEffect(() => {
    if (!ncpKeyId) {
      console.error("Naver Maps Key ID is not configured.");
      toast({
        variant: 'destructive',
        title: '지도 설정 오류',
        description: '네이버 지도 클라이언트 ID가 설정되지 않았습니다.',
      });
      setIsMapLoading(false);
      return;
    }

    const scriptId = 'naver-map-script';

    const initializeMap = () => {
      if (!mapRef.current || !window.naver?.maps || naverMapRef.current) return;
      
      try {
        const mapInstance = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(37.5665, 126.9780),
          zoom: 7,
          minZoom: 6,
          scaleControl: false,
          mapDataControl: false,
          logoControl: false,
        });
        
        const clickListener = window.naver.maps.Event.addListener(mapInstance, 'click', () => {
          setSelectedGymForInfo(null);
        });

        naverMapRef.current = mapInstance;
        setIsMapReady(true);
        
        // Return a cleanup function
        return () => {
            window.naver.maps.Event.removeListener(clickListener);
        };

      } catch (error) {
        console.error("Error initializing Naver Map:", error);
        toast({
          variant: "destructive",
          title: "지도 생성 오류",
          description: "지도를 만드는 데 실패했습니다. 콘솔을 확인해주세요.",
        });
      } finally {
        setIsMapLoading(false);
      }
    };
    
    let attempts = 0;
    const maxAttempts = 50;

    const pollForScriptReady = () => {
      if ((window as any).ncp?.error) {
        console.error("Naver Maps API Error:", (window as any).ncp.error.message);
        toast({
          variant: 'destructive',
          title: '네이버 지도 API 오류',
          description: `[${(window as any).ncp.error.errorCode}] ${(window as any).ncp.error.message}. 클라이언트 ID를 확인해주세요.`,
        });
        setIsMapLoading(false);
        return;
      }

      if (window.naver?.maps?.Map) {
         initializeMap();
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(pollForScriptReady, 100);
      } else {
        toast({
          variant: 'destructive',
          title: '지도 로딩 시간 초과',
          description: '지도 데이터를 불러오지 못했습니다. 네이버 클라이언트 ID가 유효한지 확인 후 다시 시도해주세요.',
        });
        setIsMapLoading(false);
      }
    };

    if (document.getElementById(scriptId)) {
      pollForScriptReady();
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${ncpKeyId}&submodules=clustering`;
      script.async = true;
      script.onload = pollForScriptReady;
      script.onerror = () => {
        toast({
          variant: 'destructive',
          title: '지도 로딩 실패',
          description: '네이버 지도 스크립트를 불러오는 데 실패했습니다.',
        });
        setIsMapLoading(false);
      };
      document.head.appendChild(script);
    }
  }, [ncpKeyId, toast]);

  useEffect(() => {
        if (!selectedGymForInfo) {
            setInfoVideoUrl(null);
            setInfoVideoError(null);
            return;
        }

        const fetchVideoUrl = async () => {
            setInfoVideoUrl(null);
            setInfoVideoError(null);
            
            const path = normalizeAssetPath(selectedGymForInfo.droneVideoUrl);
            if (!path) {
                setInfoVideoError('미리보기 영상이 없습니다.');
                return;
            }

            try {
                const videoRef = ref(storage, path);
                const url = await getDownloadURL(videoRef);
                setInfoVideoUrl(url);
            } catch (e: any) {
                const code = e?.code || 'unknown';
                const humanReadableError =
                    code === 'storage/object-not-found' ? '영상을 찾을 수 없습니다.' :
                    code === 'storage/unauthorized'     ? '접근 권한이 없습니다.' :
                    code === 'storage/canceled'         ? '요청이 취소되었습니다.' :
                    code === 'storage/retry-limit-exceeded' ? '연결 제한 초과, 재시도 필요.' :
                                                        `로딩 실패 (${code})`;
                setInfoVideoError(humanReadableError);
                console.warn('Video load failed:', e?.code, e?.message);
            }
        };

        fetchVideoUrl();
    }, [selectedGymForInfo]);


  const handleMyLocationClick = () => {
    const map = naverMapRef.current;
    if (!map || !navigator.geolocation) {
        toast({
            variant: 'destructive',
            title: '오류',
            description: '이 브라우저에서는 위치 정보를 사용할 수 없습니다.',
        });
        return;
    }

    setIsLocating(true);
    setSearchTerm('');
    setSelectedRegion('all');
    setSelectedTier('all');

    if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setMap(null);
        userLocationMarkerRef.current = null;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const userLocation = new window.naver.maps.LatLng(latitude, longitude);
            
            map.morph(userLocation, 12);
            
            userLocationMarkerRef.current = new window.naver.maps.Marker({
                position: userLocation,
                map: map,
                icon: {
                    content: `<div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>`,
                    anchor: new window.naver.maps.Point(10, 10),
                },
                zIndex: 200,
            });

            const gymsWithDistance = allGyms
              .map(gym => ({
                ...gym,
                distance: getDistance(latitude, longitude, gym.lat, gym.lng)
              }))
              .filter(gym => gym.distance <= 5)
              .sort((a, b) => a.distance - b.distance);
            
            setNearbyGyms(gymsWithDistance);
            
            toast({ title: '위치 확인', description: `주변 5km 내에 ${gymsWithDistance.length}개의 지점을 찾았습니다.` });
            setIsLocating(false);
        },
        (error) => {
            let description = '위치를 가져오는 중 오류가 발생했습니다.';
            if (error.code === 1) {
                description = '위치 정보 접근이 거부되었습니다. 브라우저 설정을 확인해주세요.';
            }
            toast({ variant: 'destructive', title: '위치 정보 오류', description: description });
            setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const getTierStyling = useCallback((tier: string) => {
    const upperTier = tier.toUpperCase().replace(/\s+/g, '-');
    switch (upperTier) {
      case 'S-PREMIUM': return { color: '#ffffff', background: '#d32f2f', borderColor: '#a02424' };
      case 'PREMIUM': return { color: '#ffffff', background: '#1976d2', borderColor: '#115293' };
      case 'GOLD': return { color: '#000000', background: '#ffa000', borderColor: '#c67c00' };
      case 'SILVER': return { color: '#ffffff', background: '#757575', borderColor: '#545454' };
      case 'BLACK': return { color: '#ffffff', background: '#212121', borderColor: '#000000' };
      default: return { color: '#ffffff', background: '#757575', borderColor: '#545454' };
    }
  }, []);

  const regionOptions = useMemo(() => ['all', ...Array.from(new Set(allGyms.map(gym => gym.region))).sort()], [allGyms]);

  const selectedGymsList = useMemo(() => allGyms.filter(gym => selectedGymIds.has(gym.id)).sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)), [selectedGymIds, allGyms]);
  
  const selectedPassInfo = useMemo(() => passTiers.find(p => p.tier === activeCta), [activeCta]);
  
  useEffect(() => {
    if (selectedGymIds.size === 0) {
      setRecommendation(null);
      setIsLoading(false);
      setActiveCta(null);
      setAccessibleGyms([]);
      setAccessibleGymsByRegion({});
    } else {
      setIsLoading(true);
      setRecommendation(null);
      setActiveCta(null);
      setAccessibleGyms([]);
      setAccessibleGymsByRegion({});
  
      const getRecommendation = async () => {
        try {
          const result = await recommendGymPass({ selectedGymIds: Array.from(selectedGymIds) });
          setRecommendation(result);
          setActiveCta(result.recommendedTier);
        } catch (error) {
          console.error("Error fetching recommendation:", error);
          toast({
            variant: "destructive",
            title: "오류",
            description: "AI 추천을 가져오는 중 문제가 발생했습니다.",
          });
          setRecommendation(null);
        } finally {
          setIsLoading(false);
        }
      };
  
      const timer = setTimeout(getRecommendation, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedGymIds, toast]);

    useEffect(() => {
        if (recommendation?.recommendedTier) {
            const highestTier = recommendation.recommendedTier;
            const highestTierIndex = tierOrder.indexOf(highestTier);

            if (highestTierIndex === -1) {
                setAccessibleGyms([]);
                setAccessibleGymsByRegion({});
                return;
            }

            const availableGyms = allGyms
                .filter(gym => tierOrder.indexOf(gym.tier) >= highestTierIndex)
                .sort((a,b) => a.name.localeCompare(b.name));

            const gymsByRegion = availableGyms.reduce((acc, gym) => {
                const region = shortenRegionName(gym.region);
                if (!acc[region]) {
                    acc[region] = [];
                }
                acc[region].push(gym);
                return acc;
            }, {} as Record<string, Gym[]>);
            
            const sortedGymsByRegion = Object.entries(gymsByRegion)
                .sort((a, b) => b[1].length - a[1].length)
                .reduce((acc, [region, gyms]) => {
                    acc[region] = gyms;
                    return acc;
                }, {} as Record<string, Gym[]>);

            setAccessibleGyms(availableGyms);
            setAccessibleGymsByRegion(sortedGymsByRegion);
        }
  }, [recommendation, allGyms]);

  useEffect(() => {
    const map = naverMapRef.current;
    if (!isMapReady || !map || !window.naver?.maps || selectedRegion === 'all' || nearbyGyms.length > 0) return;

    const gymsInRegion = allGyms.filter(gym => gym.region === selectedRegion && typeof gym.lat === 'number' && typeof gym.lng === 'number');

    if (gymsInRegion.length === 0) return;

    if (gymsInRegion.length === 1) {
        const gym = gymsInRegion[0];
        map.morph(new window.naver.maps.LatLng(gym.lat, gym.lng), 15);
    } else {
        const firstPoint = new window.naver.maps.LatLng(gymsInRegion[0].lat, gymsInRegion[0].lng);
        const bounds = new window.naver.maps.LatLngBounds(firstPoint, firstPoint);
        for (let i = 1; i < gymsInRegion.length; i++) {
            bounds.extend(new window.naver.maps.LatLng(gymsInRegion[i].lat, gymsInRegion[i].lng));
        }
        const padding = { top: 100, right: 100, bottom: 100, left: 100 };
        map.fitBounds(bounds, padding);
    }
  }, [selectedRegion, nearbyGyms, isMapReady, allGyms]);
  
  useEffect(() => {
      const map = naverMapRef.current;
      if (!map) return;
      if (nearbyGyms.length === 0 && searchTerm.length === 0 && selectedRegion === 'all' && selectedTier === 'all') {
          map.morph(new window.naver.maps.LatLng(37.5665, 126.9780), 7);
      }
  }, [nearbyGyms, searchTerm, selectedRegion, selectedTier]);
  
  useEffect(() => {
    const map = naverMapRef.current;
    if (!isMapReady || !map || !window.naver?.maps) return;
  
    if (markerClustererRef.current) {
        markerClustererRef.current.setMap(null);
    }
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  
    const markers: any[] = [];
    listData.forEach((gym: Gym) => {
        if (typeof gym.lat !== 'number' || typeof gym.lng !== 'number') return;
        
        const isSelectedForRec = selectedGymIds.has(gym.id);
        const isSelectedForInfo = selectedGymForInfo?.id === gym.id;

        const style = getTierStyling(gym.tier);

        const shortName = gym.name.replace('헬스보이짐', '').trim();
        const nameFontSize = shortName.length > 6 ? '11px' : '13px';
  
        const pinWithText = `
            <svg width="90" height="48" viewBox="0 0 90 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M45 48C45 48 0 33.816 0 22.2C0 9.936 20.148 0 45 0C69.852 0 90 9.936 90 22.2C90 33.816 45 48 45 48Z" fill="${style.background}"/>
                <text x="45" y="16" text-anchor="middle" dominant-baseline="central" font-family="Pretendard, sans-serif" font-size="${nameFontSize}" font-weight="bold" fill="${style.color}">
                    ${shortName}
                </text>
                <text x="45" y="32" text-anchor="middle" dominant-baseline="central" font-family="Pretendard, sans-serif" font-size="11px" font-weight="500" fill="${style.color}" opacity="0.9">
                    ${gym.tier}
                </text>
            </svg>
        `;

        const markerContent = `
            <div style="
                cursor: pointer; 
                transition: all 0.2s ease-in-out; 
                transform: ${isSelectedForInfo ? 'scale(1.15)' : 'scale(1)'};
                transform-origin: bottom center;
                width: 90px;
                height: 48px;
                filter: ${isSelectedForRec || isSelectedForInfo ? `drop-shadow(0 0 8px hsl(var(--primary)))` : `drop-shadow(0 2px 3px rgba(0,0,0,0.3))`};
            ">
                ${pinWithText}
            </div>
        `;
        
        const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(gym.lat, gym.lng),
            title: `${gym.name} (${gym.tier})`,
            icon: {
              content: markerContent,
              anchor: new window.naver.maps.Point(45, 48),
            },
            zIndex: isSelectedForRec || isSelectedForInfo ? 100 : tierOrder.indexOf(gym.tier) + 1,
        });

        window.naver.maps.Event.addListener(marker, 'click', async () => {
            setSelectedGymForInfo(gym);
        });

        markers.push(marker);
    });

    if (markers.length > 0 && typeof window.naver.maps.MarkerClustering === 'function') {
        const getClusterIcon = (size: number, bgColor: string, borderColor: string) => ({
            content: `<div style="cursor:pointer;width:${size}px;height:${size}px;line-height:${size}px;font-size:14px;color:white;text-align:center;font-weight:bold;background-color:${bgColor};border-radius:50%;border:2px solid ${borderColor}; display: flex; align-items: center; justify-content: center;"></div>`,
            anchor: new window.naver.maps.Point(size/2, size/2)
        });

        const clusterIcons = [
            getClusterIcon(40, 'hsla(var(--primary), 0.8)', 'hsl(var(--background))'),
            getClusterIcon(45, 'hsla(var(--primary), 0.9)', 'hsl(var(--background))'),
            getClusterIcon(50, 'hsl(var(--primary))', 'hsl(var(--background))')
        ];
        
        markerClustererRef.current = new window.naver.maps.MarkerClustering({
            minClusterSize: 2,
            maxZoom: 12,
            map: map,
            markers: markers,
            disableClickZoom: false,
            gridSize: 120,
            icons: clusterIcons,
            stylingFunction: (clusterMarker: any, count: number) => {
                const contentElement = clusterMarker.getElement()?.querySelector('div');
                if (contentElement) {
                    contentElement.textContent = count.toString();
                }
            }
        });
        markersRef.current = markers;
    } else if (markers.length > 0) {
        markers.forEach(marker => marker.setMap(map));
        markersRef.current = markers;
    }
  }, [isMapReady, listData, selectedGymIds, getTierStyling, toast, isMobile, selectedGymForInfo, activeCta]);
  
  const sortedPassTiers = useMemo(() => {
    if (!recommendation) return [];
    
    const { recommendedTier } = recommendation;

    const recommendedPass = passTiers.find(p => p.tier === recommendedTier);
    const otherPasses = passTiers.filter(p => p.tier !== recommendedTier);

    otherPasses.sort((a, b) => {
      return tierDisplayOrder.indexOf(a.tier) - tierDisplayOrder.indexOf(b.tier);
    });

    return recommendedPass ? [recommendedPass, ...otherPasses] : otherPasses;
  }, [recommendation]);
  
  return (
    <>
      <section id="branch-locator" className="w-full py-12 md:py-24 bg-secondary/30 text-foreground">
        <div className="container px-4 md:px-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
            {!hideNavigation && (
                <div className="max-w-7xl mx-auto mb-8">
                    <Button variant="outline" asChild className="hover:bg-primary hover:text-primary-foreground" data-gtm-id="branch-locator-back-home-click">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 가기
                        </Link>
                    </Button>
                </div>
            )}
            
            <div className="flex flex-col items-center justify-center space-y-2 text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                    내가 가는 곳, 바로 내 헬스장!
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                    현재 위치 또는 원하는 지역을 선택해 가장 가까운 헬스보이짐 지점을 찾아보세요.
                </p>
            </div>
            
            <div className="max-w-7xl mx-auto mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="w-full lg:col-span-1">
                    <Label htmlFor="region-filter" className="text-sm font-medium mb-2 block">지역별 검색</Label>
                    <Select value={selectedRegion} onValueChange={(value) => { setSelectedRegion(value); setNearbyGyms([]); }}>
                    <SelectTrigger id="region-filter" className="w-full bg-card border-border/50 text-foreground h-11 focus:ring-primary" data-gtm-id="branch-locator-region-filter-click">
                        <SelectValue placeholder="지역을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                        {regionOptions.map(region => (
                        <SelectItem key={region} value={region} className="focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                            {region === 'all' ? '전체 지역' : region}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="w-full lg:col-span-1">
                    <Label htmlFor="tier-filter" className="text-sm font-medium mb-2 block">등급별 보기</Label>
                    <Select value={selectedTier} onValueChange={(value) => { setSelectedTier(value); setNearbyGyms([]); }}>
                    <SelectTrigger id="tier-filter" className="w-full bg-card border-border/50 text-foreground h-11 focus:ring-primary" data-gtm-id="branch-locator-tier-filter-click">
                        <SelectValue placeholder="등급을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                        <SelectItem value="all">전체 등급</SelectItem>
                        {tierOrder.map(tier => (
                        <SelectItem key={tier} value={tier} className="focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
                            {tier}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="w-full lg:col-span-1">
                    <Label htmlFor="gym-search" className="text-sm font-medium mb-2 block">지점명 검색</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            id="gym-search"
                            placeholder="지점명을 입력하세요"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setNearbyGyms([]);
                            }}
                            className="bg-card border-border/50 text-foreground h-11 focus:ring-primary pl-10"
                        />
                    </div>
                </div>
                <div className="w-full lg:col-span-1">
                    <Button
                        variant="outline"
                        className="w-full h-11 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={handleMyLocationClick}
                        disabled={isLocating}
                        data-gtm-id="branch-locator-my-location-click"
                    >
                        {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
                        현재 위치로 찾기
                    </Button>
                </div>
            </div>
            
            <div className={cn("relative w-full max-w-7xl mx-auto h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-border/50 bg-secondary mb-6 animate-in fade-in duration-500")}>
                <div ref={mapRef} className={cn("w-full h-full")} />
                {isMapLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80 z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground text-lg">지도를 불러오는 중입니다...</p>
                    </div>
                )}
                {selectedGymForInfo && (
                     <GymInfoCard 
                        gym={selectedGymForInfo}
                        onSelectToggle={handleGymSelectionToggle}
                        onDeselect={() => setSelectedGymForInfo(null)}
                        isSelected={selectedGymIds.has(selectedGymForInfo.id)}
                        videoUrl={infoVideoUrl}
                        videoError={infoVideoError}
                     />
                )}
            </div>
            
            <div className="max-w-7xl mx-auto mb-8 animate-in fade-in-50 duration-500">
            <h3 className="text-lg font-semibold mb-3">선택된 지점 ({selectedGymsList.length})</h3>
            {selectedGymsList.length > 0 ? (
                <ScrollArea className="w-full whitespace-nowrap rounded-md">
                    <div className="flex w-max space-x-3 pb-3">
                        {selectedGymsList.map((gym) => (
                            <Badge 
                                key={gym.id}
                                variant="outline"
                                className="text-sm p-2 pr-1 h-9 flex items-center gap-2 border-primary/30 bg-primary/10 transition-all hover:bg-primary/20 hover:border-primary cursor-pointer"
                                onClick={() => handlePanToGym(gym)}
                                title={`${gym.name} 지도로 이동`}
                            >
                                <span className="font-medium">{gym.name}</span>
                                <span className="text-muted-foreground">({gym.tier})</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleGymSelectionToggle(gym.id);
                                    }}
                                    className="rounded-full p-1 -mr-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    aria-label={`${gym.name} 선택 해제`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            ) : (
                <div className="text-center py-4 text-muted-foreground bg-secondary/50 rounded-md">
                    <Info className="inline-block h-5 w-5 mr-2" />
                    지도에서 이용할 지점을 선택하거나, 위에서 지점을 검색하여 목록에 추가해주세요.
                </div>
            )}
            </div>
            
            {isLoading && (
            <div className="max-w-7xl mx-auto my-8 animate-in fade-in-50 duration-500">
                <Card className="bg-card">
                <CardContent className="p-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    <p className="text-xl text-muted-foreground">최적의 플랜을 분석 중입니다...</p>
                    </div>
                </CardContent>
                </Card>
            </div>
            )}

            {!isLoading && recommendation && (
            <div className="max-w-7xl mx-auto my-8 space-y-8 animate-in fade-in-50 duration-500">
                <div>
                <h3 className="text-2xl font-bold tracking-tight text-center mb-2 flex items-center justify-center gap-2">
                    <Lightbulb className="h-7 w-7 text-primary"/> 맞춤 올패스 추천
                </h3>
                <p className="text-muted-foreground text-center mb-6">선택하신 지점을 모두 이용하기 위한 최적의 패스 플랜입니다.</p>
                
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-2 -mx-2">
                    {sortedPassTiers.map((pass) => {
                    const isRecommended = pass.tier === recommendation.recommendedTier;
                    const PassIcon = pass.icon;
                    const currentPassInfo = passTiers.find(p => p.tier === activeCta);
                    let upgradeCostText = '';

                    if (currentPassInfo && tierOrder.indexOf(pass.tier) < tierOrder.indexOf(currentPassInfo.tier)) {
                        const costDifference = pass.price - currentPassInfo.price;
                        if (costDifference > 0) {
                            upgradeCostText = `+ ₩${(pricingData[pass.tier]['1'].price - pricingData[currentPassInfo.tier]['1'].price).toLocaleString()}원 으로 업그레이드`;
                        }
                    }

                    return (
                        <div key={pass.tier} className="snap-center shrink-0 w-full sm:w-[60%] md:w-[45%] lg:w-1/3">
                            <Card 
                            className={cn(
                                "flex flex-col h-full relative overflow-hidden transition-all duration-300 cursor-pointer",
                                activeCta === pass.tier ? "border-2 border-primary shadow-primary/20 shadow-lg" : "bg-card"
                            )}
                            onClick={() => setActiveCta(pass.tier)}
                            data-gtm-id={`branch-locator-recommendation-card-${pass.tier.replace(' ', '-').toLowerCase()}-click`}
                            >
                            {isRecommended && <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-sm py-1 px-3">AI 추천</Badge>}
                            
                            <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
                                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0", pass.iconBg)}>
                                <PassIcon className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                <CardTitle className="text-xl">{pass.koreanName}</CardTitle>
                                <CardDescription className="text-base font-bold text-foreground">₩{pass.price.toLocaleString()}/월</CardDescription>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="flex-grow p-4 pt-0 space-y-3">
                                <div className="border-t border-border/50 pt-3">
                                    <h4 className="font-medium text-sm mb-2 flex items-center">
                                        선택 지점 이용 가능 여부
                                        <span className="group relative ml-1.5">
                                            <CircleHelp className="h-4 w-4 text-muted-foreground" />
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs scale-0 rounded bg-foreground p-2 text-xs text-background transition-all group-hover:scale-100">
                                                {pass.tier} 패스로 선택하신 지점들의 이용 가능 여부입니다.
                                            </span>
                                        </span>
                                    </h4>

                                    <div className="space-y-1.5">
                                    {selectedGymsList.map(gym => {
                                        const passTierIndex = tierOrder.indexOf(pass.tier);
                                        const gymTierIndex = tierOrder.indexOf(gym.tier);
                                        const isAvailable = passTierIndex <= gymTierIndex;
                                        
                                        return (
                                        <div key={gym.id} className="flex items-center justify-between text-sm">
                                            <span className={cn(!isAvailable && "text-muted-foreground line-through")}>{gym.name} ({gym.tier})</span>
                                            {isAvailable ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                                        </div>
                                        );
                                    })}
                                    </div>
                                </div>
                                {upgradeCostText && (
                                    <div className="text-center text-sm font-semibold text-primary bg-primary/10 py-1.5 px-2 rounded-md">
                                        {upgradeCostText}
                                    </div>
                                )}
                            </CardContent>
                            
                            <div className="p-4 pt-0 mt-auto">
                                <Button
                                className="w-full"
                                variant={activeCta === pass.tier ? 'default' : 'outline'}
                                >
                                {activeCta === pass.tier ? "선택됨" : "이 패스 선택하기"}
                                </Button>
                            </div>
                            </Card>
                        </div>
                    );
                    })}
                </div>
                </div>

                <Accordion type="multiple" className="w-full space-y-4">
                <AccordionItem value="reason" className="bg-card border-border/50 rounded-lg data-[state=open]:bg-secondary/50">
                    <AccordionTrigger className="px-4 text-base hover:no-underline data-[state=open]:bg-secondary/70"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> 추천 요약</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-muted-foreground whitespace-pre-line">{recommendation.reason}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="limitations" className="bg-card border-border/50 rounded-lg data-[state=open]:bg-secondary/50">
                    <AccordionTrigger className="px-4 text-base hover:no-underline data-[state=open]:bg-secondary/70"><AlertTriangle className="h-5 w-5 text-destructive mr-2" /> 제한 사항 안내</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-muted-foreground whitespace-pre-line">{recommendation.limitations}</AccordionContent>
                </AccordionItem>
                </Accordion>

                {accessibleGyms.length > 0 && activeCta && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4 text-center sm:text-left">
                    <span className="text-primary">{activeCta}</span> 패스로 이용 가능한 전체 지점 ({accessibleGyms.length}개)
                    </h3>
                    <Card className="bg-secondary/50">
                    <CardContent className="p-4">
                        {Object.keys(accessibleGymsByRegion).length > 0 ? (
                        <Tabs defaultValue={Object.keys(accessibleGymsByRegion)[0]} className="w-full">
                            <ScrollArea className="w-full whitespace-nowrap">
                            <TabsList className="h-auto justify-start p-1 bg-transparent">
                                {Object.entries(accessibleGymsByRegion).map(([region, gyms]) => (
                                <TabsTrigger key={region} value={region}>
                                    {region} ({gyms.length})
                                </TabsTrigger>
                                ))}
                            </TabsList>
                            <ScrollBar orientation="horizontal" className="mt-2"/>
                            </ScrollArea>
                            {Object.entries(accessibleGymsByRegion).map(([region, gyms]) => (
                            <TabsContent key={region} value={region} className="mt-4">
                                <ScrollArea className="h-48">
                                <div className="flex flex-wrap gap-1.5 pr-3">
                                    {gyms.map(gym => (
                                    <Badge 
                                        key={gym.id} 
                                        variant="outline" 
                                        className="font-normal bg-card border-border/50 cursor-pointer hover:bg-primary/20 hover:border-primary"
                                        onClick={() => handlePanToGym(gym)}
                                        title={`${gym.name} 지도로 이동`}
                                    >
                                        {gym.name.replace('헬스보이짐', '').trim()}
                                    </Badge>
                                    ))}
                                </div>
                                </ScrollArea>
                            </TabsContent>
                            ))}
                        </Tabs>
                        ) : (
                        <p className="text-center text-muted-foreground py-4">이용 가능한 지점이 없습니다.</p>
                        )}
                    </CardContent>
                    </Card>
                </div>
                )}
            </div>
            )}
            
            <div className="max-w-7xl mx-auto mt-8">
            <Accordion type="single" collapsible className="w-full" defaultValue="gym-list">
                <AccordionItem value="gym-list" className="border-none">
                <AccordionTrigger className="text-xl font-semibold hover:no-underline" data-gtm-id="branch-locator-gym-list-accordion-click">{listTitle}</AccordionTrigger>
                <AccordionContent>
                    <ScrollArea className="h-[400px] border rounded-md">
                    <div className="p-1">
                        {listData.length > 0 ? (
                        <div className="space-y-1">
                            {(listData as (Gym & { distance?: number })[]).map(gym => (
                            <div key={gym.id} className="flex justify-between items-center p-3 rounded-md hover:bg-secondary/50 cursor-pointer" onClick={() => handlePanToGym(gym)}>
                                <div className="flex-1 min-w-0 pr-4">
                                <div className="font-semibold truncate">{gym.name} <Badge variant="secondary" className="font-normal">{gym.tier}</Badge></div>
                                <p className="text-sm text-muted-foreground truncate">{gym.address}</p>
                                {gym.distance !== undefined && (
                                    <p className="text-sm text-primary font-medium">약 {gym.distance.toFixed(1)}km</p>
                                )}
                                </div>
                                <Button 
                                size="sm"
                                variant={selectedGymIds.has(gym.id) ? "destructive" : "outline"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleGymSelectionToggle(gym.id);
                                }}
                                className="shrink-0"
                                data-gtm-id={`branch-locator-list-select-gym-${selectedGymIds.has(gym.id) ? 'remove' : 'add'}-click`}
                                >
                                {selectedGymIds.has(gym.id) ? '선택 해제' : '선택'}
                                </Button>
                            </div>
                            ))}
                        </div>
                        ) : (
                        <p className="text-center text-muted-foreground py-16">검색 결과가 없습니다.</p>
                        )}
                    </div>
                    </ScrollArea>
                </AccordionContent>
                </AccordionItem>
            </Accordion>
            </div>
        </div>

        {activeCta && selectedPassInfo && (
            <div className="sticky bottom-0 left-0 right-0 z-20 mt-8 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-card border-t-2 border-primary shadow-2xl p-4 container">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className='text-center sm:text-left'>
                    <p className="font-semibold text-lg text-primary">{selectedPassInfo.koreanName} 선택됨</p>
                    <p className="text-muted-foreground text-sm">
                    월 ₩{pricingData[selectedPassInfo.tier]['1'].price.toLocaleString()}부터 최고의 운동 경험을 시작하세요!
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <PurchaseModal passInfo={selectedPassInfo} gtmIdPrefix="branch-locator-cta">
                        <Button size="lg" className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90" data-gtm-id={`branch-locator-cta-purchase-${selectedPassInfo.tier.replace(' ', '-').toLowerCase()}-click`}>
                        <CheckCircle className="mr-2 h-5 w-5" /> {selectedPassInfo.koreanName}로 신청하기
                        </Button>
                    </PurchaseModal>
                </div>
                </div>
            </div>
            </div>
        )}
      </section>
    </>
  );
}
