import type { AnySection, ContentPage } from './types';
import { aboutPage } from './pages/about';
import { globalPage } from './pages/global';
import { homePage } from './pages/home';
import { blogPage } from './pages/blog';
import { projectsPage } from './pages/projects';
import { faqPage } from './pages/faq';
import { searchPage } from './pages/search';
import { productsPage } from './pages/products';
import { pricesPage, trackPage } from './pages/prices';
import { servicesPage } from './pages/services';
import { contactPage } from './pages/contact';
import { projectInquiryPage } from './pages/project-inquiry';
import { privacyPage, termsPage } from './pages/legal';
import { factoryPage } from './pages/factory';
import { certificatesPage } from './pages/certificates';
import { officialRepresentativePage } from './pages/official-representative';

/** همه صفحه‌هایی که در پنل «محتوای صفحات» ویرایش می‌شوند، به ترتیب نمایش در پنل */
export const CONTENT_PAGES: ContentPage[] = [
  globalPage,
  homePage,
  productsPage,
  pricesPage,
  trackPage,
  aboutPage,
  factoryPage,
  certificatesPage,
  officialRepresentativePage,
  servicesPage,
  contactPage,
  projectInquiryPage,
  blogPage,
  projectsPage,
  faqPage,
  searchPage,
  privacyPage,
  termsPage,
];

const SECTIONS = new Map<string, AnySection>(CONTENT_PAGES.flatMap((page) => page.sections.map((s) => [s.key, s] as const)));

export function findSection(key: string): AnySection | undefined {
  return SECTIONS.get(key);
}
