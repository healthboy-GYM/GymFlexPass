import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { FloatingCTAButton } from '@/components/layout/FloatingCTAButton';
import { BranchNoticeBanner } from '@/components/layout/YongmunNoticeBanner';
import { TrackingScripts } from '@/components/layout/TrackingScripts';
import Script from 'next/script';
import { cn } from '@/lib/utils';

const SITE_TITLE = '헬스보이짐 | 헬보 올패스 (헬보올패스)';
const SITE_DESCRIPTION =
  '헬스보이짐의 새로운 통합 이용권, 헬보올패스! 헬보 올패스 하나로 집, 회사, 여행지 어디서든 전국 80여개 지점을 자유롭게 이용하세요.';

export const metadata: Metadata = {
  metadataBase: new URL('https://healthboypass.co.kr'),
  title: {
    default: SITE_TITLE,
    template: '%s | 헬보 올패스',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'ko_KR',
    siteName: '헬보 올패스',
  },
  verification: {
    google: '5OoD-k-2A5p5_82f1lP5t9-b1E_m3gD4R6c-b3a3p2Y',
    other: {
      'naver-site-verification': '41b4c92a953e96d91789c1f9c8f2a47b1d16e9a6',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-K95PV25N');`}
        </Script>

        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '734905996032646');
          fbq('track', 'PageView');`}
        </Script>

        <Script id="naver-analytics-loader" type="text/javascript" src="//wcs.naver.net/wcslog.js" strategy="afterInteractive"></Script>

        <Script
          id="karrot-pixel-sdk"
          src="//business-api.kr.karrotmarket.com/assets/karrot-pixel.umd.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={cn("antialiased")}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K95PV25N"
            height="0"
            width="0"
            style={{display: 'none', visibility: 'hidden'}}>
          </iframe>
        </noscript>
        <noscript>
          <img
            height="1"
            width="1"
            style={{display:'none'}}
            src="https://www.facebook.com/tr?id=734905996032646&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <TrackingScripts />
        <BranchNoticeBanner />
        {children}
        <Toaster />
        <FloatingCTAButton />
      </body>
    </html>
  );
}
