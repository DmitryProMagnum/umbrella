/* Анимации на GSAP для всего сайта: плавная прокрутка, заголовки по строкам,
   текст по словам, появление блоков, магнитные кнопки, свечение за курсором.
   Тематические scroll-анимации (потоки, маршрут, маржа, шторка AI, бегущие строки)
   остаются в scroll.css — этот модуль их не трогает. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(s));
const CLEAR = 'transform,opacity,filter,clipPath,transition,visibility';

/* ---------- Кнопки: перекат букв (на любом устройстве) и рябь ---------- */
$$<HTMLElement>('.btn').forEach((btn) => {
  if (btn.querySelector('.roll')) return;
  Array.from(btn.childNodes).forEach((node) => {
    const text = node.nodeType === 3 ? node.textContent!.trim() : '';
    if (!text) return;
    const letters = () => text.split('').map((ch, i) => `<i style="--i:${i}">${ch === ' ' ? '&nbsp;' : ch}</i>`).join('');
    const roll = document.createElement('span');
    roll.className = 'roll';
    roll.setAttribute('aria-hidden', 'true');
    roll.innerHTML = `<span class="roll__a">${letters()}</span><span class="roll__b">${letters()}</span>`;
    if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', text);
    btn.replaceChild(roll, node);
  });
});
if (!reduce) {
  document.addEventListener('pointerdown', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.btn, .seg button, .stepper button, .opt');
    if (!b) return;
    const r = b.getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.left = `${e.clientX - r.left}px`;
    dot.style.top = `${e.clientY - r.top}px`;
    dot.style.setProperty('--rs', String(Math.ceil(Math.max(r.width, r.height) / 4)));
    b.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  });
}

