<template>
  <a :href="to" class="article-card" :class="{ 'article-card-dark': isDark }">
    <div class="article-card-body">
      <div class="article-card-header">
        <span v-if="category" class="article-card-category">{{
          category
        }}</span>
        <span class="article-card-arrow">→</span>
      </div>
      <div class="article-card-title">
        <slot name="title">默认标题</slot>
      </div>
      <div v-if="$slots.desc || desc" class="article-card-desc">
        <slot name="desc">{{ desc }}</slot>
      </div>
      <div v-if="tags && tags.length" class="article-card-tags">
        <span v-for="t in tags" :key="t" class="article-card-tag"
          >#{{ t }}</span
        >
      </div>
    </div>
  </a>
</template>

<script>
import { useData } from "vitepress";

export default {
  name: "ArticleCard",
  props: {
    to: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "",
    },
    desc: {
      type: String,
      default: "",
    },
    tags: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isDark: useData().isDark,
    };
  },
};
</script>

<style scoped>
.article-card {
  display: block;
  text-decoration: none;
  border: 1px solid var(--vp-c-divider, #eaeaea);
  border-radius: 12px;
  padding: 16px 20px;
  margin: 16px 0;
  background: var(--vp-c-bg-soft, #f9f9f9);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.article-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--vp-c-brand, #3eaf7c);
  border-radius: 12px 0 0 12px;
}
.article-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: var(--vp-c-brand, #3eaf7c);
}
.article-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.article-card-category {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-brand, #3eaf7c);
  background: var(--vp-c-brand-soft, rgba(62, 175, 124, 0.1));
  padding: 2px 8px;
  border-radius: 4px;
}
.article-card-arrow {
  color: var(--vp-c-text-3, #999);
  font-size: 16px;
  transition: transform 0.3s ease;
}
.article-card:hover .article-card-arrow {
  transform: translateX(4px);
  color: var(--vp-c-brand, #3eaf7c);
}
.article-card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1, #333);
  margin-bottom: 6px;
}
.article-card-desc {
  font-size: 14px;
  color: var(--vp-c-text-2, #666);
  line-height: 1.6;
}
.article-card-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.article-card-tag {
  font-size: 12px;
  color: var(--vp-c-text-3, #999);
  background: var(--vp-c-bg, #f0f0f0);
  padding: 2px 6px;
  border-radius: 4px;
}
.article-card-dark .article-card-tag {
  background: rgba(255, 255, 255, 0.06);
}
</style>
