import { useId, type ReactNode } from 'react';

export type IllustrationKind =
  | 'material' | 'size' | 'height' | 'strength' | 'pressure' | 'joint' | 'delivery' | 'warranty' | 'lifetime' | 'usage'
  | 'types' | 'feature' | 'uv' | 'flow' | 'length' | 'surface' | 'angle' | 'coating' | 'eco';

/** خود محصول که در هر کارت کشیده می‌شود — مثل منهول زرد کنار کولیس، نه یک لوله ثابت برای همه */
export type Subject =
  | 'corrugated' | 'spiral' | 'drainage' | 'pe' | 'pvc' | 'pushfit' | 'concrete' | 'ductile' | 'well'
  | 'manhole' | 'septic' | 'fitting-pe' | 'fitting-corrugated' | 'fitting-pvc' | 'coil' | 'drip-kit'
  | 'valve' | 'sprinkler';

/** دسته (و برای اسپیرال و اتصالات، خود محصول) → شکل محصول */
export function subjectFor(categorySlug: string, productSlug: string): Subject {
  if (/spiral|aspiral/.test(productSlug)) return 'spiral';
  if (categorySlug === 'fittings') return /corrugat|karogit/.test(productSlug) ? 'fitting-corrugated' : /pvc/.test(productSlug) ? 'fitting-pvc' : 'fitting-pe';
  const byCategory: Record<string, Subject> = {
    'corrugated-pipes': 'corrugated',
    'drainage-pipes': 'drainage',
    'polyethylene-pipes': 'pe',
    'pvc-pipes': 'pvc',
    'push-fit-pipes': 'pushfit',
    'concrete-pipes': 'concrete',
    'cast-iron-pipes': 'ductile',
    'well-casing-pipes': 'well',
    manholes: 'manhole',
    'septic-tanks': 'septic',
    'drip-irrigation-pipes': 'coil',
    'drip-irrigation-equipment': 'drip-kit',
    'polymer-valves': 'valve',
    'sprinkler-irrigation-equipment': 'sprinkler',
    'layflat-hose': 'coil',
  };
  return byCategory[categorySlug] ?? 'corrugated';
}

type Palette = { hi: string; mid: string; lo: string; inner: string; innerLo: string };

const BLACK: Palette = { hi: '#4b5563', mid: '#1f2937', lo: '#0b0f14', inner: '#facc15', innerLo: '#ca8a04' };
const PALETTES: Record<Subject, Palette> = {
  corrugated: BLACK,
  spiral: BLACK,
  drainage: { hi: '#fde68a', mid: '#f59e0b', lo: '#b45309', inner: '#fef3c7', innerLo: '#f59e0b' },
  pe: { hi: '#4b5563', mid: '#1f2937', lo: '#0b0f14', inner: '#374151', innerLo: '#111827' },
  pvc: { hi: '#f1f5f9', mid: '#94a3b8', lo: '#475569', inner: '#e2e8f0', innerLo: '#94a3b8' },
  pushfit: { hi: '#ffffff', mid: '#cbd5e1', lo: '#64748b', inner: '#f8fafc', innerLo: '#cbd5e1' },
  concrete: { hi: '#e7e5e4', mid: '#a8a29e', lo: '#57534e', inner: '#78716c', innerLo: '#44403c' },
  ductile: { hi: '#64748b', mid: '#1e3a5f', lo: '#0f172a', inner: '#d1d5db', innerLo: '#9ca3af' },
  well: { hi: '#93c5fd', mid: '#2563eb', lo: '#1e3a8a', inner: '#bfdbfe', innerLo: '#3b82f6' },
  manhole: { hi: '#fef08a', mid: '#facc15', lo: '#a16207', inner: '#fde047', innerLo: '#ca8a04' },
  // مخزن مشکی با درب سبز — مثل عکس اصلی محصول
  septic: { hi: '#4b5563', mid: '#1f2937', lo: '#0b0f14', inner: '#374151', innerLo: '#111827' },
  'fitting-pe': { hi: '#4b5563', mid: '#1f2937', lo: '#0b0f14', inner: '#374151', innerLo: '#111827' },
  'fitting-corrugated': BLACK,
  'fitting-pvc': { hi: '#f1f5f9', mid: '#94a3b8', lo: '#475569', inner: '#e2e8f0', innerLo: '#94a3b8' },
  coil: { hi: '#4b5563', mid: '#1f2937', lo: '#0b0f14', inner: '#374151', innerLo: '#111827' },
  'drip-kit': { hi: '#4b5563', mid: '#1f2937', lo: '#0b0f14', inner: '#374151', innerLo: '#111827' },
  // بدنه مشکی پلیمری با دسته زرد — مثل شیر توپی واقعی
  valve: { hi: '#4b5563', mid: '#1f2937', lo: '#0b0f14', inner: '#374151', innerLo: '#111827' },
  // آبپاش نارنجی روی رایزر زرد
  sprinkler: { hi: '#fdba74', mid: '#ea580c', lo: '#9a3412', inner: '#fed7aa', innerLo: '#f97316' },
};

