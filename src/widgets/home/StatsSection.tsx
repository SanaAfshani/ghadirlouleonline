'use client';

import { m as motion } from 'framer-motion';
import { useCounter } from '@/shared/hooks/useCounter';
import { Users, Package, Building2, Award } from 'lucide-react';

const stats = [
  { end: 20,   suffix: '+', label: 'سال تجربه',     desc: 'در تامین لوله آب و فاضلاب', icon: Award,     color: 'amber' },
  { end: 5000, suffix: '+', label: 'نوع محصول',    desc: 'لوله، اتصالات و شیرآلات',   icon: Package,   color: 'blue'  },
  { end: 500,  suffix: '+', label: 'مشتری راضی',   desc: 'پیمانکار و شرکت‌های آب',   icon: Users,     color: 'green' },
  { end: 200,  suffix: '+', label: 'پروژه اجرایی', desc: 'آبرسانی و فاضلاب شهری',    icon: Building2, color: 'teal'  },
];

const colorMap: Record<string, { icon: string; value: string; bg: string; border: string }> = {
  amber: { icon: 'text-[var(--accent-text)]',  value: 'text-[var(--accent-text)]',  bg: 'bg-[var(--accent)]/8',  border: 'border-[var(--accent)]/20' },
  blue:  { icon: 'text-blue-400',   value: 'text-blue-400',   bg: 'bg-blue-400/8',   border: 'border-blue-400/20'  },
  green: { icon: 'text-green-500',  value: 'text-green-500',  bg: 'bg-green-500/8',  border: 'border-green-500/20' },
  teal:  { icon: 'text-teal-400',   value: 'text-teal-400',   bg: 'bg-teal-400/8',   border: 'border-teal-400/20'  },
};

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const { count, ref } = useCounter(stat.end, 2200);
  const c = colorMap[stat.color];

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.09, duration: 0.5 }}
      className="relative flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${c.bg} rounded-2xl`} />

      <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg} ${c.border} border group-hover:scale-105 transition-transform`}>
        <stat.icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div className="relative">
        <div className={`text-3xl sm:text-4xl font-black ${c.value} leading-none tabular-nums`}>
          {count.toLocaleString('fa-IR')}{stat.suffix}
        </div>
        <div className="text-[var(--foreground)] font-semibold text-sm mt-1.5">{stat.label}</div>
        <div className="text-[var(--muted-foreground)] text-xs mt-1">{stat.desc}</div>
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  return (
    <section className="home-section-compact bg-[var(--muted)]/40 border-y border-[var(--border)]">
      <div className="container-main">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
