import { Fragment } from 'react';

/** کدهای لاتین استاندارد/فنی که در متن فارسی آمده‌اند */
const CODE = /(ISIRI\s?\d+(?:-\d+)?|ISO\s?\d+(?::\d+)?|DIN\s?\d+(?:-\d+)?|EN\s?\d+|PVC-U|SN\d+)/g;

/**
 * کد لاتین داخل متن راست‌به‌چپ (مثل «ISIRI 9116-3») با شکستن خط برعکس دیده می‌شد («3-9116»).
 * هر کد در یک span چپ‌به‌راست و بدون شکستن خط قرار می‌گیرد.
 */
export function LtrCodes({ text }: { text: string }) {
  return (
    <>
      {text.split(CODE).map((part, i) =>
        i % 2 ? (
          <span key={i} dir="ltr" className="inline-block whitespace-nowrap">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
