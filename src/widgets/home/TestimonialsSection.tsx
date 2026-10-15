'use client';

import { m as motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { SectionHeading } from '@/shared/ui/SectionHeading';

type TestimonialItem = {
  id: string;
  name: string;
  company: string | null;
  position: string | null;
  content: string;
  rating: number;
};

export function TestimonialsSection({ testimonials }: { testimonials: TestimonialItem[] }) {
  if (!testimonials.length) return null;

  return (
    <section className="section-padding bg-[var(--card)] border-y border-[var(--border)]" aria-labelledby="testimonials-title">
      <div className="container-main">
        <SectionHeading align="right" label="مشتریان ما" title="تجربه پیمانکاران و کارفرمایان" />
        <div className="snap-row -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="w-[84%] sm:w-[60%] md:w-auto relative rounded-3xl bg-[var(--background)] border border-[var(--border)] p-6 flex flex-col"
            >
              <Quote className="absolute top-5 left-5 w-10 h-10 text-[var(--accent-text)]/15" />
              <div className="flex gap-0.5" aria-label={`امتیاز ${t.rating} از ۵`}>
                {Array.from({ length: 5 }, (_, s) => (
                  <Star key={s} className={`w-4 h-4 ${s < t.rating ? 'fill-[var(--accent)] text-[var(--accent-text)]' : 'text-[var(--border)]'}`} />
                ))}
              </div>
              <blockquote className="mt-4 text-[15px] leading-8 text-[var(--foreground)]/85">{t.content}</blockquote>
              <figcaption className="mt-auto pt-5 flex items-center gap-3">
                <span className="grid place-items-center w-11 h-11 rounded-full bg-[var(--accent)]/15 text-[var(--accent-text)] font-black">{t.name.replace(/^(مهندس|حاج|دکتر)\s+/, '').charAt(0)}</span>
                <span>
                  <span className="block font-bold">{t.name}</span>
                  {(t.company || t.position) && <span className="block text-xs text-[var(--muted-foreground)]">{[t.position, t.company].filter(Boolean).join(' — ')}</span>}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
