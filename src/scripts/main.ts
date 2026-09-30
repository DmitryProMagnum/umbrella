/* Интерактив страницы: vanilla TS, без зависимостей. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqDesktopish = window.matchMedia('(min-width: 768px)');

/* ---------- Аналитика: цели ---------- */
declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
const YM_ID = (document.querySelector('meta[name="ym-id"]') as HTMLMetaElement | null)?.content;
export function track(goal: string, params: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: goal, ...params });
  if (window.ym && YM_ID) window.ym(Number(YM_ID), 'reachGoal', goal, params);
  if (window.gtag) window.gtag('event', goal, params);
}
document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-goal]');
  if (el && el.tagName === 'A') track(el.dataset.goal!);
});

/* ---------- Масштабирование фиксированных канвасов (hero-сцена, диаграмма, визуалы) ---------- */
const fits = Array.from(document.querySelectorAll<HTMLElement>('[data-fit]'));
function applyFit() {
  for (const el of fits) {
    const w = Number(el.dataset.fit);
    const min = Number(el.dataset.fitMin || 0);
    const canvas = el.firstElementChild as HTMLElement | null;
    if (!canvas) continue;
    if (window.innerWidth < min) {
      canvas.style.removeProperty('--fit');
      continue;
    }
    const max = Number(el.dataset.fitMax || 1);
    const k = Math.min(max, el.clientWidth / w);
    canvas.style.setProperty('--fit', k.toFixed(4));
  }
}
applyFit();
if ('ResizeObserver' in window) {
  const ro = new ResizeObserver(() => applyFit());
  fits.forEach((el) => ro.observe(el));
} else {
  window.addEventListener('resize', applyFit);
}

/* ---------- Липкая шапка ---------- */
const header = document.querySelector<HTMLElement>('[data-header]');
const onScrollHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);

/* ---------- Мобильное меню ---------- */
const menu = document.querySelector<HTMLElement>('[data-menu]');
const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
const closeBtn = document.querySelector<HTMLButtonElement>('[data-menu-close]');
function setMenu(open: boolean) {
  if (!menu || !openBtn) return;
  menu.classList.toggle('is-open', open);
  menu.inert = !open;
  openBtn.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  if (open) closeBtn?.focus();
  else openBtn.focus({ preventScroll: true });
}
openBtn?.addEventListener('click', () => setMenu(true));
closeBtn?.addEventListener('click', () => setMenu(false));
menu?.querySelectorAll('[data-menu-link]').forEach((a) =>
  a.addEventListener('click', () => {
    menu.classList.remove('is-open');
    menu.inert = true;
    openBtn?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }),
);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu?.classList.contains('is-open')) setMenu(false);
  // простая ловушка фокуса
  if (e.key === 'Tab' && menu?.classList.contains('is-open')) {
    const f = Array.from(menu.querySelectorAll<HTMLElement>('a, button'));
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
window.matchMedia('(min-width: 1200px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

/* ---------- Аккордеон модулей (mobile) ---------- */
document.querySelectorAll<HTMLElement>('[data-accordion]').forEach((root) => {
  const items = Array.from(root.querySelectorAll<HTMLElement>('.acc'));
  items.forEach((item) => {
    const btn = item.querySelector<HTMLButtonElement>('.acc__btn')!;
    btn.addEventListener('click', () => {
      const willOpen = btn.getAttribute('aria-expanded') !== 'true';
      items.forEach((it) => {
        const open = it === item && willOpen;
        it.classList.toggle('is-open', open);
        it.querySelector('.acc__btn')!.setAttribute('aria-expanded', String(open));
        (it.querySelector('.acc__panel') as HTMLElement).inert = !open;
      });
      if (willOpen && !reduceMotion.matches) {
        // после раскрытия — мягко довести пункт до видимой области
        setTimeout(() => {
          const r = item.getBoundingClientRect();
          if (r.top < 72) window.scrollBy({ top: r.top - 80, behavior: 'smooth' });
        }, 360);
      }
    });
  });
});

/* ---------- Появление секций и UI-анимации ---------- */
const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal], [data-anim], .tree');
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

/* кольцевая диаграмма: дорисовка при появлении */
document.querySelectorAll<SVGCircleElement>('.donut__arc').forEach((arc) => {
  if (reduceMotion.matches) return;
  const dash = arc.dataset.dash!, circ = arc.dataset.circ!;
  arc.style.strokeDasharray = `0 ${circ}`;
  const host = arc.closest('[data-anim]');
  if (!host) return;
  const mo = new MutationObserver(() => {
    if (host.classList.contains('is-in')) {
      requestAnimationFrame(() => (arc.style.strokeDasharray = `${dash} ${circ}`));
      mo.disconnect();
    }
  });
  mo.observe(host, { attributes: true, attributeFilter: ['class'] });
});

/* ---------- Лёгкий параллакс + наклон окна портала ---------- */
const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
const tiltEl = document.querySelector<HTMLElement>('[data-tilt]');
let ticking = false;

function frame() {
  ticking = false;
  onScrollHeader();
  if (reduceMotion.matches) return;
  const vh = window.innerHeight;
  const enabled = mqDesktopish.matches;
  for (const el of parallaxEls) {
    if (!enabled) { el.style.transform = ''; continue; }
    const host = el.parentElement!;
    const r = host.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) continue;
    const speed = Number(el.dataset.parallax);
    const delta = r.top + r.height / 2 - vh / 2;
    el.style.transform = `translate3d(0, ${(-delta * speed).toFixed(1)}px, 0)`;
  }
  if (tiltEl && enabled) {
    // окно «ложится» в сцену, пока сцена поднимается от низа экрана к верхней четверти
    const top = tiltEl.parentElement!.getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, (vh - top) / (vh * 0.75)));
    const rot = 9 * (1 - p);
    const lift = 18 * (1 - p);
    tiltEl.style.transform = `perspective(2200px) rotateX(${rot.toFixed(2)}deg) translate3d(0, ${lift.toFixed(1)}px, 0)`;
  }
}
const requestFrame = () => {
  if (!ticking) { ticking = true; requestAnimationFrame(frame); }
};
window.addEventListener('scroll', requestFrame, { passive: true });
window.addEventListener('resize', requestFrame);
frame();

