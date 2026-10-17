import { Check, ClipboardList, FileCheck2, Forklift, MapPinCheck, Package, Truck, type LucideIcon } from 'lucide-react';
import { ORDER_STEPS, orderStepIndex, type OrderLogEntry } from '@/shared/lib/order-status';
import { cn } from '@/shared/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  REQUESTED: ClipboardList,
  ISSUED: FileCheck2,
  PREPARING: Package,
  LOADING: Forklift,
  SHIPPED: Truck,
  DELIVERED: MapPinCheck,
};

const when = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

/**
 * خط زمانی سفارش: ثبت درخواست ← صدور فاکتور ← آماده‌سازی ← بارگیری ← ارسال ← تحویل.
 * موبایل عمودی، دسکتاپ افقی. مرحله جاری با حلقه متحرک مشخص است.
 */
export function OrderTimeline({ status, createdAt, issuedAt, orderStatus, orderLog }: {
  status: string;
  createdAt: string;
  issuedAt: string | null;
  orderStatus: string;
  orderLog: OrderLogEntry[];
}) {
  const steps = [
    { key: 'REQUESTED', label: 'ثبت درخواست', desc: 'پیش‌فاکتور ثبت شد', at: createdAt },
    { key: 'ISSUED', label: 'تأیید و صدور فاکتور', desc: 'کارشناس فروش قیمت و موجودی را تأیید کرد', at: issuedAt },
    ...ORDER_STEPS.map((s) => ({ ...s, at: orderLog.find((e) => e.status === s.key)?.at ?? null })),
  ];
  // آخرین مرحله انجام‌شده
  const done = status === 'ISSUED' ? 1 + (orderStepIndex(orderStatus) + 1) : 0;

  return (
    <ol className="grid gap-0 md:grid-cols-6">
      {steps.map((s, i) => {
        const Icon = ICONS[s.key];
        const isDone = i <= done;
        const isCurrent = i === done;
        return (
          <li key={s.key} className="relative flex md:flex-col items-start md:items-center gap-3 md:gap-2 pb-6 md:pb-0 md:text-center">
            {/* خط اتصال: موبایل عمودی، دسکتاپ افقی */}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'absolute right-[19px] top-10 bottom-0 w-0.5 md:right-auto md:top-5 md:bottom-auto md:h-0.5 md:w-full md:left-[-50%]',
                  i < done ? 'bg-emerald-500' : 'bg-[var(--border)]',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 grid place-items-center w-10 h-10 rounded-full shrink-0 transition-colors',
                isDone ? 'bg-emerald-500 text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,0.7)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]',
                isCurrent && 'ring-4 ring-emerald-500/25',
              )}
            >
              {isDone && !isCurrent ? <Check className="w-5 h-5" strokeWidth={3} /> : <Icon className="w-5 h-5" />}
              {isCurrent && <span aria-hidden className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-40" />}
            </span>
            <span className="min-w-0 md:px-1">
              <span className={cn('block text-sm font-black leading-6', isDone ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]')}>
                {s.label}
                {isCurrent && <span className="sr-only"> (مرحله فعلی)</span>}
              </span>
              <span className="block text-[11px] leading-5 text-[var(--muted-foreground)]">{s.desc}</span>
              {isDone && when(s.at) && <span className="block mt-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 num">{when(s.at)}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
