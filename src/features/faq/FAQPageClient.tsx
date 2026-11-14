'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { PageHero } from '@/shared/ui/PageHero';
import { SearchInput } from '@/shared/ui/SearchInput';
import { useConsult } from '@/features/consult/ConsultProvider';
import { Link } from '@/shared/i18n/Link';
import { useLocale, useMessages } from '@/shared/i18n/LocaleProvider';
import { digits } from '@/shared/i18n/format';
import { defineMessages } from '@/shared/i18n/messages';
import type { ContentOf } from '@/shared/content/types';
import type { faqCta, faqHero } from '@/shared/content/pages/faq';

const messages = defineMessages({
  fa: { all: 'همه', general: 'عمومی', search: 'جستجو در سوالات...', empty: '{t.empty}' },
  en: { all: 'All', general: 'General', search: 'Search questions...', empty: 'No questions match your search.' },
});

/** فیلتر «همه» — شناسه ثابت، نه برچسب، تا با دسته‌ای به همین نام در زبان دیگر قاطی نشود */
const ALL = '';

type FaqItem = {
  id: string;
  q: string;
  a: string;
  cat: string;
};

type FaqInput = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
};

type Props = {
  faqs: FaqInput[];
  hero: ContentOf<typeof faqHero>;
  cta: ContentOf<typeof faqCta>;
};

/** سوال‌ها در سرور به زبان صفحه برگردانده شده‌اند؛ متن‌های ثابت از پنل «محتوای صفحات ← سوالات متداول» */
export function FAQPageClient({ faqs, hero, cta }: Props) {
  const locale = useLocale();
  const t = useMessages(messages);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [search, setSearch] = useState('');
  const { open } = useConsult();

  const items: FaqItem[] = useMemo(
    () =>
      faqs.map((f) => ({
        id: f.id,
        q: f.question,
        a: f.answer,
        cat: f.category || t.general,
      })),
    [faqs, t.general],
  );

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(items.map((f) => f.cat)))],
    [items],
  );

  // انگلیسی بدون حساسیت به حروف بزرگ و کوچک؛ برای فارسی بی‌اثر است
  const needle = search.toLocaleLowerCase();
  const filtered = items.filter((f) => {
    const matchCat = activeCategory === ALL || f.cat === activeCategory;
    const matchSearch = !search || f.q.toLocaleLowerCase().includes(needle) || f.a.toLocaleLowerCase().includes(needle);
    return matchCat && matchSearch;
  });

  return (
    <>
      <PageHero label={hero.label} title={hero.title} description={hero.description} />

      <section className="section-padding">
        <div className="container-main max-w-3xl">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder={t.search}
            wrapperClassName="mb-5"
            className="h-12"
          />

          {/* موبایل: یک ردیف اسکرول‌شونده؛ دسکتاپ: چند خطی */}
          <div className="no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 flex sm:flex-wrap gap-2 overflow-x-auto mb-8">
            {categories.map((cat) => (
              <button
                key={cat || 'all'}
                type="button"
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`shrink-0 h-9 px-4 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-[var(--foreground)] text-[var(--background)]'
                    : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30'
                }`}
              >
                {cat || t.all}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center py-12 text-[var(--muted-foreground)]">{t.empty}</p>
          ) : (
            <div className="rounded-3xl border border-[var(--border)] divide-y divide-[var(--border)]">
              {filtered.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div key={faq.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-5 text-start"
                    >
                      <span className="font-bold leading-7">{digits(faq.q, locale)}</span>
                      <span className={`grid place-items-center w-8 h-8 rounded-full shrink-0 transition-colors ${isOpen ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--muted)]'}`}>
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    {/* پاسخ همیشه در HTML است (برای خزنده گوگل)؛ فقط با grid-rows جمع/باز می‌شود */}
                    <div
                      inert={!isOpen}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 sm:px-7 pb-6 -mt-1 text-[15px] leading-8 text-[var(--muted-foreground)]">{digits(faq.a, locale)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 rounded-[var(--radius-panel)] bg-[var(--ink)] text-white p-7 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <h2 className="text-xl font-black text-white">{cta.title}</h2>
              <p className="mt-1.5 text-sm text-slate-300">{cta.text}</p>
            </div>
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-2 sm:flex shrink-0">
              <button type="button" onClick={() => open()} className="h-12 px-5 rounded-2xl bg-white text-[var(--ink)] font-bold whitespace-nowrap">
                {cta.consultLabel}
              </button>
              <Link href={cta.contactLink} className="h-12 px-5 rounded-2xl border border-white/20 font-bold flex items-center justify-center whitespace-nowrap hover:bg-white/10 transition-colors">
                {cta.contactLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