/** رنگ گرانول مواد اولیه کنار هر محصول */
const BEAD: Partial<Record<Subject, [string, string]>> = {
  pvc: ['#f8fafc', '#94a3b8'],
  pushfit: ['#f8fafc', '#94a3b8'],
  'fitting-pvc': ['#f8fafc', '#94a3b8'],
  concrete: ['#d6d3d1', '#78716c'],
  ductile: ['#94a3b8', '#334155'],
  manhole: ['#fef08a', '#ca8a04'],
  drainage: ['#fde68a', '#d97706'],
  well: ['#bfdbfe', '#2563eb'],
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * تصویرسازی برداری هر مشخصه با شکل خود محصول (منهول، سپتیک، لوله کاروگیت، پلی اتیلن، پلیکا، اتصالات، کلاف قطره‌ای...)
 * + نماد مشخصه (کولیس، سپر، فشارسنج، گرانول، کامیون، ساعت شنی...). SVG خودمان است — تیز در هر اندازه، بدون فایل.
 */
export function SpecIllustration({ kind, subject = 'corrugated', className }: { kind: IllustrationKind; subject?: Subject; className?: string }) {
  const id = useId().replace(/:/g, '');
  const g = (name: string) => `${id}-${name}`;
  const url = (name: string) => `url(#${g(name)})`;
  const p = PALETTES[subject];
  const [beadHi, beadLo] = BEAD[subject] ?? ['#6b7280', '#030712'];

  /** لوله افقی موج‌دار (کاروگیت، اسپیرال، زهکش) */
  const ribbed = (x: number, y: number, len: number, r: number, opts: { slant?: boolean; holes?: boolean } = {}) => {
    const rx = r * 0.42;
    const ribs = Math.floor((len - 6) / 7);
    return (
      <g>
        <path d={`M${x} ${y - r} H${x + len} A${rx} ${r} 0 0 1 ${x + len} ${y + r} H${x} Z`} fill={url('body')} />
        {Array.from({ length: ribs }, (_, i) => (
          <path key={i} d={`M${x + 8 + i * 7} ${y - r + 1} L${x + 8 + i * 7 + (opts.slant ? 5 : 0)} ${y + r - 1}`} stroke="#000" strokeOpacity="0.35" strokeWidth="2.2" />
        ))}
        {Array.from({ length: ribs }, (_, i) => (
          <path key={`h${i}`} d={`M${x + 10 + i * 7} ${y - r + 2} V${y - r * 0.2}`} stroke="#fff" strokeOpacity="0.16" strokeWidth="1.4" />
        ))}
        {opts.holes &&
          Array.from({ length: ribs - 1 }, (_, i) => <ellipse key={`o${i}`} cx={x + 11.5 + i * 7} cy={y + r * 0.35} rx="1.1" ry="2.2" fill="#78350f" />)}
        <ellipse cx={x} cy={y} rx={rx} ry={r} fill={p.lo} />
        <ellipse cx={x} cy={y} rx={rx - 2.6} ry={r - 3.4} fill={url('inner')} />
        <ellipse cx={x + 1.6} cy={y + 1} rx={rx - 5} ry={r - 7} fill="#000" fillOpacity="0.18" />
      </g>
    );
  };

  /** لوله افقی صاف (پلی اتیلن، پلیکا، بتنی، چدن، جدار چاه، پوش فیت) */
  const smooth = (x: number, y: number, len: number, r: number, opts: { wall?: number; stripe?: string; socket?: boolean; slots?: boolean; grain?: boolean } = {}) => {
    const rx = r * 0.42;
    const wall = opts.wall ?? 2.6;
    const sr = r + 2.6;
    return (
      <g>
        <path d={`M${x} ${y - r} H${x + len} A${rx} ${r} 0 0 1 ${x + len} ${y + r} H${x} Z`} fill={url('body')} />
        <path d={`M${x + 3} ${y - r + 3.5} H${x + len - 2}`} stroke="#fff" strokeOpacity="0.28" strokeWidth="2.2" strokeLinecap="round" />
        {opts.stripe && <path d={`M${x} ${y - r * 0.45} H${x + len}`} stroke={opts.stripe} strokeWidth="2.6" />}
        {opts.stripe && <path d={`M${x} ${y + r * 0.2} H${x + len}`} stroke={opts.stripe} strokeWidth="1.4" strokeOpacity="0.8" />}
        {opts.slots &&
          Array.from({ length: 5 }, (_, i) =>
            [-0.45, 0.1].map((dy) => <rect key={`${i}${dy}`} x={x + 9 + i * 7} y={y + r * dy} width="1.8" height={r * 0.32} rx="0.9" fill={p.lo} fillOpacity="0.85" />),
          )}
        {opts.grain &&
          [[0.2, -0.5], [0.4, 0.2], [0.55, -0.3], [0.7, 0.45], [0.85, -0.1], [0.3, 0.55], [0.62, 0.05]].map(([fx, fy], i) => (
            <circle key={i} cx={r2(x + len * fx)} cy={r2(y + r * fy)} r="0.9" fill={p.lo} fillOpacity="0.55" />
          ))}
        {opts.socket && (
          <g>
            <path d={`M${x + len - 11} ${y - sr} H${x + len} A${sr * 0.42} ${sr} 0 0 1 ${x + len} ${y + sr} H${x + len - 11} Z`} fill={url('body')} />
            <path d={`M${x + len - 11} ${y - sr} V${y + sr}`} stroke={p.lo} strokeOpacity="0.6" strokeWidth="1.2" />
            {subject === 'pushfit' && <path d={`M${x + len - 5} ${y - sr + 0.5} V${y + sr - 0.5}`} stroke="#22c55e" strokeWidth="1.8" />}
          </g>
        )}
        <ellipse cx={x} cy={y} rx={rx} ry={r} fill={p.lo} />
        <ellipse cx={x} cy={y} rx={rx - wall} ry={r - wall * 1.3} fill={url('inner')} />
        <ellipse cx={x + 1.4} cy={y + 1} rx={Math.max(rx - wall - 2.4, 1)} ry={r - wall * 1.3 - 3} fill="#000" fillOpacity="0.2" />
      </g>
    );
  };

  /** خود محصول در قاب ۶۴×۴۸ */
  const product = (): ReactNode => {
    switch (subject) {
      case 'corrugated':
        return ribbed(10, 24, 46, 20);
      case 'spiral':
        return ribbed(10, 24, 46, 21, { slant: true });
      case 'drainage':
        return ribbed(10, 24, 46, 18, { holes: true });
      case 'pe':
        return smooth(10, 24, 46, 18, { stripe: '#3b82f6' });
      case 'pvc':
        return smooth(10, 24, 42, 17, { socket: true });
      case 'pushfit':
        return smooth(10, 24, 42, 15, { socket: true });
      case 'concrete':
        return smooth(10, 24, 44, 20, { wall: 5, grain: true });
      case 'ductile':
        return smooth(10, 24, 42, 17, { wall: 3.4, socket: true });
      case 'well':
        return smooth(10, 24, 44, 17, { slots: true, socket: true });
      case 'manhole':
        return (
          <g>
            <path d="M12 26 V45 A20 4 0 0 0 52 45 V26 Z" fill={url('bodyX')} />
            {[30, 34.5, 39].map((y) => (
              <path key={y} d={`M12 ${y} Q32 ${y + 4} 52 ${y}`} stroke={p.lo} strokeOpacity="0.45" strokeWidth="1.6" fill="none" />
            ))}
            <path d="M12 26 L22 13 H42 L52 26 Z" fill={url('bodyX')} />
            <path d="M12 26 Q32 30 52 26" stroke={p.lo} strokeOpacity="0.5" strokeWidth="1.4" fill="none" />
            <rect x="22" y="4" width="20" height="9" fill={url('bodyX')} />
            <path d="M22 9 Q32 11 42 9" stroke={p.lo} strokeOpacity="0.45" strokeWidth="1.2" fill="none" />
            <ellipse cx="32" cy="4" rx="10" ry="2.6" fill={p.hi} stroke={p.lo} strokeOpacity="0.5" strokeWidth="0.8" />
            <rect x="28" y="17" width="8" height="5" rx="1" fill={p.lo} fillOpacity="0.35" />
          </g>
        );
      case 'septic':
        return (
          <g>
            <rect x="0" y="28" width="6" height="5" rx="1" fill="#334155" />
            <rect x="58" y="31" width="6" height="5" rx="1" fill="#334155" />
            <rect x="4" y="17" width="56" height="29" rx="14.5" fill={url('body')} />
            {[16, 24, 32, 40, 48].map((x) => (
              <path key={x} d={`M${x} 18 Q${x + 3} 31.5 ${x} 45`} stroke={p.lo} strokeOpacity="0.4" strokeWidth="1.8" fill="none" />
            ))}
            <path d="M12 21 H52" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
            <rect x="25" y="8" width="14" height="10" fill={url('bodyX')} />
            <ellipse cx="32" cy="8" rx="8" ry="2.6" fill="#16a34a" stroke="#14532d" strokeWidth="0.8" />
            <ellipse cx="32" cy="7.4" rx="5.5" ry="1.4" fill="#4ade80" fillOpacity="0.7" />
          </g>
        );
      case 'fitting-pe':
      case 'fitting-corrugated':
      case 'fitting-pvc': {
        const elbow = 'M6 38 H24 Q40 38 40 22 V6';
        return (
          <g>
            <path d={elbow} stroke={p.lo} strokeWidth="18" fill="none" />
            <path d={elbow} stroke={url('body')} strokeWidth="15" fill="none" />
            <path d="M8 33 H24 Q35 33 35 22 V8" stroke="#fff" strokeOpacity="0.22" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            {subject === 'fitting-corrugated' &&
              [12, 18].map((x) => <path key={x} d={`M${x} 30 V46`} stroke="#000" strokeOpacity="0.4" strokeWidth="2" />)}
            {subject === 'fitting-corrugated' &&
              [12, 18].map((y) => <path key={`v${y}`} d={`M32 ${y} H48`} stroke="#000" strokeOpacity="0.4" strokeWidth="2" />)}
            <ellipse cx="6" cy="38" rx="3.6" ry="9" fill={p.lo} />
            <ellipse cx="6" cy="38" rx="2" ry="6.2" fill={url('inner')} />
            <ellipse cx="40" cy="6" rx="9" ry="3.6" fill={p.lo} />
            <ellipse cx="40" cy="6" rx="6.2" ry="2" fill={url('inner')} />
          </g>
        );
      }
      case 'coil':
        return (
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <ellipse cx="30" cy="28" rx={27 - i * 3.6} ry={17 - i * 2.2} stroke="#0b0f14" strokeWidth="3.4" fill="none" />
                <ellipse cx="30" cy="27.2" rx={27 - i * 3.6} ry={17 - i * 2.2} stroke="#6b7280" strokeOpacity="0.5" strokeWidth="0.9" fill="none" />
              </g>
            ))}
            <path d="M57 28 C62 28 63 20 63 12" stroke="#0b0f14" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            {[[8, 36], [30, 45], [52, 36]].map(([cx, cy]) => (
              <rect key={cx} x={cx - 2.5} y={cy - 1.8} width="5" height="3.6" rx="1.2" fill="#7c3aed" />
            ))}
          </g>
        );
      case 'valve':
        return (
          <g>
            {/* بدنه افقی با دو سر رزوه */}
            <rect x="8" y="24" width="48" height="18" rx="3" fill={url('body')} />
            <rect x="4" y="22" width="9" height="22" rx="2" fill={p.lo} />
            <rect x="51" y="22" width="9" height="22" rx="2" fill={p.lo} />
            <ellipse cx="6" cy="33" rx="2.2" ry="8" fill={url('inner')} />
            <ellipse cx="58" cy="33" rx="2.2" ry="8" fill={url('inner')} />
            <path d="M12 28 H52" stroke="#fff" strokeOpacity="0.2" strokeWidth="2.4" strokeLinecap="round" />
            {/* گلویی و دسته اهرمی زرد */}
            <rect x="28" y="16" width="8" height="9" rx="1.5" fill={p.lo} />
            <rect x="18" y="8" width="34" height="7" rx="3.5" fill="#facc15" />
            <rect x="18" y="8" width="34" height="2.6" rx="1.3" fill="#fde68a" fillOpacity="0.8" />
            <circle cx="32" cy="11.5" r="2.2" fill="#a16207" />
          </g>
        );
      case 'sprinkler':
        return (
          <g>
            {/* رایزر زرد */}
            <rect x="29" y="22" width="6" height="24" rx="1.5" fill="#facc15" />
            <rect x="29" y="22" width="2" height="24" fill="#fef08a" fillOpacity="0.8" />
            <ellipse cx="32" cy="46" rx="11" ry="3" fill={p.lo} fillOpacity="0.35" />
            {/* بدنه آبپاش */}
            <path d="M24 22 L32 10 L40 22 Z" fill={url('body')} />
            <circle cx="32" cy="12" r="4.5" fill={p.lo} />
            {/* بازوی ضربه‌ای و نازل */}
            <path d="M40 14 H52" stroke={p.lo} strokeWidth="3" strokeLinecap="round" />
            <rect x="50" y="10" width="6" height="8" rx="2" fill={p.mid} />
            <path d="M24 16 L14 12" stroke={p.lo} strokeWidth="3" strokeLinecap="round" />
            {/* قطرات پاشش */}
            {[[48, 4], [55, 7], [11, 5], [6, 9]].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.8" fill={url('water')} />
            ))}
          </g>
        );
      case 'drip-kit':
        return (
          <g>
            <path d="M0 32 H64" stroke="#0b0f14" strokeWidth="4.5" />
            <path d="M0 30.6 H64" stroke="#6b7280" strokeOpacity="0.5" strokeWidth="1" />
            {/* شیر قطع و وصل */}
            <rect x="23" y="25" width="18" height="14" rx="3" fill="#16a34a" />
            <rect x="23" y="25" width="18" height="4" rx="2" fill="#4ade80" fillOpacity="0.6" />
            <rect x="30" y="16" width="4" height="9" fill="#475569" />
            <rect x="20" y="12" width="24" height="5" rx="2.5" fill="#dc2626" />
            {/* قطره‌چکان‌ها */}
            {[9, 54].map((cx) => (
              <g key={cx}>
                <rect x={cx - 4} y="23" width="8" height="6" rx="2" fill="#7c3aed" />
                <path d={`M${cx} 36 C${cx - 2} 40 ${cx - 2} 42 ${cx} 43 C${cx + 2} 42 ${cx + 2} 40 ${cx} 36 Z`} fill={url('water')} />
              </g>
            ))}
          </g>
        );
    }
  };

  const at = (x: number, y: number, s: number) => <g transform={`translate(${x} ${y}) scale(${s})`}>{product()}</g>;

  /** دو تکه لوله با کوپلر وسطشان — فقط برای کاروگیت که اتصالش همین است */
  const coupler = () => (
    <g>
      <g transform="translate(-6 24)">{ribbed(10, 24, 40, 15)}</g>
      <g transform="translate(56 24)">{ribbed(10, 24, 40, 15)}</g>
      <rect x="52" y="30" width="20" height="36" rx="4" fill={url('body')} />
      <rect x="53" y="33" width="3" height="30" rx="1.5" fill="#facc15" />
      <rect x="68" y="33" width="3" height="30" rx="1.5" fill="#facc15" />
    </g>
  );

  const sparkle = (x: number, y: number, s = 1) => (
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill="#facc15" />
  );

  const drop = (x: number, y: number, s = 1) => (
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -9 C-5 -2 -6 1 -6 3 A6 6 0 0 0 6 3 C6 1 5 -2 0 -9 Z" fill={url('water')} />
  );

  const accessory = (): ReactNode => {
    switch (kind) {
      case 'material':
        return (
          <g>
            {at(4, 6, 0.78)}
            {/* کپه گرانول مواد اولیه به رنگ همین محصول */}
            {[[64, 74], [75, 76], [86, 76], [97, 74], [69, 66], [80, 67], [91, 66], [75, 58], [86, 58], [80, 50]].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="6" fill={url('bead')} />
                <circle cx={cx - 2} cy={cy - 2.2} r="1.5" fill="#fff" fillOpacity="0.6" />
              </g>
            ))}
            <path d="M96 30 C102 18 116 18 116 18 C114 32 104 36 96 30 Z" fill="#22c55e" />
            <path d="M96 30 C103 26 109 22 114 19" stroke="#15803d" strokeWidth="1.2" fill="none" />
          </g>
        );
      case 'size':
        return (
          <g>
            {at(34, 18, 1)}
            {/* کولیس عمودی — فک‌ها بالا و پایین خود محصول را گرفته‌اند */}
            <rect x="14" y="4" width="9" height="78" rx="2" fill={url('steel')} />
            <rect x="16" y="8" width="5" height="70" rx="1" fill="#facc15" />
            {Array.from({ length: 17 }, (_, i) => (
              <path key={i} d={`M16 ${10 + i * 4} H${i % 2 ? 18.5 : 20}`} stroke="#713f12" strokeWidth="0.9" />
            ))}
            <path d="M14 15 H46 L44 22 H14 Z" fill={url('steel')} />
            <path d="M14 62 H44 L46 69 H14 Z" fill={url('steel')} />
            <rect x="9" y="57" width="18" height="18" rx="3" fill="#334155" />
            <circle cx="18" cy="66" r="2.6" fill={url('steel')} />
          </g>
        );
      case 'height':
        return (
          <g>
            {at(14, 18, 1.12)}
            {/* خط اندازه عمودی */}
            <path d="M100 20 V74" stroke="#334155" strokeWidth="2" />
            <path d="M100 18 L95 26 H105 Z M100 76 L95 68 H105 Z" fill="#f59e0b" />
            {[32, 41, 50, 59, 68].map((y, i) => <path key={y} d={`M100 ${y} H${i % 2 ? 105 : 108}`} stroke="#334155" strokeWidth="1.4" />)}
            <path d="M92 20 H108 M92 74 H108" stroke="#334155" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2 2" />
          </g>
        );
      case 'strength':
        return (
          <g>
            <path d="M74 6 L106 16 V40 C106 58 92 70 74 78 C56 70 42 58 42 40 V16 Z" fill="#0b0f14" stroke={url('gold')} strokeWidth="5" strokeLinejoin="round" />
            <path d="M74 13 L99 21 V40 C99 53 89 63 74 70" stroke="#fff" strokeOpacity="0.12" strokeWidth="3" fill="none" />
            {at(4, 30, 0.9)}
          </g>
        );
      case 'pressure':
        return (
          <g>
            {at(2, 30, 0.9)}
            {/* فشارسنج */}
            <rect x="85" y="44" width="6" height="12" fill={url('steel')} />
            <circle cx="88" cy="28" r="21" fill={url('steel')} />
            <circle cx="88" cy="28" r="17" fill="#fff" />
            <path d="M74 32 A15 15 0 0 1 102 32" stroke="#22c55e" strokeWidth="3" fill="none" />
            <path d="M95 18 A15 15 0 0 1 102 32" stroke="#ef4444" strokeWidth="3" fill="none" />
            {Array.from({ length: 7 }, (_, i) => {
              const a = Math.PI * (1.1 + (i * 0.8) / 6);
              return <path key={i} d={`M${r2(88 + Math.cos(a) * 13)} ${r2(28 + Math.sin(a) * 13)} L${r2(88 + Math.cos(a) * 10)} ${r2(28 + Math.sin(a) * 10)}`} stroke="#334155" strokeWidth="1.2" />;
            })}
            <path d="M88 28 L97 19" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="88" cy="28" r="2.6" fill="#0f172a" />
          </g>
        );
      case 'joint':
        if (subject === 'corrugated' || subject === 'spiral') return coupler();
        return (
          <g>
            {at(2, 26, 0.92)}
            {/* واشر آب‌بند */}
            <ellipse cx="92" cy="50" rx="17" ry="17" stroke="#b45309" strokeWidth="8" fill="none" />
            <ellipse cx="92" cy="50" rx="17" ry="17" stroke={url('gold')} strokeWidth="6" fill="none" />
            <path d="M80 42 A14 14 0 0 1 96 36" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            {sparkle(108, 22)}
          </g>
        );
      case 'lifetime':
        return (
          <g>
            {at(2, 32, 0.92)}
            <rect x="80" y="8" width="30" height="5" rx="2" fill={url('gold')} />
            <rect x="80" y="63" width="30" height="5" rx="2" fill={url('gold')} />
            <path d="M84 13 H106 C106 26 98 32 95 38 C98 44 106 50 106 63 H84 C84 50 92 44 95 38 C92 32 84 26 84 13 Z" fill="#e0f2fe" fillOpacity="0.85" stroke="#64748b" strokeWidth="1.5" />
            <path d="M88 20 H102 C101 27 97 31 95 34 C93 31 89 27 88 20 Z" fill="#facc15" />
            <path d="M88 61 C90 53 93 51 95 50 C97 51 100 53 102 61 Z" fill="#facc15" />
          </g>
        );
      case 'usage':
        if (subject === 'coil' || subject === 'drip-kit')
          return (
            <g>
              {at(2, 34, 0.86)}
              {/* آبیاری گیاه */}
              <ellipse cx="94" cy="76" rx="18" ry="5" fill="#92400e" />
              <path d="M94 76 V44" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
              <path d="M94 56 C84 54 78 46 78 38 C88 38 94 46 94 56 Z" fill="#22c55e" />
              <path d="M94 50 C102 46 110 38 110 28 C100 28 94 38 94 50 Z" fill="#4ade80" />
              {drop(70, 22, 0.8)}
              {drop(82, 14, 0.6)}
            </g>
          );
        return (
          <g>
            {at(44, 22, 0.92)}
            <path d="M44 32 C26 34 16 48 16 64 C26 58 34 50 46 48 Z" fill={url('water')} />
            <path d="M28 42 C22 50 21 56 22 62" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="22" cy="75" rx="20" ry="6" fill={url('water')} fillOpacity="0.8" />
            <circle cx="10" cy="66" r="2.5" fill="#38bdf8" />
            <circle cx="36" cy="68" r="2" fill="#38bdf8" />
          </g>
        );
      case 'types':
        return (
          <g>
            {at(2, 44, 0.5)}
            {at(32, 12, 0.72)}
            {at(76, 46, 0.5)}
          </g>
        );
      case 'feature':
        return (
          <g>
            {at(4, 26, 0.95)}
            <circle cx="96" cy="26" r="15" fill="#22c55e" />
            <path d="M89 26 L94 31 L104 21" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {sparkle(74, 14, 0.8)}
            {sparkle(112, 50, 0.6)}
          </g>
        );
      case 'uv':
        return (
          <g>
            {at(2, 32, 0.92)}
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i * Math.PI * 2) / 10;
              return <path key={i} d={`M${r2(94 + Math.cos(a) * 15)} ${r2(22 + Math.sin(a) * 15)} L${r2(94 + Math.cos(a) * 21)} ${r2(22 + Math.sin(a) * 21)}`} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />;
            })}
            <circle cx="94" cy="22" r="11" fill={url('gold')} />
            <text x="94" y="25.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="#78350f" fontFamily="sans-serif">UV</text>
          </g>
        );
      case 'flow':
        return (
          <g>
            {at(2, 26, 0.92)}
            {drop(84, 30, 1.3)}
            {drop(102, 46, 1)}
            {drop(86, 62, 0.8)}
            <path d="M70 46 C76 44 80 48 86 46" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'length':
        return (
          <g>
            {at(4, 14, 0.92)}
            {/* متر نواری */}
            <rect x="12" y="66" width="80" height="7" fill="#facc15" stroke="#a16207" strokeWidth="0.8" />
            {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${16 + i * 5} 66 V${i % 2 ? 69 : 71}`} stroke="#713f12" strokeWidth="0.8" />)}
            <rect x="8" y="64" width="5" height="11" rx="1" fill="#475569" />
            <rect x="88" y="54" width="26" height="24" rx="6" fill="#f59e0b" />
            <circle cx="101" cy="66" r="6" fill="#fde68a" stroke="#b45309" strokeWidth="1.4" />
          </g>
        );
      case 'surface':
        return (
          <g>
            {at(2, 28, 0.92)}
            {/* ذره‌بین روی سطح صاف */}
            <path d="M98 50 L112 66" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <circle cx="88" cy="38" r="16" fill="#e0f2fe" fillOpacity="0.75" stroke={url('steel')} strokeWidth="4.5" />
            <path d="M80 32 A10 10 0 0 1 90 26" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            {sparkle(70, 16, 0.7)}
          </g>
        );
      case 'angle':
        return (
          <g>
            {at(4, 24, 1)}
            {/* نقاله */}
            <path d="M74 72 A26 26 0 0 1 116 72 Z" fill="#fef3c7" fillOpacity="0.9" stroke="#f59e0b" strokeWidth="2" />
            {Array.from({ length: 9 }, (_, i) => {
              const a = Math.PI + (i * Math.PI) / 8;
              return <path key={i} d={`M${r2(95 + Math.cos(a) * 21)} ${r2(72 + Math.sin(a) * 21)} L${r2(95 + Math.cos(a) * 17)} ${r2(72 + Math.sin(a) * 17)}`} stroke="#b45309" strokeWidth="1.2" />;
            })}
            <path d="M95 72 L95 50 M95 72 L116 72" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );
      case 'coating':
        return (
          <g>
            {at(2, 30, 0.92)}
            {['#94a3b8', '#1e3a5f', '#f59e0b'].map((c, i) => (
              <path key={c} d={`M78 ${56 - i * 13} L96 ${48 - i * 13} L114 ${56 - i * 13} L96 ${64 - i * 13} Z`} fill={c} stroke="#fff" strokeOpacity="0.5" strokeWidth="1" />
            ))}
          </g>
        );
      case 'eco':
        return (
          <g>
            {at(2, 32, 0.92)}
            <path d="M78 46 C80 22 104 10 116 10 C116 30 104 50 78 46 Z" fill="#22c55e" />
            <path d="M78 46 C90 36 102 24 114 12" stroke="#15803d" strokeWidth="1.6" fill="none" />
            {drop(84, 64, 0.8)}
          </g>
        );
      case 'delivery':
        return (
          <g>
            <path d="M100 2 C92 2 87 8 87 15 C87 24 100 34 100 34 C100 34 113 24 113 15 C113 8 108 2 100 2 Z" fill={url('gold')} />
            <circle cx="100" cy="15" r="5" fill="#fff" />
            {/* کامیون با بار همین محصول */}
            <rect x="6" y="61" width="72" height="5" rx="1" fill="#334155" />
            {at(10, 18, 0.9)}
            <path d="M78 42 H94 L106 56 V70 H78 Z" fill="#475569" />
            <path d="M82 46 H92 L100 56 H82 Z" fill="#bae6fd" />
            <rect x="4" y="66" width="104" height="5" rx="2" fill="#1e293b" />
            {[22, 44, 92].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy="74" r="7" fill="#0b0f14" />
                <circle cx={cx} cy="74" r="3" fill={url('steel')} />
              </g>
            ))}
          </g>
        );
      case 'warranty':
        return (
          <g>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * Math.PI * 2) / 12;
              // گرد شده: رقم آخر Math.sin در سرور و مرورگر فرق می‌کند و hydration mismatch می‌داد
              return <circle key={i} cx={r2(84 + Math.cos(a) * 22)} cy={r2(32 + Math.sin(a) * 22)} r="8" fill={url('gold')} />;
            })}
            <circle cx="84" cy="32" r="23" fill={url('gold')} />
            <circle cx="84" cy="32" r="17" fill="#0b0f14" />
            <path d="M76 32 L82 38 L93 27" stroke="#facc15" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M72 52 L67 72 L76 67 L81 74 L84 56 Z M96 52 L101 72 L92 67 L87 74 L84 56 Z" fill="#b45309" />
            {at(0, 40, 0.68)}
          </g>
        );
    }
  };

  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden>
      <defs>
        <linearGradient id={g('body')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.hi} />
          <stop offset="0.35" stopColor={p.mid} />
          <stop offset="1" stopColor={p.lo} />
        </linearGradient>
        {/* سایه استوانه عمودی (منهول، گردن سپتیک) */}
        <linearGradient id={g('bodyX')} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={p.lo} />
          <stop offset="0.3" stopColor={p.hi} />
          <stop offset="0.65" stopColor={p.mid} />
          <stop offset="1" stopColor={p.lo} />
        </linearGradient>
        <radialGradient id={g('inner')} cx="0.6" cy="0.4" r="0.8">
          <stop offset="0" stopColor={p.inner} />
          <stop offset="1" stopColor={p.innerLo} />
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
          <stop offset="0" stopColor={beadHi} />
          <stop offset="1" stopColor={beadLo} />
        </radialGradient>
        <linearGradient id={g('water')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="83" rx="48" ry="5" fill="#000" fillOpacity="0.12" />
      {accessory()}
    </svg>
  );
}
