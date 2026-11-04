/**
 * تبدیل Markdown به HTML معنایی.
 *
 * ابزار تولید محتوا (seobot) خروجی را به صورت Markdown می‌دهد، نه HTML.
 * بدون این تبدیل، `##` و `**` عیناً در صفحه مقاله نمایش داده می‌شوند.
 *
 * عمداً بدون وابستگی خارجی نوشته شده — فقط همان ساختارهایی که در خروجی
 * واقعی دیده می‌شوند (تیتر، بولد، لینک، لیست، جدول، نقل‌قول، کد).
 */

/** کوتیشن هم escape می‌شود: آدرس لینک/تصویر داخل href="..." می‌نشیند و `"` در آن اتریبیوت تازه (onmouseover) می‌سازد */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** عناصر درون‌خطی: بولد، ایتالیک، کد، لینک، تصویر */
function inline(text: string): string {
  let out = escapeHtml(text);

  // تصویر قبل از لینک، چون الگویشان شبیه است
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (_m, alt: string, src: string) => `<img src="${src}" alt="${alt}">`);

  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_m, label: string, href: string) => {
    if (/^\s*javascript:/i.test(href)) return label;
    const external = /^https?:\/\//i.test(href);
    const rel = external ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href}"${rel}>${label}</a>`;
  });

  out = out.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*\*([^*\n]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  out = out.replace(/~~([^~\n]+)~~/g, '<s>$1</s>');

  return out;
}

function tableRow(line: string): string[] {
  return line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  let paragraph: string[] = [];
  /** اولین «# عنوان» همان عنوان مقاله است و در صفحه به صورت h1 رندر می‌شود — حذفش می‌کنیم تا دو h1 نداشته باشیم */
  let titleSkipped = false;

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inline(paragraph.join(' ').trim())}</p>`);
      paragraph = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      i++;
      continue;
    }

    // بلوک کد
    const fence = trimmed.match(/^```(\w*)/);
    if (fence) {
      flushParagraph();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        body.push(lines[i]);
        i++;
      }
      i++;
      out.push(`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }

    // تیتر
    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      if (level === 1 && !titleSkipped && out.length === 0) {
        titleSkipped = true; // عنوان مقاله — نادیده گرفته می‌شود
        i++;
        continue;
      }
      // h1 اضافی و h5/h6 را به بازه مجاز صفحه محدود می‌کنیم
      const tag = `h${Math.min(Math.max(level === 1 ? 2 : level, 2), 4)}`;
      out.push(`<${tag}>${inline(heading[2].trim())}</${tag}>`);
      i++;
      continue;
    }

    // خط جداکننده
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      out.push('<hr>');
      i++;
      continue;
    }

    // جدول
    if (/^\|.*\|$/.test(trimmed) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      flushParagraph();
      const head = tableRow(trimmed);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
        body.push(tableRow(lines[i].trim()));
        i++;
      }
      out.push(
        '<table>\n<thead>\n<tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr>\n</thead>\n<tbody>\n' +
        body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('\n') +
        '\n</tbody>\n</table>'
      );
      continue;
    }

    // نقل‌قول
    if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      const body: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        body.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote><p>${inline(body.join(' '))}</p></blockquote>`);
      continue;
    }

    // لیست (نشانه‌دار یا شماره‌دار)
    const bullet = /^[-*+]\s+(.*)$/;
    const numbered = /^\d+[.)]\s+(.*)$/;
    if (bullet.test(trimmed) || numbered.test(trimmed)) {
      flushParagraph();
      const ordered = numbered.test(trimmed);
      const re = ordered ? numbered : bullet;
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        const m = t.match(re);
        if (m) {
          items.push(m[1]);
          i++;
        } else if (t && /^\s{2,}/.test(lines[i]) && items.length) {
          // ادامه‌ی همان آیتم در خط بعد
          items[items.length - 1] += ' ' + t;
          i++;
        } else break;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>\n` + items.map((it) => `<li>${inline(it)}</li>`).join('\n') + `\n</${tag}>`);
      continue;
    }

    paragraph.push(trimmed);
    i++;
  }

  flushParagraph();
  return out.join('\n\n');
}

/** آیا این متن به اندازه کافی نشانه‌های Markdown دارد که تبدیلش ارزش داشته باشد؟ */
export function looksLikeMarkdown(text: string): boolean {
  const signals = [
    /^#{1,6}\s+\S/m,
    /\*\*[^*\n]+\*\*/,
    /^[-*+]\s+\S/m,
    /^\d+[.)]\s+\S/m,
    /\[[^\]]+\]\([^)]+\)/,
    /^>\s+\S/m,
    /^\|.*\|$/m,
    /```/,
  ];
  return signals.filter((re) => re.test(text)).length >= 1;
}
