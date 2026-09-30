# umbrellacorp.ai — главная страница

Astro (статическая сборка) + TypeScript + CSS-токены. Задание и правила — `CLAUDE.md`, эталоны — `design/`.

## Команды

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # статический сайт в dist/
npm run preview   # предпросмотр сборки
```

Проверки (нужен `npx playwright install chromium`):

| Команда | Что делает |
|---|---|
| `npm run qa:compare` | попарные скриншоты секций «эталон \| сайт» на 1440 и 390 (dev-сервер) |
| `npm run qa:widths` | горизонтальный скролл и скриншоты на 360–1920 |
| `npm run qa:fold` | что помещается на первом экране |
| `npm run qa:interact` | меню, аккордеон, форма, анимации |
| `npm run qa:axe` / `qa:lighthouse` | доступность и Lighthouse (на `npm run preview -- --port 4322`) |

## Где что править

- **Все тексты** — `src/content/home.ts`. Типографика (неразрывные пробелы, суммы) расставляется автоматически.
  - `\n` в заголовке — перенос строки;
  - `[текст в скобках]` — плейсхолдер, на сайте виден в пунктирной мятной рамке;
  - `soon: true` у чипа модуля — пометка «скоро».
- **Endpoint формы** — `src/components/Demo.astro`, константа `endpoint`. Пока пусто — форма работает в демо-режиме (без отправки).
- **Счётчики** — `src/lib/analytics.ts` (`ymId`, `gaId`). Цели: `demo_click`, `ai_launch_click`, `demo_form_submit`.
- **Токены и стили** — `src/styles/global.css`.
- **Шрифт** — сейчас Inter Tight (`public/fonts`). Для TT Hoves Pro: положить woff2 в `public/fonts` и добавить `@font-face` с именем `TT Hoves Pro` — он уже первый в `--font`.
