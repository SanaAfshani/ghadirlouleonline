import { useId } from 'react';

export type IllustrationKind = 'material' | 'size' | 'strength' | 'joint' | 'delivery' | 'warranty' | 'lifetime' | 'usage';

/**
 * تصویرسازی برداری هر مشخصه: لوله دوجداره مشکی با جداره داخلی زرد + نماد مشخصه (کولیس، سپر، کوپلر، گرانول، کامیون...).
 * SVG خودمان است — بدون فایل، تیز در هر اندازه، و در تم روشن و تیره یکسان.
 */
export function SpecIllustration({ kind, className }: { kind: IllustrationKind; className?: string }) {
  const id = useId().replace(/:/g, '');
  const g = (name: string) => `${id}-${name}`;
  const url = (name: string) => `url(#${g(name)})`;

  /** لوله افقی موج‌دار: بدنه با سایه استوانه‌ای، شیارها، دهانه چپ با جداره زرد */
  const pipe = (x: number, y: number, len: number, r: number, key?: string) => {
    const rx = r * 0.42;
    const ribs = Math.floor((len - 6) / 7);
    return (
      <g key={key}>
        <path d={`M${x} ${y - r} H${x + len} A${rx} ${r} 0 0 1 ${x + len} ${y + r} H${x} Z`} fill={url('body')} />
        {Array.from({ length: ribs }, (_, i) => (
          <path key={i} d={`M${x + 8 + i * 7} ${y - r + 1} V${y + r - 1}`} stroke="#000" strokeOpacity="0.35" strokeWidth="2.2" />
        ))}
        {Array.from({ length: ribs }, (_, i) => (
          <path key={`h${i}`} d={`M${x + 10 + i * 7} ${y - r + 2} V${y - r * 0.2}`} stroke="#fff" strokeOpacity="0.16" strokeWidth="1.4" />
        ))}
        <ellipse cx={x} cy={y} rx={rx} ry={r} fill="#0b0f14" />
        <ellipse cx={x} cy={y} rx={rx - 2.6} ry={r - 3.4} fill={url('inner')} />
        <ellipse cx={x + 1.6} cy={y + 1} rx={rx - 5} ry={r - 7} fill="#b45309" fillOpacity="0.35" />
      </g>
    );
  };

  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden>
      <defs>
        <linearGradient id={g('body')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4b5563" />
          <stop offset="0.35" stopColor="#1f2937" />
          <stop offset="1" stopColor="#0b0f14" />
        </linearGradient>
        <radialGradient id={g('inner')} cx="0.6" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="0.7" stopColor="#facc15" />
          <stop offset="1" stopColor="#ca8a04" />
        </radialGradient>
        <linearGradient id={g('gold')} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={g('steel')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f1f5f9" />
          <stop offset="0.5" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#64748b" />
        </linearGradient>
        <radialGradient id={g('bead')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#6b7280" />
          <stop offset="0.5" stopColor="#1f2937" />
          <stop offset="1" stopColor="#030712" />
        </radialGradient>
        <linearGradient id={g('water')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {/* سایه زمین */}
      <ellipse cx="60" cy="82" rx="46" ry="5" fill="#000" fillOpacity="0.12" />

      {kind === 'material' && (
        <g>
          {/* کپه گرانول مواد اولیه */}
          {[
            [30, 72], [42, 74], [54, 75], [66, 74], [78, 72], [36, 64], [48, 65], [60, 66], [72, 64], [42, 56], [54, 57], [66, 56], [48, 48], [60, 49],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="6.5" fill={url('bead')} />
              <circle cx={cx - 2.2} cy={cy - 2.4} r="1.6" fill="#fff" fillOpacity="0.55" />
            </g>
          ))}
          {/* مولکول */}
          <path d="M84 22 L98 14 M84 22 L96 34 M84 22 L72 30" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="84" cy="22" r="6" fill={url('gold')} />
          <circle cx="98" cy="14" r="4.5" fill={url('steel')} />
          <circle cx="96" cy="34" r="4.5" fill="#1f2937" />
          <circle cx="72" cy="30" r="4" fill={url('steel')} />
          {/* برگ — مواد قابل بازیافت */}
          <path d="M92 58 C100 48 112 50 112 50 C110 62 100 66 92 58 Z" fill="#facc15" />
          <path d="M92 58 C99 55 105 53 110 51" stroke="#a16207" strokeWidth="1.2" fill="none" />
        </g>
      )}

      {kind === 'size' && (
        <g>
          {pipe(22, 56, 72, 18)}
          {/* کولیس */}
          <g transform="rotate(-14 70 22)">
            <rect x="26" y="16" width="86" height="11" rx="2" fill={url('steel')} />
            <rect x="30" y="19" width="64" height="5" rx="1" fill="#facc15" />
            {Array.from({ length: 16 }, (_, i) => (
              <path key={i} d={`M${32 + i * 4} 19 V${i % 2 ? 22 : 24}`} stroke="#713f12" strokeWidth="0.9" />
            ))}
            <path d="M28 27 L28 46 L36 46 L36 27 Z" fill={url('steel')} />
            <path d="M48 27 L48 42 L56 42 L56 27 Z" fill={url('steel')} />
            <rect x="44" y="12" width="16" height="19" rx="3" fill="#334155" />
            <path d="M28 16 L30 6 L34 6 L36 16 Z" fill={url('steel')} />
          </g>
        </g>
      )}

      {kind === 'strength' && (
        <g>
          {/* سپر */}
          <path d="M70 8 L102 18 V42 C102 60 88 72 70 80 C52 72 38 60 38 42 V18 Z" fill="#0b0f14" stroke={url('gold')} strokeWidth="5" strokeLinejoin="round" />
          <path d="M70 15 L95 23 V42 C95 55 85 65 70 72" stroke="#fff" strokeOpacity="0.12" strokeWidth="3" fill="none" />
          {pipe(16, 54, 70, 16)}
        </g>
      )}

      {kind === 'joint' && (
        <g>
          {pipe(10, 48, 46, 15, 'a')}
          {pipe(66, 48, 44, 15, 'b')}
          {/* کوپلر با واشر آب‌بند */}
          <rect x="52" y="30" width="20" height="36" rx="4" fill={url('body')} />
          <rect x="52" y="30" width="20" height="36" rx="4" fill="none" stroke="#000" strokeOpacity="0.4" />
          <rect x="53" y="33" width="3" height="30" rx="1.5" fill="#facc15" />
          <rect x="68" y="33" width="3" height="30" rx="1.5" fill="#facc15" />
          <path d="M60 32 V64" stroke="#fff" strokeOpacity="0.18" strokeWidth="2" />
          {/* درخشش آب‌بندی */}
          <path d="M80 20 L82 25 L87 27 L82 29 L80 34 L78 29 L73 27 L78 25 Z" fill="#facc15" />
        </g>
      )}

      {kind === 'delivery' && (
        <g>
          {/* نشانگر مقصد */}
          <path d="M96 4 C88 4 83 10 83 17 C83 26 96 38 96 38 C96 38 109 26 109 17 C109 10 104 4 96 4 Z" fill={url('gold')} />
          <circle cx="96" cy="17" r="5" fill="#fff" />
          {/* کامیون */}
          <rect x="8" y="40" width="68" height="26" rx="3" fill="#334155" />
          {[[18, 50], [32, 50], [46, 50], [60, 50], [25, 38], [39, 38], [53, 38]].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="7" fill="#0b0f14" />
              <circle cx={cx} cy={cy} r="4.5" fill={url('inner')} />
            </g>
          ))}
          <path d="M78 46 H96 L106 58 V70 H78 Z" fill="#475569" />
          <path d="M82 50 H94 L101 59 H82 Z" fill="#bae6fd" />
          <rect x="6" y="66" width="102" height="5" rx="2" fill="#1e293b" />
          {[24, 44, 92].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="73" r="7" fill="#0b0f14" />
              <circle cx={cx} cy="73" r="3" fill={url('steel')} />
            </g>
          ))}
        </g>
      )}

      {kind === 'warranty' && (
        <g>
          {/* نشان کیفیت */}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI * 2) / 12;
            // گرد شده: رقم آخر Math.sin در سرور و مرورگر فرق می‌کند و hydration mismatch می‌داد
            return <circle key={i} cx={Math.round((60 + Math.cos(a) * 26) * 100) / 100} cy={Math.round((40 + Math.sin(a) * 26) * 100) / 100} r="9" fill={url('gold')} />;
          })}
          <circle cx="60" cy="40" r="27" fill={url('gold')} />
          <circle cx="60" cy="40" r="20" fill="#0b0f14" />
          <path d="M50 40 L57 47 L71 33" stroke="#facc15" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M44 62 L38 84 L48 78 L54 86 L58 66 Z M76 62 L82 84 L72 78 L66 86 L62 66 Z" fill="#b45309" />
        </g>
      )}

      {kind === 'lifetime' && (
        <g>
          {pipe(14, 58, 60, 15)}
          {/* ساعت شنی */}
          <rect x="78" y="8" width="30" height="5" rx="2" fill={url('gold')} />
          <rect x="78" y="63" width="30" height="5" rx="2" fill={url('gold')} />
          <path d="M82 13 H104 C104 26 96 32 93 38 C96 44 104 50 104 63 H82 C82 50 90 44 93 38 C90 32 82 26 82 13 Z" fill="#e0f2fe" fillOpacity="0.85" stroke="#64748b" strokeWidth="1.5" />
          <path d="M86 20 H100 C99 27 95 31 93 34 C91 31 87 27 86 20 Z" fill="#facc15" />
          <path d="M86 61 C88 53 91 51 93 50 C95 51 98 53 100 61 Z" fill="#facc15" />
        </g>
      )}

      {kind === 'usage' && (
        <g>
          {pipe(40, 34, 68, 18)}
          {/* جریان آب از دهانه */}
          <path d="M34 28 C20 32 14 46 16 62 C24 56 30 48 40 46 Z" fill={url('water')} />
          <path d="M24 40 C20 48 20 56 22 62" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="22" cy="74" rx="20" ry="6" fill={url('water')} fillOpacity="0.8" />
          <circle cx="10" cy="64" r="2.5" fill="#38bdf8" />
          <circle cx="36" cy="66" r="2" fill="#38bdf8" />
        </g>
      )}
    </svg>
  );
}
