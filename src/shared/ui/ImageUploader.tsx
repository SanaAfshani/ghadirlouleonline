'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2, GripVertical } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { uploadImage } from '@/shared/lib/uploadImage';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  /** سقف اندازه/کیفیت ذخیره‌سازی — «hero» برای عکس‌های تمام‌عرض */
  profile?: 'default' | 'hero';
}

export function ImageUploader({ images, onChange, max = 8, profile }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = max - images.length;
    if (remaining <= 0) {
      toast.error(`حداکثر ${max} تصویر مجاز است`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    const results: string[] = [];
    for (const file of toUpload) {
      try {
        const url = await uploadImage(file, profile);
        results.push(url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'خطا در آپلود تصویر');
      }
    }

    if (results.length > 0) {
      onChange([...images, ...results]);
      toast.success(`${results.length} تصویر آپلود شد`);
    }
    setUploading(false);
  };

  const remove = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const moveFirst = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    [next[0], next[idx]] = [next[idx], next[0]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {/* Uploaded images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-800">
              <Image src={url} alt={`تصویر ${i + 1}`} fill className="object-cover" />

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => moveFirst(i)}
                    title="تصویر اصلی"
                    className="w-7 h-7 rounded-lg bg-amber-500 text-black flex items-center justify-center hover:bg-amber-400 transition-colors"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main badge */}
              {i === 0 && (
                <span className="absolute top-1.5 right-1.5 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  اصلی
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {images.length < max && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 transition-colors disabled:opacity-50
              ${dragOver
                ? 'border-amber-500 bg-amber-500/5 text-amber-400'
                : 'border-slate-700 text-slate-500 hover:border-amber-500 hover:text-amber-400'
              }`}
          >
            {uploading ? (
              <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
            ) : (
              <ImagePlus className="w-7 h-7" />
            )}
            <div className="text-sm text-center">
              <div className="font-medium">
                {uploading ? 'در حال آپلود...' : 'کلیک کنید یا تصویر را بکشید'}
              </div>
              <div className="text-xs mt-1 text-slate-600">
                JPG، PNG، WebP — حداکثر ۱۰ مگابایت — تا {max} تصویر
              </div>
            </div>
          </button>
        </>
      )}
    </div>
  );
}
