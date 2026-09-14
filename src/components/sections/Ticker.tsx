// 브랜드 티커 마퀴 — ② 영역 시작을 알리는 생동감 요소. 흐르는 문구 + 골드 별표.
const PHRASES = ['YOUR CITY. YOUR GYM.', '내가 가는 곳이 헬스장.', 'ONE ALL PASS.', '전국 71개 지점.'];

function Row() {
  return (
    <>
      {PHRASES.map((t, i) => (
        <span key={i} className="mx-4">
          {t}
          <b className="mx-4 text-primary">✳</b>
        </span>
      ))}
    </>
  );
}

export function Ticker() {
  return (
    <div className="hb-ticker" aria-hidden="true">
      <div className="hb-ticker__run">
        <Row />
        <Row />
      </div>
      <style>{`
        .hb-ticker{overflow:hidden;white-space:nowrap;background:hsl(var(--secondary));
          border-top:1px solid hsl(var(--border));border-bottom:1px solid hsl(var(--border));}
        .hb-ticker__run{display:inline-block;padding:14px 0;font-size:15px;font-weight:900;
          letter-spacing:.1em;color:hsl(var(--muted-foreground));animation:hb-marq 28s linear infinite;}
        @keyframes hb-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @media (prefers-reduced-motion:reduce){.hb-ticker__run{animation:none}}
      `}</style>
    </div>
  );
}
