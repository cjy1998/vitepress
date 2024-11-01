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

### 平行路由

平行路由允许同时或有条件地在同一个布局中呈现一个或多个页面。它们对于应用程序中高度动态的部分非常有用，例如仪表盘和社交网站上的提要。

#### 插槽

平行路由使用命名插槽创建。插槽使用`@文件夹名称`约定定义。

```
app
 └─ complex-dashboard
    ├─ layout.tsx
    ├─ page.tsx
    ├─ @users
    │  └─ page.tsx
    ├─ @revenue
    │  └─ page.tsx
    └─ @notifications
       └─ page.tsx
```

插槽作为属性传递给共享的父布局，对于上面的示例，位于 app/layout.tsx 中的组件现在接受`@users`和`@revenue`、`@notifications`插槽属性，并且可以与`children`属性并行地渲染。

```tsx
export default function DashboardLayout({
  children,
  users,
  revenue,
  notifications,
}: {
  children: React.ReactNode;
  users: React.ReactNode;
  revenue: React.ReactNode;
  notifications: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <div style={{ display: "flex" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>{users}</div>
          <div>{revenue}</div>
        </div>
        <div style={{ display: "flex", flex: 1 }}>{notifications}</div>
      </div>
    </div>
  );
}
```

![image-20241101163521857](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241101163521857.png)

**插槽不是路由片段，并且不会影响 URL 结构。**例如：在`@notifications`文件夹下新建`archived\page.tsx`

```tsx
import Card from "@/components/card";
import Link from "next/link";
const ArchivedNotifications = () => {
  return (
    <Card>
      <div> Archived Notifications </div>
      <Link href="/complex-dashboard">Default</Link>
    </Card>
  );
};

export default ArchivedNotifications;
```

修改`@notifications\page.tsx`

```tsx
import Card from "@/components/card";
import Link from "next/link";

export default function Notifications() {
  return (
    <Card>
      <div>我是Notifications</div>
      <Link href="/complex-dashboard/archived">Archived</Link>
    </Card>
  );
}
```

![](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/chrome_0rVJggU3Dd.gif)

可以看出文件结构是`complex-dashboard/@notifications/archived/page.tsx`，但是URL为`/complex-dashboard/archived`

#### 并行路由相对于传统组件的优点

1. 增强用户体验

- 快速加载
  - Parallel Routes 允许不同的路由组件同时加载，而不是像传统的单一路由那样按顺序加载组件。这意味着用户可以更快地看到部分内容，而不是等待整个页面加载完成。
  - 例如，在一个电商应用中，当用户访问商品详情页时，商品信息和用户评论可以通过并行路由同时加载。这样，用户可以在商品信息加载完成后立即开始查看，而不必等待评论加载完毕。
- 独立交互
  - 不同的并行路由可以独立地进行交互，而不会影响其他部分的页面。这使得用户可以在一个区域进行操作，而不会干扰其他正在加载或已加载的内容。
  - 比如，在一个社交网络应用中，用户可以在浏览帖子的同时，通过并行路由加载的侧边栏进行搜索或切换不同的话题，而不会影响帖子的显示。

2. 更好的性能优化机会

- 选择性加载
  - 根据用户的行为和需求，可以选择性地加载并行路由。例如，如果用户在某个页面上从未访问过特定的并行路由，可以延迟加载该路由，以减少初始加载时间和资源消耗。
  - 比如，在一个在线教育平台中，只有当用户点击特定的课程章节时，才会加载该章节的详细内容并行路由，而不是在初始加载时就加载所有章节的内容。
- 缓存策略
  - 由于并行路由的独立性，可以为每个路由制定独立的缓存策略。对于不经常变化的内容，可以进行更长期的缓存，提高页面的加载速度。
  - 例如，在一个博客应用中，文章列表可以缓存较长时间，而文章详情页面可以根据文章的更新频率进行适当的缓存设置。

## Layouts

`layout是多个页面共享的布局，导航时，布局会保留状态、保持交互性，并且不会重新渲染。布局也可以嵌套。`

