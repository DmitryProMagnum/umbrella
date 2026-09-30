// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://umbrellacorp.ai',
  compressHTML: true,
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'always' },
  image: {
    // Ретина-версии hero берём из silk-hires.jpg, остальное — до 2x от макета
    responsiveStyles: false,
  },
});
