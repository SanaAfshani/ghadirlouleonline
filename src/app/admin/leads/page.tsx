'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, FileText, Loader2, MessageCircle, Phone, PhoneCall } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, faDigits, safeDecode } from '@/shared/lib/utils';
import { LEAD_LABEL, LEAD_TYPES, type LeadType } from '@/shared/lib/leads';
import type { LeadReport } from '@/shared/lib/lead-events';

const RANGES = [7, 30, 90] as const;
const ICON: Record<LeadType, typeof Phone> = { phone: Phone, whatsapp: MessageCircle, form: FileText };
const card = 'bg-[var(--card)] border border-[var(--border)] rounded-2xl';

// day رشته YYYY-MM-DD به وقت تهران است؛ new Date روی آن نیمه‌شب UTC می‌سازد — پس با UTC قالب‌بندی تا روز جابه‌جا نشود
const dayLabel = new Intl.DateTimeFormat('fa-IR', { timeZone: 'UTC', day: 'numeric', month: 'short' });
const timeLabel = new Intl.DateTimeFormat('fa-IR', { timeZone: 'Asia/Tehran', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const sum = (c: Record<LeadType, number>) => c.phone + c.whatsapp + c.form;

/** نمودار ستونی تک‌سری: مجموع اقدام‌های مشتری در هر روز (جزئیات هر روز در tooltip) */
function DailyBars({ daily }: { daily: LeadReport['daily'] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => sum(d.counts)));
  const h = hover != null ? daily[hover] : null;

  return (
    <div className="relative">
      <div className="h-40 flex items-end gap-[2px] border-b border-[var(--border)]" role="img" aria-label="تعداد اقدام مشتری در هر روز">
        {daily.map((d, i) => {
          const total = sum(d.counts);
          return (
            <div
              key={d.day}
              className="flex-1 h-full flex items-end justify-center cursor-default"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              aria-label={`${dayLabel.format(new Date(d.day))}: ${total} اقدام`}
            >
              <div
                className={cn('w-full max-w-6 rounded-t-[4px] transition-opacity', total ? 'bg-[var(--accent)]' : 'bg-transparent', hover != null && hover !== i && 'opacity-40')}
                style={{ height: `${(total / max) * 100}%`, minHeight: total ? 3 : 0 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-[var(--muted-foreground)]">
        <span>{dayLabel.format(new Date(daily[0].day))}</span>
        <span>{dayLabel.format(new Date(daily[daily.length - 1].day))}</span>
      </div>
      {h && (
        <div className="absolute top-0 left-0 rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-lg px-3 py-2 text-xs pointer-events-none">
          <p className="font-bold mb-1">{dayLabel.format(new Date(h.day))}</p>
          {LEAD_TYPES.map((t) => (
            <p key={t} className="flex justify-between gap-4 num">
              <span className="text-[var(--muted-foreground)]">{LEAD_LABEL[t]}</span>
              {faDigits(h.counts[t])}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [report, setReport] = useState<LeadReport | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/leads?days=${days}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return;
        if (json.success) {
          setReport(json.data);
          setFailed(false);
        } else {
          setFailed(true);
          toast.error(json.error || 'بارگذاری گزارش ناموفق بود');
        }
      })
      .catch(() => {
        if (!alive) return;
        setFailed(true);
        toast.error('خطا در ارتباط با سرور');
      });
    return () => {
      alive = false;
    };
  }, [days]);

  const total = report ? sum(report.totals) : 0;

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">گزارش تماس‌ها</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">کدام صفحه‌ها مشتری می‌آورند: کلیک روی تلفن و واتس‌اپ و ارسال فرم مشاوره</p>
        </div>
        <div className="flex gap-1.5" role="group" aria-label="بازه زمانی">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className={cn('h-9 px-3.5 rounded-lg text-sm font-bold', days === r ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]')}
            >
              {faDigits(r)} روز
            </button>
          ))}
        </div>
      </div>

      {!report && failed ? (
        <p className="py-24 text-center text-sm text-[var(--muted-foreground)]">گزارش بارگذاری نشد. صفحه را دوباره باز کنید.</p>
      ) : !report ? (
        <div className="flex items-center justify-center py-24 text-[var(--muted-foreground)] gap-2"><Loader2 className="w-6 h-6 animate-spin" />در حال بارگذاری…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className={`${card} p-4 sm:p-5`}>
              <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]"><PhoneCall className="w-4 h-4" />همه اقدام‌ها</p>
              <p className="mt-2 text-3xl sm:text-4xl font-black num">{faDigits(total)}</p>
            </div>
            {LEAD_TYPES.map((t) => {
              const Icon = ICON[t];
              return (
                <div key={t} className={`${card} p-4 sm:p-5`}>
                  <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]"><Icon className="w-4 h-4" />{LEAD_LABEL[t]}</p>
                  <p className="mt-2 text-3xl sm:text-4xl font-black num">{faDigits(report.totals[t])}</p>
                </div>
              );
            })}
          </div>

          <div className={`${card} p-4 sm:p-6`}>
            <h2 className="font-bold mb-4">اقدام‌های مشتری در هر روز</h2>
            {total ? <DailyBars daily={report.daily} /> : <p className="py-10 text-center text-sm text-[var(--muted-foreground)]">در این بازه هنوز تماس یا درخواستی ثبت نشده است.</p>}
          </div>

          <div className={card}>
            <h2 className="font-bold p-4 sm:p-6 pb-0 sm:pb-0">صفحه‌هایی که مشتری آورده‌اند</h2>
            {report.pages.length === 0 ? (
              <p className="p-6 text-sm text-[var(--muted-foreground)]">داده‌ای نیست.</p>
            ) : (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm min-w-[32rem]">
                  <thead className="text-xs text-[var(--muted-foreground)]">
                    <tr className="border-b border-[var(--border)]">
                      <th scope="col" className="text-right font-bold px-4 sm:px-6 py-2.5">صفحه</th>
                      {LEAD_TYPES.map((t) => <th key={t} scope="col" className="text-center font-bold px-3 py-2.5 whitespace-nowrap">{LEAD_LABEL[t]}</th>)}
                      <th scope="col" className="text-center font-bold px-4 py-2.5">جمع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.pages.map((p) => (
                      <tr key={p.path} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 sm:px-6 py-3 max-w-[18rem]">
                          {p.path === '—' ? (
                            <span className="text-[var(--muted-foreground)]">نامشخص</span>
                          ) : (
                            <a href={p.path} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 hover:text-[var(--accent-text)] break-all">
                              <bdi dir="ltr">{safeDecode(p.path)}</bdi> <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                        </td>
                        {LEAD_TYPES.map((t) => <td key={t} className="text-center px-3 py-3 num text-[var(--muted-foreground)]">{p.counts[t] ? faDigits(p.counts[t]) : '—'}</td>)}
                        <td className="text-center px-4 py-3 font-black num">{faDigits(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={card}>
            <h2 className="font-bold p-4 sm:p-6 pb-3">آخرین اقدام‌ها</h2>
            {report.recent.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-[var(--muted-foreground)]">داده‌ای نیست.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {report.recent.map((e) => {
                  const Icon = ICON[e.type];
                  return (
                    <li key={e.id} className="flex items-center gap-3 px-4 sm:px-6 py-3 text-sm">
                      <span className="grid place-items-center w-9 h-9 rounded-xl bg-[var(--muted)] shrink-0"><Icon className="w-4 h-4" /></span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold">{LEAD_LABEL[e.type]}{e.target && <span className="font-normal text-[var(--muted-foreground)]"> · {e.type === 'phone' ? faDigits(e.target) : e.target}</span>}</p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate"><bdi dir="ltr">{safeDecode(e.path) || '—'}</bdi></p>
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)] shrink-0">{timeLabel.format(new Date(e.createdAt))}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p className="text-xs text-[var(--muted-foreground)] leading-6">
            کلیک روی تلفن و واتس‌اپ از مرورگر بازدیدکننده ثبت می‌شود؛ ربات‌ها و پیش‌نمایش لینک‌ها شمرده نمی‌شوند.
            هر کلیک لزوماً به تماس واقعی نمی‌انجامد، ولی برای مقایسه صفحه‌ها با هم معیار خوبی است.
          </p>
        </>
      )}
    </div>
  );
}
