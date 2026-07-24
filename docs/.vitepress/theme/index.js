// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import Card from "./components/Card.vue";
import ArticleCard from "./components/ArticleCard.vue";
import "viewerjs/dist/viewer.min.css";
import imageViewer from "vitepress-plugin-image-viewer";
import vImageViewer from "vitepress-plugin-image-viewer/lib/vImageViewer.vue";
import { useRoute } from "vitepress";
import ArticleMetadata from "./components/ArticleMetadata.vue";
import { initComponent } from "vitepress-plugin-legend/component";
import "vitepress-plugin-legend/dist/index.css";
/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      // 在文档标题之下插入自定义内容
      "doc-before": () => h(ArticleMetadata),
    });
  },
  enhanceApp({ app, router, siteData }) {
    app.component("Card", Card);
    app.component("ArticleCard", ArticleCard);
    app.component("vImageViewer", vImageViewer);
    initComponent(app);
  },
  setup() {
    const route = useRoute();
    // 启用插件
    imageViewer(route);
  },
};
