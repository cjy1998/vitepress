---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "保持热爱"
  text: "兴趣是最好的老师"
  tagline:
    不积跬步无以至千里
    # 右边图片
  image:
    src: /chuizi.png
    alt: VitePress

  # actions:
  #   - theme: brand
  #     text: 快速导航->
  #     link: /markdown-examples
  #   - theme: alt
  #     text: API Examples
  #     link: /api-examples
# features:
#    - icon:
#       src: /ts.svg
#      title: TypeScript
#      details: Lorem ipsum...
#    - icon:
#       src: /vue.svg
#      title: Vue
#      details: Lorem ipsum...
#    - icon:
#       src: /ts.svg
#       width: 50px
#       height: 50px
#      title: TypeScript
#      details: Lorem ipsum...
---

<div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; margin-top:80px">
  <Card to="/react/nextjs/index">
    <template #icon>
      <img src="https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/next.png" alt="Nextjs" />
    </template>
    <template #title>Nextjs</template>
  </Card>
  <Card to="/typescript/">
    <template #icon>
      <img src="https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/typescript-blue.png" alt="TypeScript" />
    </template>
    <template #title>TypeScript</template>
  </Card>
   <Card to="/everyday/interview/index">
    <template #icon>
      <img src="https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/mianshilogo.png" alt="面试题" />
    </template>
    <template #title>面试题</template>
  </Card>
  <Card to="/react/React/base">
    <template #icon>
      <img src="https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/React-blue.png" alt="React" />
    </template>
    <template #title>React</template>
  </Card>
</div>
