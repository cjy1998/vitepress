import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // githubpage中这样配置/vitepress/
  base: "/",
  lang: "zh-CN",
  title: "知识便签",
  description: "日常知识积累",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/right.png",
    nav: [
      {
        text: "前端",
        items: [
          {
            text: "Vue",
            link: "/vue3/index",
          },
          {
            text: "React",
            link: "/react/React/base",
          },
          {
            text: "数据可视化",
            link: "/datav/Threejs/index.md",
          },
          { text: "微信小程序", link: "/wechat/index.md" },

          { text: "TypeScript", link: "/typescript/index.md" },
          {
            text: "项目构建",
            link: "/construct/docker/index",
          },

          {
            text: "css",
            link: "/css/grid",
          },
          { text: "软考", link: "/soft/index" },
        ],
      },
      {
        text: "后端",
        items: [
          { text: "Prisma", link: "/server/database/prisma/base.md" },
          {
            text: "python",
            items: [
              { text: "Django", link: "/server/python/Django/django.md" },
            ],
          },
        ],
      },
      {
        text: "案例",
        items: [
          { text: "数据大屏", link: "/bigScreen/index.md" },
          // { text: 'H5', link: '/react' },
          // { text: '微信小程序', link: '/wechat/index.md' },
          // { text: 'Vue3后台管理系统', link: '/typescript' },
          // { text: 'React后台管理系统', link: '/node' },
        ],
      },
      {
        text: "日常积累",
        items: [
          { text: "面试题", link: "/everyday/interview/index.md" },
          { text: "小技巧", link: "/everyday/skill/index.md" },
        ],
      },
    ],
    sidebar: {
      "/wechat/": [
        {
          text: "微信小程序",
          items: [
            { text: "配置文件", link: "/wechat/01" },
            { text: "样式", link: "/wechat/02" },
            { text: "事件系统", link: "/wechat/03" },
            { text: "运行机制和生命周期", link: "/wechat/04" },
          ],
        },
      ],
      "/datav/": [
        {
          text: "数据可视化",
          items: [{ text: "Threejs", link: "/datav/Threejs/index.md" }],
        },
      ],
      "/react/": [
        {
          text: "React",
          items: [
            { text: "React基础", link: "/react/React/base" },
            { text: "Taro", link: "/react/Taro/base" },
            { text: "nextjs", link: "/react/nextjs/base" },
          ],
        },
      ],
      "/construct/": [
        {
          text: "项目构建",
          items: [
            {
              text: "利用Jenkins和Docker部署Next.js项目的完整指南",
              link: "/construct/Jenkins/CICD",
            },
            {
              text: "Docker",
              link: "/construct/docker/index",
            },
            { text: "Github Action", link: "/construct/GithubAction/index.md" },
            { text: "webpack", link: "/construct/webpack/index" },
            { text: "npm", link: "/construct/npm/index" },
          ],
        },
      ],
      "/css/": [
        {
          text: "css",
          items: [
            { text: "Grid", link: "/css/grid" },
            { text: "BEM", link: "/css/bem" },
          ],
        },
      ],
      "/vue3/": [
        {
          text: "Vue3",
          items: [
            { text: "基础知识", link: "/vue3/index" },
            { text: "开发规范", link: "/vue3/vue3开发规范" },
          ],
        },
      ],
      "/react/nextjs/": [
        {
          text: "Nextjs",
          items: [
            { text: "基础知识1", link: "/react/nextjs/base" },
            { text: "基础知识2", link: "/react/nextjs/up" },
            { text: "Auth.js", link: "/react/nextjs/NextAuth" },
            { text: "设置PostgreSQL数据库", link: "/react/nextjs/PostgreSQL" },
          ],
        },
      ],
      "/server/python/Django/": [
        {
          text: "django",
          items: [
            { text: "django基础知识", link: "/server/python/Django/django.md" },
            { text: "DRF", link: "/server/python/Django/DRF.md" },
            { text: "DRF2", link: "/server/python/Django/DRF2.md" },
          ],
        },
      ],
      "/vps/": [
        {
          text: "vps",
          items: [{ text: "常用命令", link: "/vps/sys.md" }],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/cjy1998" },
      // {svg: '<svg t="1703159905144" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5485" width="200" height="200"><path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z" fill="#C71D23" p-id="5486"></path></svg>', link: 'https://twitter.com/cjy1998'}
    ],
    search: {
      provider: "local",
    },
    outline: {
      label: "页面导航",
    },
    footer: {
      copyright: "Copyright © 2024 知识便签",
      message: "知识是财富，分享是快乐！",
    },
    lastUpdated: {
      text: "上次更新",
      formatOptions: {
        dateStyle: "full",
        timeStyle: "medium",
      },
    },
    markdown: {
      config: (md) => {
        md.use(wordCountPlugin);
      },
    },
  },
  transformHead({ assets }) {
    // 匹配 LXGW WenKai Mono 字体文件
    const myFontFile = assets.find((file) =>
      /lxgw-wenkai-mono.*\.woff2/.test(file)
    );
    if (myFontFile) {
      return [
        [
          "link",
          {
            rel: "preload",
            href: myFontFile,
            as: "font",
            type: "font/woff2",
            crossorigin: "",
          },
        ],
      ];
    }
  },
});
// 自定义字数统计插件
function wordCountPlugin(md) {
  md.core.ruler.push("word_count", (state) => {
    state.tokens.forEach((token) => {
      if (token.type === "inline") {
        const text = token.content;
        const wordCount = text.replace(/\s+/g, "").length; // 去除空格统计字数
        token.meta = token.meta || {};
        token.meta.wordCount = wordCount;
      }
    });
  });
}
