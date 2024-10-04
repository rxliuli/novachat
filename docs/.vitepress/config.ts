import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'NovaChat',
  base: '/',
  head: [['link', { rel: 'icon', type: 'image/png', href: '/icon/16.png' }]],
  themeConfig: {
    logo: '/logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/rxliuli/novachat' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present NovaChat',
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      description:
        'A ChatUI that supports plugins and prioritizes local processing.',
      themeConfig: {
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Introduction', link: '/guide/intro' },
              { text: 'OpenAI', link: '/guide/openai' },
              { text: 'Plugin Usage', link: '/guide/plugin-usage' },
            ],
          },
          {
            text: 'Plugin',
            items: [{ text: 'Introduction', link: '/plugin/intro' }],
          },
        ],
      },
    },
    'zh-CN': {
      label: '简体中文',
      lang: 'zh-CN',
      description: '一个支持插件、优先本地处理的 ChatUI',
      themeConfig: {
        sidebar: [
          {
            text: '指南',
            items: [
              { text: '介绍', link: '/zh-CN/guide/intro' },
              {
                text: '使用 OpenAI',
                link: '/zh-CN/guide/openai',
              },
              {
                text: '使用插件',
                link: '/zh-CN/guide/plugin-usage',
              },
            ],
          },
          {
            text: '插件',
            items: [
              {
                text: '介绍',
                link: '/zh-CN/plugin/',
              },
              {
                text: '开发插件',
                link: '/zh-CN/plugin/dev',
              },
            ],
          },
        ],
      },
    },
  },
  markdown: {
    breaks: true,
  },
})