if (!reduce) {
  document.documentElement.classList.add('motion-gsap');

  /* ---------- Плавная прокрутка ---------- */
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

  // якоря — плавно, с отступом под липкую шапку
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    // отступ под шапку Lenis берёт сам из scroll-padding-top в CSS
    lenis.scrollTo(target, { duration: 1.4, easing: (x) => 1 - Math.pow(1 - x, 4) });
    history.pushState(null, '', url.hash);
  });
  // открытое мобильное меню — прокрутка страницы на паузе
  new MutationObserver(() => {
    if (document.body.classList.contains('menu-open')) lenis.stop(); else lenis.start();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  /* ---------- Шапка выезжает при загрузке ---------- */
  if (document.querySelector('[data-header]')) gsap.from('[data-header]', { yPercent: -100, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.1, clearProps: 'transform,opacity' });

  /* ---------- Прогресс прокрутки — там, где нет CSS scroll-timeline ---------- */
  const prog = document.querySelector('.scroll-progress');
  if (prog && !CSS.supports('animation-timeline: scroll()')) {
    gsap.fromTo(prog, { scaleX: 0 }, { scaleX: 1, ease: 'none', transformOrigin: '0 50%', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  }

  // Появление по прокрутке, один раз; перед твином гасим CSS-transition, после — чистим инлайн-стили
  const reveal = (targets: Element[], vars: gsap.TweenVars, trigger?: Element | string, start = 'top 88%') => {
    if (!targets.length) return;
    gsap.set(targets, { transition: 'none' });
    gsap.from(targets, {
      opacity: 0, y: 48, duration: 1, ease: 'power3.out', clearProps: CLEAR,
      scrollTrigger: { trigger: trigger ?? targets[0], start, once: true },
      ...vars,
    });
  };

  const init = () => {
    /* ---------- Заголовки: строки выезжают из-под маски ---------- */
    $$('.h2').forEach((h) => {
      SplitText.create(h, {
        type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 115, rotate: 1.5, transformOrigin: '0 100%', duration: 1.15, ease: 'expo.out', stagger: 0.09,
          scrollTrigger: { trigger: h, start: 'top 88%', once: true },
        }),
      });
    });

    /* ---------- Метки секций «NN — Название» ---------- */
    $$('.eyebrow, .proof__label').forEach((el) => reveal([el], { x: -24, y: 0, duration: 0.8 }, el, 'top 90%'));

    /* ---------- Лиды: слова проявляются из размытия ---------- */
    $$('.sec-head .lead, .split__text .lead, .ai__lead, .video .lead').forEach((p) => {
      SplitText.create(p, {
        type: 'words', wordsClass: 'split-word', autoSplit: true,
        onSplit: (self) => gsap.from(self.words, {
          opacity: 0, y: 12, filter: 'blur(8px)', duration: 0.8, ease: 'power2.out', stagger: 0.018,
          scrollTrigger: { trigger: p, start: 'top 88%', once: true },
        }),
      });
    });

    /* ---------- «Проверено в работе»: текст загорается по словам вместе с прокруткой ---------- */
    $$('.proof__text').forEach((p) => {
      p.classList.add('scrub-words');
      SplitText.create(p, {
        type: 'words', wordsClass: 'split-word', autoSplit: true,
        onSplit: (self) => gsap.to(self.words, {
          opacity: 1, ease: 'none', stagger: 0.1,
          scrollTrigger: { trigger: p, start: 'top 85%', end: 'bottom 45%', scrub: 0.6 },
        }),
      });
    });

    /* ---------- Карточки и блоки: появляются пачками со сдвигом ---------- */
    const batch = (sel: string, vars: gsap.TweenVars = {}) => {
      const els = $$(sel);
      if (!els.length) return;
      gsap.set(els, { opacity: 0, y: 64, scale: 0.97, transition: 'none' });
      ScrollTrigger.batch(els, {
        start: 'top 90%', once: true,
        onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', stagger: 0.1, clearProps: CLEAR, overwrite: true, ...vars }),
      });
    };
    // «Проблема»: на ≥768 карточки — липкая стопка; полупрозрачная карточка просвечивала бы текстом нижней,
    // поэтому там только подъём без прозрачности, а на телефоне — обычное появление
    if (window.matchMedia('(min-width: 768px)').matches) {
      const cards = $$('.pcard');
      if (cards.length) gsap.set(cards, { transition: 'none' });
      cards.forEach((c) => gsap.from(c, { y: 90, duration: 1.1, ease: 'expo.out', clearProps: CLEAR, scrollTrigger: { trigger: c, start: 'top 95%', once: true } }));
    } else {
      batch('.pcard');
    }
    batch('.role, .bento__feature, .bento__cta');
    batch('.metric, .facts, .ip, .flows-m');
    batch('.split__text .checklist li', { stagger: 0.08 });
    batch('.split__text .link-more, .soon-badge, [data-ai-interest]');

    /* ---------- Визуалы секций: раскрываются из скруглённой «шторки» ---------- */
    $$('.split__visual').forEach((v) => {
      gsap.set(v, { transition: 'none' });
      gsap.fromTo(v, { clipPath: 'inset(14% 8% 14% 8% round 40px)', opacity: 0.3, scale: 0.96 }, {
        clipPath: 'inset(0% 0% 0% 0% round 0px)', opacity: 1, scale: 1, duration: 1.4, ease: 'expo.out', clearProps: CLEAR,
        scrollTrigger: { trigger: v, start: 'top 85%', once: true },
      });
    });

    /* ---------- Финальный блок: панель «доезжает» до полного размера вместе с прокруткой ---------- */
    $$('.demo').forEach((d) => {
      gsap.fromTo(d, { scale: 0.92, borderRadius: 64 }, {
        scale: 1, borderRadius: getComputedStyle(d).borderRadius, ease: 'none',
        scrollTrigger: { trigger: d, start: 'top bottom', end: 'top 35%', scrub: 0.6 },
      });
    });

    /* ---------- Подвал: колонки поднимаются по очереди ---------- */
    const footer = document.querySelector('.footer');
    if (footer) reveal($$('.footer__brand, .fcol', footer), { y: 32, stagger: 0.08, duration: 0.9 }, footer, 'top 85%');

    /* ---------- Бегущие строки наклоняются от скорости прокрутки ---------- */
    const ticker = document.querySelector<HTMLElement>('.ticker');
    if (ticker) {
      const skew = gsap.quickTo(ticker, 'skewX', { duration: 0.5, ease: 'power3' });
      lenis.on('scroll', ({ velocity }: { velocity: number }) => skew(gsap.utils.clamp(-8, 8, -velocity * 0.35)));
    }

    /* ---------- Магнитные кнопки и свечение за курсором (только мышь) ---------- */
    if (fine) {
      $$('.btn').forEach((b) => {
        const x = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
        const y = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
        b.addEventListener('pointermove', (e) => {
          const r = b.getBoundingClientRect();
          x((e.clientX - r.left - r.width / 2) * 0.22);
          y((e.clientY - r.top - r.height / 2) * 0.32);
        });
        b.addEventListener('pointerleave', () => { x(0); y(0); });
      });
      $$('.demo, .bento__feature, .calc, .sched, .tier--hit, .addon.card--dark').forEach((panel) => {
        if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
        panel.classList.add('has-glow');
        const glow = document.createElement('span');
        glow.className = 'glow';
        glow.setAttribute('aria-hidden', 'true');
        panel.prepend(glow);
        panel.addEventListener('pointermove', (e) => {
          const r = panel.getBoundingClientRect();
          panel.style.setProperty('--mx', `${e.clientX - r.left}px`);
          panel.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
      });
    }

    ScrollTrigger.refresh();
  };

  // строки заголовков считаются по реальному шрифту — ждём его загрузки
  (document.fonts?.ready ?? Promise.resolve()).then(init);
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
