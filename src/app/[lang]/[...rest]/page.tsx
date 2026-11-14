import { notFound } from 'next/navigation';

/** هر آدرس ناشناخته زیر زبان — ۴۰۴ داخل همان layout زبان (با فونت و جهت درست)، نه صفحه پیش‌فرض Next */
export default function CatchAll() {
  notFound();
}
