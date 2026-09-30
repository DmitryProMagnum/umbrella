/**
 * Мини-типограф для русских текстов.
 * - неразрывный пробел после коротких предлогов/союзов и перед тире;
 * - неразрывные пробелы в суммах («184 500 ₽») и после «№».
 * Применяется ко всему файлу контента один раз при сборке.
 */
const NBSP = ' ';
const SHORT = [
  'в', 'и', 'а', 'с', 'к', 'о', 'у', 'по', 'на', 'до', 'из', 'не',
  'за', 'от', 'для', 'без', 'при', 'но', 'во', 'со', 'об', 'что',
];
const shortRe = new RegExp(`(^|[\\s${NBSP}«(„"—])(${SHORT.join('|')})\\s+`, 'giu');

export function typo(input: string): string {
  if (!input || input.startsWith('#') || input.startsWith('/') || input.startsWith('http')) return input;
  let s = input;
  // дважды — чтобы поймать цепочки вроде «и в»
  s = s.replace(shortRe, (_m, pre, word) => `${pre}${word}${NBSP}`);
  s = s.replace(shortRe, (_m, pre, word) => `${pre}${word}${NBSP}`);
  s = s.replace(/ +—/g, `${NBSP}—`);
  s = s.replace(/(\d) (?=\d{3}\b)/g, `$1${NBSP}`);
  s = s.replace(/(\d) (?=\d{3}\b)/g, `$1${NBSP}`);
  s = s.replace(/(\d) (₽|ч|%|млн)/g, `$1${NBSP}$2`);
  s = s.replace(/(млн) ₽/g, `$1${NBSP}₽`);
  s = s.replace(/№ /g, `№${NBSP}`);
  return s;
}

type Json = string | number | boolean | null | undefined | Json[] | { [k: string]: Json };

export function deepTypo<T>(value: T): T {
  const walk = (v: Json): Json => {
    if (typeof v === 'string') return typo(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      const out: { [k: string]: Json } = {};
      for (const [k, val] of Object.entries(v)) {
        // служебные поля не трогаем
        out[k] = k === 'href' || k === 'id' || k === 'icon' || k === 'img' ? val : walk(val);
      }
      return out;
    }
    return v;
  };
  return walk(value as Json) as T;
}

/** Плейсхолдер вида «[N]» — показываем пунктирной мятной рамкой. */
export const isPlaceholder = (s: string) => /^\[.*\]$/s.test(s.trim());
