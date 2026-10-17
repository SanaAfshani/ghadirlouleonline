import Link from 'next/link';
import { FileQuestion, Headphones, Table2 } from 'lucide-react';
import { ErrorState, stateButton } from '@/shared/ui/ErrorState';

/** لینک پیش‌فاکتور اشتباه است یا حذف شده — به جای ۴۰۴ عمومی */
export default function QuoteNotFound() {
  return (
    <ErrorState
      icon={FileQuestion}
      tone="slate"
      code="۴۰۴"
      title="پیش‌فاکتوری با این لینک پیدا نشد"
      description="ممکن است لینک ناقص کپی شده باشد یا این پیش‌فاکتور حذف شده باشد. لینک را دوباره بررسی کنید یا از جدول قیمت پیش‌فاکتور جدید بسازید."
    >
      <Link href="/prices" className={stateButton.primary}><Table2 className="w-4 h-4" />جدول قیمت</Link>
      <Link href="/contact" className={stateButton.secondary}><Headphones className="w-4 h-4" />تماس با فروش</Link>
    </ErrorState>
  );
}
