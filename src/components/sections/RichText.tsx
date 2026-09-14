import { cn } from '@/lib/utils';

/**
 * 가벼운 마크다운 렌더러(관리자 입력 텍스트용).
 * 지원: **굵게**, 줄바꿈(문단), 줄 앞의 "- " 또는 "* "는 목록 항목.
 * HTML 주입 방지를 위해 원문을 이스케이프한 뒤 **굵게**만 <strong>으로 변환한다.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineHtml(s: string): string {
  return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const lines = (text ?? '').split('\n');
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1">
        {bullets.map((b, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: inlineHtml(b) }} />
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const m = line.match(/^\s*[-*]\s+(.*)$/);
    if (m) {
      bullets.push(m[1]);
    } else {
      flush(String(idx));
      if (line.trim()) {
        blocks.push(<p key={`p-${idx}`} dangerouslySetInnerHTML={{ __html: inlineHtml(line) }} />);
      }
    }
  });
  flush('end');

  return <div className={cn('space-y-2', className)}>{blocks}</div>;
}