- 根布局 `layout(app/layout.js)`,适用于所有路由。此布局是必须的，并且必须包含`html`和`body`标签。**删除后本地编译后也会自动生成**
- 嵌套布局
  例如，布局将与`/dashboard` 和`/dashboard/settings` 页面共享：

```bash
 app
│
├── dashboard
│   ├── layout.jsx
│   ├── page.tsx
│   └── settings
│       └── page.tsx
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

- 路由组布局
  - 使用路线组来选择将特定路线段加入或退出共享布局。
  - 使用路由组创建多个根布局（每个根布局都必须包含 `html` 和 `body` 元素，并且删除掉 `app` 文件夹下的 `layout` 文件）。

```
app/
│
├── (auth)
│ ├── (with-auth-layout)
│ │ |── layout.tsx
│ │ |── login
│ │ | └── page.tsx
│ │ └── register
│ │   └── page.tsx
│ |── forgot-password
| | └── page.tsx 对应url:/forgot-password
// login和register页面包含在with-auth-layout布局中
```

**注意点**

- `.js`、`.jsx`、`.tsx` 文件拓展名均可用于布局。
- 只有根布局可以包含`<html>`和`<body`>`标签。
- 当 `layout.js` 和 `page.js` 文件在同一个文件夹，布局将会包裹页面。
- 布局默认是服务器组件，可以设置为客户端组件。
- 布局可以获取数据。但是无法在父布局及其子布局之间传递数据。
- 布局无法访问`pathname`,但导入的客户端组件可以使用钩子访问路径名`usePathname`。
- 布局无法访问其自身下方的路由段。要访问所有路由段，您可以在客户端组件中使用`useSelectedLayoutSegment`或`useSelectedLayoutSegments`

## 元数据

有两种方法可以向应用程序添加元数据

1. tsx 文件中导出静态`metadata对象`或动态`generateMetadata函数`(`layout.tsx` 和 `page.tsx`)。
   - 静态元数据
   ```ts
   export const generateMetadata = ({ params }: Props): Metadata => {
     return {
       title: `Product ${params.productId}`,
     };
   };
   ```
   - 动态元数据
     ```ts
     export const generateMetadata = async ({
       params,
     }: Props): Promise<Metadata> => {
       const title = await new Promise((resolve) => {
         setTimeout(() => {
           resolve(`iPhone ${params.productId}`);
         }, 1000);
       });
       return {
         title: `Product ${title}`,
       };
     };
     ```
     2.

### title

**可以是字符串也可以是对象**

```ts
import { Metadata } from "next";
export const metadata: Metadata = {
  title: {
    default: "Next.js Tutorial - Codevolution",
    absolute: "",
    template: "%s | Codevolution",
  },
};
```

- `absolute`,在子页面设置`title`的`absolute`后，子页面的标题将会忽略父页面中`title.template`。
- 子页面如果未定义`title`则采取父页面中`title.default`
- `title.template`可用于在子路由段`titles`中定义添加前缀或后缀。

## 链接和导航

- 使用`<Link>`组件。
- 使用`useRouter`钩子(客户端组件)
- 使用`redirect`函数（服务端组件）
- 使用原生`History API`

## Templates

模板与布局类似，因为它们包装了子布局或页面。与跨路由持久化并保持状态的布局不同，模板在导航时会为每个子项创建一个新实例。这意味着，当用户在共享模板的路由之间导航时，会安装子项的新实例，重新创建 DOM 元素，客户端组件中不会保留状态，并且会重新同步效果。

**模版适用场景**

- 重新同步 useEffect 导航
- 在导航时重置子客户端组件的状态。

## Loading.tsx

## error.tsx

错误可以分为两类：

- 预期错误
  预期错误是指应用程序正常运行期间可能发生的错误，例如来自服务器端表单验证或失败的请求的错误。这些错误应明确处理并返回给客户端。
- 意外错误
  未捕获异常是意外错误，表示应用程序正常流程中不应发生的错误或问题。这些应该通过抛出错误来处理，然后由错误边界捕获。

```tsx
"use client";
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      {error.message}
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```
