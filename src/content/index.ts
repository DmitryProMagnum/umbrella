/** Тексты страницы по языку: ru — src/content/home.ts, en — src/content/home.en.ts */
import { home } from './home';
import { homeEn } from './home.en';

export type Locale = 'ru' | 'en';
export const locales: Locale[] = ['ru', 'en'];

export function getContent(locale?: string) {
  return locale === 'en' ? homeEn : home;
}
