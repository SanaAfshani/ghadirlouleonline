export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price?: number;
  images: string[];
  category: Category;
  categoryId: string;
  specifications: Record<string, string>;
  inStock: boolean;
  featured: boolean;
  published: boolean;
  /** فیلدهای سئو — اختیاری؛ در صورت خالی بودن از name/shortDescription استفاده می‌شود */
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  /** سوالات متداول اختصاصی این محصول (در انتهای صفحه به صورت آکاردئون) */
  faqs: FaqItem[];
  /** کاتالوگ‌ها و مدارک فنی محصول (PDF) */
  catalogs: CatalogFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: { products: number };
  published: boolean;
  order: number;
}

/** یک سوال متداول اختصاصی یک صفحه (مقاله یا محصول) */
export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * یک کاتالوگ/مدرک فنی محصول. دو حالت دارد:
 *  - PDF: فقط `url` پر است
 *  - تصویری: `pages` آدرس صفحه‌هاست (کاتالوگ‌هایی که فقط عکس هستند، نه PDF)
 */
export interface CatalogFile {
  title: string;
  url?: string;
  pages?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  pdfUrl?: string;
  author: User;
  authorId: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  readTime: number;
  viewCount: number;
  /** فیلدهای سئو — اختیاری؛ در صورت خالی بودن از title/excerpt استفاده می‌شود */
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  /** سوالات متداول اختصاصی این مقاله (در انتهای صفحه به صورت آکاردئون) */
  faqs: FaqItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  images: string[];
  location: string;
  year: number;
  client?: string;
  published: boolean;
  featured: boolean;
  createdAt: Date;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  published: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  company?: string;
  position?: string;
  content: string;
  rating: number;
  avatar?: string;
  published: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  avatar?: string;
  createdAt: Date;
}

export interface SiteSettings {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'image' | 'json' | 'boolean' | 'number';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
