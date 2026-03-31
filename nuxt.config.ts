// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  // Cloudflare Pages 预设
  nitro: {
    preset: 'cloudflare-pages',
  },

  // 自动导入 composables
  imports: {
    dirs: ['composables'],
  },

  // 全局 CSS
  css: [
    '~/assets/css/main.css',
    '~/assets/css/theme.css',
    '~/assets/css/animation.css',
    'animate.css/animate.min.css',
  ],

  // Head 配置
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      charset: 'UTF-8',
      viewport: 'width=device-width, initial-scale=1.0',
      title: '智能日历管家 - 高效管理您的日程',
      meta: [
        { name: 'description', content: '一款智能的日历应用，帮助您高效管理日程、节假日和待办事项，提升时间管理效率。' },
        { name: 'keywords', content: '日历,日程管理,时间管理,待办事项,节假日' },
      ],
      link: [
        { rel: 'icon', href: '/icon.png' },
      ],
      script: [
        { src: 'https://unpkg.com/holiday-calendar/src/index.min.js' },
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('calendar_theme_type');if(t&&t!=='default'){var m={'deep-dawn':'theme-deep-dawn','twilight-rose':'theme-twilight-rose','amber-night':'theme-amber-night','coral-sand':'theme-coral-sand','azure-flame':'theme-azure-flame','sunset-bay':'theme-sunset-bay','emerald-gold':'theme-emerald-gold','violet-spring':'theme-violet-spring','royal-gold':'theme-royal-gold','midnight-blue':'theme-midnight-blue'};var c=m[t];if(c){document.documentElement.classList.add(c);if(t==='midnight-blue')document.documentElement.classList.add('dark-mode')}}}catch(e){}})();`,
          tagPosition: 'head',
        },
      ],
    },
  },

  // 不在 SSR 中渲染 Naive UI（客户端使用）
  build: {
    transpile: ['naive-ui', '@juggle/resize-observer', 'vueuc'],
  },

  // TypeScript 配置
  typescript: {
    strict: false,
  },
})
