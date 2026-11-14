'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { LiveItem, PriceBoard } from '@/shared/lib/price-board-types';

/**
 * store مشترک تابلوی قیمت لحظه‌ای.
 * همه جدول‌های یک صفحه از یک polling مشترک استفاده می‌کنند (نه یک درخواست برای هر جدول).
 * - هر ۵ ثانیه وقتی تب دیده می‌شود؛ تب پنهان = توقف
 * - درست در لحظه باز/بسته شدن بازار یک درخواست اضافه
 * - ردیف‌هایی که قیمتشان عوض شده چند ثانیه «flash» می‌گیرند
 */

const POLL_MS = 5000;
const FLASH_MS = 2600;

export type Flash = 'up' | 'down';
type State = { board: PriceBoard | null; flashes: ReadonlyMap<string, Flash> };

let state: State = { board: null, flashes: new Map() };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let edgeTimer: ReturnType<typeof setTimeout> | null = null;
let inflight = false;

const emit = () => listeners.forEach((l) => l());

function priceMap(board: PriceBoard) {
  const m = new Map<string, number | null>();
  for (const line of board.lines) for (const i of line.items) m.set(i.id, i.price);
  return m;
}

function apply(next: PriceBoard) {
  const prev = state.board ? priceMap(state.board) : null;
  const flashes = new Map(state.flashes);
  if (prev) {
    for (const line of next.lines) {
      for (const i of line.items) {
        const before = prev.get(i.id);
        if (before != null && i.price != null && before !== i.price) {
          flashes.set(i.id, i.price > before ? 'up' : 'down');
          setTimeout(() => {
            const f = new Map(state.flashes);
            f.delete(i.id);
            state = { ...state, flashes: f };
            emit();
          }, FLASH_MS);
        }
      }
    }
  }
  state = { board: next, flashes };
  scheduleEdge();
  emit();
}

async function poll() {
  if (inflight || typeof document === 'undefined' || document.hidden) return;
  inflight = true;
  try {
    const v = state.board?.version ?? '';
    const locale = state.board?.locale ?? 'fa';
    const res = await fetch(`/api/prices/live?v=${encodeURIComponent(v)}&locale=${locale}`, { cache: 'no-store' });
    const json = await res.json();
    // پاسخ دیرِ زبان قبلی (کاربر وسط درخواست زبان را عوض کرده) تابلوی زبان جدید را بازنویسی نکند
    if (json?.success && !json.unchanged && json.data && json.data.locale === locale) apply(json.data as PriceBoard);
  } catch {
    // قطعی موقت شبکه — دور بعد دوباره
  } finally {
    inflight = false;
  }
}

/** درست سر ساعت باز/بسته شدن، بدون صبر برای دور بعدی polling */
function scheduleEdge() {
  if (edgeTimer) clearTimeout(edgeTimer);
  const at = state.board?.market.nextChangeAt;
  if (!at) return;
  const ms = new Date(at).getTime() - Date.now() + 1500;
  if (ms > 0 && ms < 24 * 3600_000) edgeTimer = setTimeout(poll, ms);
}

const onVisible = () => {
  if (!document.hidden) poll();
};

function start() {
  if (timer) return;
  timer = setInterval(poll, POLL_MS);
  document.addEventListener('visibilitychange', onVisible);
  scheduleEdge();
}

function stop() {
  if (timer) clearInterval(timer);
  if (edgeTimer) clearTimeout(edgeTimer);
  timer = null;
  edgeTimer = null;
  document.removeEventListener('visibilitychange', onVisible);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

/**
 * تابلوی زنده با داده اولیه سرور (بدون پرش در بارگذاری).
 * داده سرور فقط وقتی جایگزین می‌شود که store هنوز خالی است.
 */
const serverSnapshots = new WeakMap<PriceBoard, State>();
const serverSnapshot = (initial: PriceBoard) => {
  // useSyncExternalStore شیء ثابت می‌خواهد، نه یک شیء تازه در هر فراخوانی
  let snap = serverSnapshots.get(initial);
  if (!snap) serverSnapshots.set(initial, (snap = { board: initial, flashes: new Map() }));
  return snap;
};

/**
 * داده سرور فقط وقتی store هنوز خالی است جایگزین می‌شود (فقط در مرورگر؛ روی سرور متغیر ماژول بین کاربران مشترک است).
 * با عوض شدن زبان صفحه (ناوبری کلاینتی فارسی ↔ انگلیسی) تابلوی زبان قبلی کنار گذاشته می‌شود.
 */
function seed(initial: PriceBoard) {
  if (state.board && state.board.locale === initial.locale) return;
  state = { board: initial, flashes: new Map() };
  scheduleEdge();
}

export function useLiveBoard(initial: PriceBoard) {
  useEffect(() => seed(initial), [initial]);
  const snap = useSyncExternalStore(
    subscribe,
    () => (state.board && state.board.locale === initial.locale ? state : serverSnapshot(initial)),
    () => serverSnapshot(initial),
  );
  return { board: snap.board ?? initial, flashes: snap.flashes };
}

export function findItems(board: PriceBoard, productIds?: string[]): (LiveItem & { productName: string; href: string; productId: string })[] {
  return board.lines
    .filter((l) => !productIds || productIds.includes(l.productId))
    .flatMap((l) => l.items.map((i) => ({ ...i, productName: l.productName, href: l.href, productId: l.productId })));
}
