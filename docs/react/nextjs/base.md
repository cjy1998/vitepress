# 基础

## 创建项目

```bash
    npx create-next-app@latest
```

## React Server Components(RSC)

### 服务端组件

`在Next.js中，所有的组件默认为服务端组件`

**特点**

- 可以读取文件、连接数据库读取数据
- 不可以使用`hooks`,不能处理用户交互

### 客户端组件

- 可以使用 Hooks 和用户交互组件

## 路由

`Next.js的路由是基于文件系统的路由机制，url的路径由文件夹和文件定义`

- 所有路由必须放在 app 文件夹内。
- 每个对应路由的文件必须命名为 page.js 或 page.tsx。
- 每个文件夹对应浏览器 URL 中的一个路径段。

### 搭建一个简单的路由`/home`

1. 删除`app`文件夹下所有文件
2. 在`app`文件夹下新建`home`文件夹，并新建文件`page.tsx`

```tsx
export default function Home() {
  return <div>Home</div>;
}
```

3. 运行程序，浏览器打开`http://localhost:3000/home`

### 嵌套路由

```
app/
│
├── blog/
│ ├── frist/
│ │ └── page.tsx 对应url:/blog/frist
│ └── page.tsx 对应url:/blog
```

### 动态路由

`可以将文件夹名称括在方括号中来创建动态路由[id]，id作为prop传递给layout、page、route和generateMetadata`

```
app/
│
├── products/
│ ├── [productId]/
│ │ └── page.tsx 对应url:/products/1
│ └── page.tsx 对应url:/products
```

```tsx
export default function ProductDetail({
  params,
}: {
  params: { productId: string };
}) {
  return (
    <>
      <div>
        <h1>ProductDetail{params.productId}</h1>
      </div>
    </>
  );
}
```

#### 路由通配符

`Next.js 还支持路由通配符来匹配更复杂的 URL 结构。通配符用三个点...表示。`

- **嵌套路由：**可以使用通配符创建嵌套路由。例如，pages/blog/[[...slug]].js 可以匹配/blog、/blog/2024、/blog/2024/09、/blog/2024/09/13 等多层级的 URL。

```tsx
export default function Docs({ params }: { params: { slug: string[] } }) {
  const { slug } = params;
  if (slug.length === 2) {
    return (
      <h1>
        Viewing docs for feature {slug[0]} and concept {slug[1]}
      </h1>
    );
  } else if (slug.length === 1) {
    return <h1>Viewing docs for feature {slug[0]}</h1>;
  }
  return <h1>Docs home page</h1>;
}
```

### not-found.js

“未找到” 文件用于在路由段内抛出 “notFound” 函数时呈现用户界面。除了提供自定义用户界面外，Next.js 对于流式响应将返回 “200” 的 HTTP 状态码，对于非流式响应将返回 “404”。

```tsx
import Image from "next/image";
export default function NotFound() {
  return (
    <div className="w-full min-h-dvh flex justify-center items-center">
      <Image src="/404.svg" fill={true} alt="404" />
    </div>
  );
}
```

```tsx
import { notFound } from "next/navigation";
export default function ReviewDetil({
  params,
}: {
  params: { productId: string; reviewId: string };
}) {
  if (parseInt(params.reviewId) > 1000) {
    notFound();
  }
  return (
    <>
      <div>
        {params.productId} review detil {params.reviewId}
      </div>
    </>
  );
}
```

### 私有文件夹

`_folder下划线开头的文件夹属于私有文件夹，一般存放工具函数`

**如果一般的路由文件夹需要\_开头，可以使用`%5F`进行转码**

### 路由组

**使用`(folderName)`的方式创建路由组,就是将业务逻辑相关的路由放在一个文件夹下，但是 url 中不体现该文件夹。例如：注册、登录、忘记密码**

```
app/
│
├── (auth)
│ ├── login
│ │ └── page.tsx 对应url:/login
│ |── forgot-password
| | └── page.tsx 对应url:/forgot-password
| |── register
| | └── page.tsx 对应url:/register
```

## Layouts

`layout是多个页面共享的布局，导航时，布局会保留状态、保持交互性，并且不会重新渲染。布局也可以嵌套。`

- 根布局 layout(app/layout.js),适用于所有路由。此布局是必须的，并且必须包含`html`和`body`标签。**删除后本地编译后也会自动生成**
- 普通布局
  例如，布局将与/dashboard 和/dashboard/settings 页面共享：

```
app
│
├── dashboard
│ ├── layout.jsx
│ |── page.tsx
| |── settings
| | └── page.tsx
```

```tsx
export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Include shared UI here e.g. a header or sidebar */}
      <nav></nav>

      {children}
    </section>
  );
}
```