/* ---------- Видеофон первого экрана ---------- */
// Грузим и запускаем только при движении и нормальном соединении; вне экрана — пауза.
const heroVideo = document.querySelector<HTMLVideoElement>('[data-hero-video]');
if (heroVideo) {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const lowData = Boolean(conn?.saveData) || /(^|-)2g$/.test(conn?.effectiveType ?? '');
  const mqMobile = window.matchMedia('(max-width: 767.98px)');
  const pickSrc = () => (mqMobile.matches ? heroVideo.dataset.srcMobile! : heroVideo.dataset.srcDesktop!);
  let started = false;
  let visible = true;

  const play = () => { heroVideo.play().catch(() => { /* автозапуск запрещён (энергосбережение) — остаётся постер */ }); };
  const start = () => {
    if (started || reduceMotion.matches || lowData) return;
    started = true;
    heroVideo.muted = true;
    heroVideo.src = pickSrc();
    play();
  };
  heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-playing'));

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) { if (started) heroVideo.pause(); return; }
    if (started) play(); else start();
  }, { threshold: 0.05 }).observe(heroVideo.parentElement!);

  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) { heroVideo.pause(); heroVideo.classList.remove('is-playing'); }
    else if (visible) { if (started) play(); else start(); }
  });
  // смена брейкпоинта (поворот планшета/окно) — свой вариант ролика
  mqMobile.addEventListener('change', () => {
    if (!started) return;
    heroVideo.classList.remove('is-playing');
    heroVideo.src = pickSrc();
    if (visible && !reduceMotion.matches) play();
  });
}

/* ---------- Кнопка «Узнать о запуске первым» → форма с меткой ai ---------- */
const interestInput = document.querySelector<HTMLInputElement>('[data-interest]');
const aiNote = document.querySelector<HTMLElement>('[data-ai-note]');
document.querySelectorAll('[data-ai-interest]').forEach((a) =>
  a.addEventListener('click', () => {
    if (interestInput) interestInput.value = 'ai';
    if (aiNote) aiNote.hidden = false;
    // фокус в первое поле после прокрутки
    setTimeout(() => document.getElementById('d-name')?.focus({ preventScroll: true }), reduceMotion.matches ? 0 : 700);
  }),
);

/* ---------- Форма демо ---------- */
const form = document.querySelector<HTMLFormElement>('[data-demo-form]');
if (form) {
  const msgs = JSON.parse(document.getElementById('form-messages')?.textContent || '{}') as Record<string, string>;
  const nameI = form.querySelector<HTMLInputElement>('#d-name')!;
  const contactI = form.querySelector<HTMLInputElement>('#d-contact')!;
  const errBox = form.querySelector<HTMLElement>('[data-form-error]')!;
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const label = form.querySelector<HTMLElement>('[data-submit-label]')!;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const isPhone = (v: string) => {
    const d = v.replace(/[\s()\-‑–]/g, '');
    return /^(\+7|8|7)\d{10}$/.test(d) || /^\+\d{10,15}$/.test(d);
  };
  const setErr = (input: HTMLInputElement, msg: string) => {
    const box = document.getElementById(`${input.id}-err`);
    if (box) box.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  const validate = () => {
    let ok = true;
    const n = nameI.value.trim();
    const c = contactI.value.trim();
    if (!n) { setErr(nameI, msgs.required); ok = false; } else setErr(nameI, '');
    if (!c) { setErr(contactI, msgs.required); ok = false; }
    else if (!emailRe.test(c) && !isPhone(c)) { setErr(contactI, msgs.contact); ok = false; }
    else setErr(contactI, '');
    return ok;
  };
  [nameI, contactI].forEach((i) =>
    i.addEventListener('blur', () => { if (i.getAttribute('aria-invalid') === 'true' || i.value) validate(); }),
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBox.hidden = true;
    if (!validate()) {
      form.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    // honeypot: боты заполняют скрытое поле — делаем вид, что всё ок
    if (data.website) { form.classList.add('is-success'); return; }
    delete data.website;

    form.classList.add('is-loading');
    submitBtn.disabled = true;
    label.textContent = msgs.sending;
    try {
      const endpoint = form.dataset.endpoint;
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, page: location.href }),
        });
        if (!res.ok) throw new Error(String(res.status));
      } else {
        // [endpoint не задан] — режим демонстрации
        await new Promise((r) => setTimeout(r, 900));
        console.info('[demo form] endpoint не настроен, данные не отправлены:', data);
      }
      track('demo_form_submit', { interest: data.interest || 'demo' });
      form.classList.add('is-success');
      form.querySelector<HTMLElement>('[data-form-again]')?.focus({ preventScroll: true });
    } catch {
      errBox.hidden = false;
    } finally {
      form.classList.remove('is-loading');
      submitBtn.disabled = false;
      label.textContent = msgs.submit;
    }
  });

  form.querySelector('[data-form-again]')?.addEventListener('click', () => {
    form.reset();
    form.classList.remove('is-success');
    if (aiNote) aiNote.hidden = true;
    if (interestInput) interestInput.value = '';
    nameI.focus();
  });
}
