<template>
  <div
    class="article-info"
    v-if="frontmatter.layout !== 'home' && frontmatter.wordCount"
  >
    <span>✍️字数：{{ frontmatter.wordCount }}字</span>
    <span class="separator"> | </span>
    <span>⏳ 预计阅读时间：{{ frontmatter.readingTime }}分钟</span>
  </div>
</template>

<script>
import { useData } from "vitepress";
// const { frontmatter } = useData();
export default {
  name: "Card",
  data() {
    return {
      frontmatter: useData().frontmatter,
    };
  },
};
</script>
<style scoped>
.article-info {
  margin-top: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--vp-c-text-2); /* 使用 VitePress 的次级文本颜色变量 */
}

.article-info .separator {
  opacity: 0.5;
}
</style>
