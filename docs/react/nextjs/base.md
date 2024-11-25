基础

## React.js 和 Next.js 的关系

- **React.js** 是一个用于构建用户界面的 JavaScript 库，由 **Facebook** 开发。它主要关注于构建单页面应用（Single Page Application, SPA）的 **前端视图层**。React 提供了组件化开发的方式，通过 **Hooks、Context API** 等特性帮助开发者构建动态、响应式的 UI。
- **Next.js** 是基于 **React.js** 的一个框架，扩展了 React 的功能，专注于解决单页面应用（SPA）的一些问题，如 **SEO、性能优化、服务端渲染** 等。Next.js 提供了一整套构建现代 Web 应用的工具链，使得开发、构建和部署变得更加简便。

### React.js 和 Next.js 的对比

| 特性               | **React.js**                        | **Next.js**                                       |
| ------------------ | ----------------------------------- | ------------------------------------------------- |
| **架构类型**       | 前端库（Frontend Library）          | 全栈框架（Full Stack Framework）                  |
| **路由系统**       | 需要使用第三方库（如 React Router） | 基于文件系统的内置路由                            |
| **数据获取**       | 客户端数据获取（Client-side）       | 支持 SSR、SSG、ISR 以及 CSR                       |
| **SEO 支持**       | 需要手动配置                        | 内置 SEO 优化（如 SSR 和静态生成）                |
| **API 路由**       | 需要独立的后端服务                  | 内置 API 路由（可创建后端接口）                   |
| **图片和字体优化** | 需要手动处理                        | 内置图片优化（Next Image）和字体优化（Next Font） |
| **CSS 样式**       | 需要配置 CSS 方案                   | 内置支持 CSS、CSS Modules、Sass 等                |
| **构建与部署**     | 需要配置 Webpack 等工具             | 内置构建工具（支持 Vercel 和其他平台的无缝部署）  |
| **服务器组件支持** | 仅支持客户端组件                    | 支持服务器组件（React Server Components）         |

### 适合场景

- **React.js** 更适合用于构建 **单页面应用（SPA）**，专注于前端界面的开发。它适合前端开发者希望构建完全自定义的应用时使用。
- **Next.js** 更适合构建 **全栈应用（Full Stack Application）** 和 **高性能网站**，尤其是需要 **SEO 优化** 和 **服务端渲染** 的项目。它对开发者更友好，提供了开箱即用的解决方案，是开发企业级应用、博客、电子商务网站的理想选择。

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

Next.js 有两套路由解决方案，之前的方案称之为“Pages Router”，目前的方案称之为“App Router”，两套方案目前是兼容的，都可以在 Next.js 中使用。

**Next.js 的路由是基于文件系统的路由机制，url 的路径由文件夹和文件定义**

### Pages Router

`pages Router`声明一个路由，只需要在 pages 下创建一个文件即可。

```
└── pages
    ├── index.tsx
    ├── about.tsx
    └── list.tsx
```

**缺点：**

1. ##### 灵活性不足

   - Pages Router 强调文件系统作为路由的唯一来源，因此无法动态定义路由。例如，你无法在运行时根据需求动态创建新路由。
   - 对于复杂的路由需求（如多级嵌套路由），实现起来可能会变得冗长或不够直观。

2. ##### 文件结构耦合

   - 路由结构严格依赖于项目文件夹结构，文件组织的自由度较低。如果文件结构需要调整，可能会破坏路由配置。

3. ##### 嵌套布局支持有限

   - 与新的 **App Router**（从 Next.js 13 开始引入的基于 React Server Components 的路由系统）相比，Pages Router 对嵌套布局的支持较弱，无法实现像 App Router 那样的组件级布局隔离。

4. ##### 加载性能的限制

   - Pages Router 通常加载整个页面组件，缺乏细粒度的加载控制，而 App Router 提供了更强的分片加载（RSC 支持）。

5. ##### 数据获取方式单一

   - 在 Pages Router 中，`getServerSideProps`、`getStaticProps` 和 `getInitialProps` 是数据获取的主要方式，但它们的适用场景各有局限。
   - 对比 App Router，后者结合 React 的 `useEffect`、`use` 等提供了更多灵活的数据获取方式。

6. ##### 不支持现代功能

   - Pages Router 不支持 React Server Components，这使得它在性能优化方面逊色于 App Router。
   - 现代化的功能（如 Layouts、Streaming 等）需要切换到 App Router 才能完全实现。

7. ##### 状态管理复杂

   - 如果需要在页面之间共享复杂的状态或逻辑，可能需要引入额外的全局状态管理工具（如 Redux、Zustand 等），因为 Pages Router 天生缺乏对跨页面状态管理的直接支持。

在 `pages` 目录下创建一个 `about.js` 文件，它会直接映射到 `/about` 路由地址：

```tsx
// pages/about.js
import React from "react";
export default () => <h1>About us</h1>;
```

### App Router

目录结构

```
src/
└── app
    ├── page.js
    ├── layout.js
    ├── template.js
    ├── loading.js
    ├── error.js
    └── not-found.js
    ├── about
    │   └── page.js
    └── more
        └── page.js
```

- 所有路由必须放在 app 文件夹内。
- 每个对应路由的文件必须命名为 page.js 或 page.tsx。
- 每个文件夹对应浏览器 URL 中的一个路径段。

  **App Router 的优先级要高于 Pages Router。如果两者解析为同一个 URL，会导致构建错误。**

### 1. 搭建一个简单的路由`/home`

1. 删除`app`文件夹下所有文件
2. 在`app`文件夹下新建`home`文件夹，并新建文件`page.tsx`

```tsx
export default function Home() {
  return <div>Home</div>;
}
```

3. 运行程序，浏览器打开`http://localhost:3000/home`

### 2. 嵌套路由

```
app/
│
├── blog/
│ ├── frist/
│ │ └── page.tsx 对应url:/blog/frist
│ └── page.tsx 对应url:/blog
```

#### 2.1 路由通配符

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

### 3. 动态路由

1.  `可以将文件夹名称括在方括号中来创建动态路由[id]，id作为prop传递给layout、page、route和generateMetadata`

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

2.  \[...folderName]

   在命名文件夹的时候，如果你在方括号内添加省略号，比如 `[...folderName]`，这表示捕获所有后面所有的路由片段。

   也就是说，`app/shop/[...slug]/page.js`会匹配 `/shop/clothes`，也会匹配 `/shop/clothes/tops`、`/shop/clothes/tops/t-shirts`等等。

   ```tsx
   // app/shop/[...slug]/page.js
   export default function Page({ params }) {
     return <div>My Shop: {JSON.stringify(params)}</div>
   }
   ```

   当你访问 `/shop/a`的时候，`params` 的值为 `{ slug: ['a'] }`。

   当你访问 `/shop/a/b`的时候，`params` 的值为 `{ slug: ['a', 'b'] }`。

   当你访问 `/shop/a/b/c`的时候，`params` 的值为 `{ slug: ['a', 'b', 'c'] }`。

3. \[\[...folderName]

   **在命名文件夹的时候，如果你在双方括号内添加省略号，比如 `[[...folderName]]`，这表示可选的捕获所有后面所有的路由片段。**

   也就是说，`app/shop/[[...slug]]/page.js`会匹配 `/shop`，也会匹配 `/shop/clothes`、 `/shop/clothes/tops`、`/shop/clothes/tops/t-shirts`等等。

   它与上一种的区别就在于，不带参数的路由也会被匹配（就比如 `/shop`）

### 5. 私有文件夹

`_folder下划线开头的文件夹属于私有文件夹，一般存放工具函数`

**如果一般的路由文件夹需要\_开头，可以使用`%5F`进行转码**

### 6. 路由组

**使用`(folderName)`的方式创建路由组,就是将业务逻辑相关的路由放在一个文件夹下，但是 url 中不体现该文件夹。例如：注册、登录、忘记密码**

1. 按逻辑分组

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

2. 创建不同布局

   **借助路由组，即便在同一层级，也可以创建不同的布局：**

   ![image-20241124223635145](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241124223635145.png)

   在这个例子中，`/account` 、`/cart`、`/checkout` 都在同一层级。但是 `/account`和 `/cart`使用的是 `/app/(shop)/layout.js`布局和`app/layout.js`布局，`/checkout`使用的是 `app/layout.js`

3. 创建多个根布局

   ![image-20241124223733217](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241124223733217.png)

   创建多个根布局，你需要删除掉 `app/layout.js` 文件，然后在每组都创建一个 `layout.js`文件。创建的时候要注意，因为是根布局，所以要有 `<html>` 和 `<body>` 标签。

   这个功能很实用，比如你将前台购买页面和后台管理页面都放在一个项目里，一个 C 端，一个 B 端，两个项目的布局肯定不一样，借助路由组，就可以轻松实现区分。

   注意：

   1.  路由组的命名除了用于组织之外并无特殊意义。它们不会影响 URL 路径。
   2.  注意不要解析为相同的 URL 路径。举个例子，因为路由组不影响 URL 路径，所以  `(marketing)/about/page.js`和 `(shop)/about/page.js`都会解析为 `/about`，这会导致报错。
   3.  创建多个根布局的时候，因为删除了顶层的 `app/layout.js`文件，访问 `/`会报错，所以`app/page.js`需要定义在其中一个路由组中。
   4.  跨根布局导航会导致页面完全重新加载，就比如使用 `app/(shop)/layout.js`根布局的 `/cart` 跳转到使用 `app/(marketing)/layout.js`根布局的 `/blog` 会导致页面重新加载（full page load）。
   5.  当定义多个根布局的时候，使用 `app/not-found.js`会出现问题。具体参考 [《Next.js v14 如何为多个根布局自定义不同的 404 页面？竟然还有些麻烦！欢迎探讨》](https://juejin.cn/post/7351321244125265930)

### 7. 平行路由

 平行路由允许同时或有条件地在同一个布局中呈现一个或多个页面。它们对于应用程序中高度动态的部分非常有用，例如仪表盘和社交网站上的提要。

#### 7.1 插槽

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

注：`children` prop 其实就是一个隐式的插槽，`/app/page.js`相当于 `app/@children/page.js`。

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

可以看出文件结构是`complex-dashboard/@notifications/archived/page.tsx`，但是 URL 为`/complex-dashboard/archived`

不能在同一路由下有单独的静态和动态插槽，如果一个插槽是动态的，其他插槽是静态的，那么当用户刷新页面时如果插槽下没有 default.js 文件就会返回 404 页面。还看上边的案例就行：

```
//没有default.js文件
complex-dashboard
├─ layout.tsx
├─ page.tsx
├─ @users
│  └─ page.tsx
├─ @revenue
│  └─ page.tsx
└─ @notifications
   ├─ page.tsx
   └─ archived
      └─ page.tsx
```

![chrome_jPTahR5XSI](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/chrome_jPTahR5XSI.gif)



```
//有default.js文件
complex-dashboard
├─ default.tsx
├─ layout.tsx
├─ page.tsx
├─ @users
│  ├─ default.tsx
│  └─ page.tsx
├─ @revenue
│  ├─ default.tsx
│  └─ page.tsx
└─ @notifications
   ├─ page.tsx
   └─ archived
      └─ page.tsx
```

![chrome_JLrcr8Y89H](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/chrome_JLrcr8Y89H.gif)

default.js 文件的作用就是在初始加载或整页重新加载期间呈现为不匹配插槽的回退。

#### 7.2 并行路由相对于传统组件的优点

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

### 8. 拦截路由

 在 Next.js 中，拦截路由（Intercepting Routes）是一个用于处理复杂路由逻辑的特性，可以帮助开发者根据特定条件或状态动态地修改路由行为。这种机制使得在渲染某些页面或组件之前，开发者能够进行预处理，从而控制用户的导航体验。拦截路由允许你在当前路由拦截其他路由地址并在当前路由中展示内容。

#### 8.1 定义拦截路由

使用`(.)folder`约定定义拦截路由

```
app
├─ f1
│  ├─ page.tsx
│  ├─ f2
│  │  └─ page.tsx
└─ ─ (.)f2
     └─ page.tsx
```

```tsx
//f1
import Link from "next/link";

const F1 = () => {
  return (
    <div className="">
      F1{" "}
      <div>
        <Link href="/f1/f2">导航到F2</Link>
      </div>
    </div>
  );
};

export default F1;
```

```tsx
//f2
const F2 = () => {
  return <div className="">F2</div>;
};

export default F2;
```

```tsx
//(.)f2
const InterceptedF2 = () => {
  return <div className="">(.)InterceptedF2</div>;
};

export default InterceptedF2;
```

| (.)      | 匹配**同一级别的**路由片段        |
| -------- | --------------------------------- |
| (..)     | 匹配**上一级**的路由片段          |
| (..)(..) | 匹配**上两级**的路由片段          |
| (...)    | 匹配**根** `app` 目录中的路由片段 |

#### 8.2 效果展示

![image-20241125100953466](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241125100953466.png)

点击任意一张图片

![image-20241125101048027](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241125101048027.png)

此时页面弹出了一层 Modal，Modal 中展示了该图片的具体内容。如果你想要查看其他图片，点击右上角的关闭按钮，关掉 Modal 即可继续浏览。值得注意的是，此时路由地址也发生了变化，它变成了这张图片的具体地址。如果你喜欢这张图片，直接复制当前的地址分享给朋友即可。

而当你的朋友打开时，其实不需要再以 Modal 的形式展现，直接展示这张图片的具体内容即可。现在刷新下该页面，你会发现页面的样式不同了：

![image-20241125101351346](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241125101351346.png)

在这个样式里没有 Modal，就是展示这张图片的内容。

同样一个路由地址，却展示了不同的内容。这就是拦截路由的效果。如果你在 `dribbble.com` 想要访问 `dribbble.com/shots/xxxxx`，此时会拦截 `dribbble.com/shots/xxxxx` 这个路由地址，以 Modal 的形式展现。而当直接访问 `dribbble.com/shots/xxxxx` 时，则是原本的样式。

简单的来说，就是希望用户继续停留在重要的页面上。比如上述例子中的图片流页面，开发者肯定是希望用户能够持续在图片流页面浏览，如果点击一张图片就跳转出去，会打断用户的浏览体验，如果点击只展示一个 Modal，分享操作又会变得麻烦一点。拦截路由正好可以实现这样一种平衡。又比如任务列表页面，点击其中一项任务，弹出 Modal 让你能够编辑此任务，同时又可以方便的分享任务内容。

## Layouts

`layout是多个页面共享的布局，导航时布局会保留状态、保持交互性，并且不会重新渲染,布局也可以嵌套。`

- 根布局 `layout(app/layout.js)`适用于所有路由。此布局是必须的，并且必须包含`html`和`body`标签。该文件默认导出一个 React 组件，该组件应接收一个 `children` prop，`chidren` 表示子布局（如果有的话）或者子页面。 **删除后本地编译后也会自动生成**
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
  - 使用路由组来选择将特定路线段加入或退出共享布局。
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
- 布局默认是服务器组件，不可以设置为客户端组件。
- 布局可以获取数据。但是无法在父布局及其子布局之间传递数据。
- 布局无法访问`pathname`,但导入的客户端组件可以使用钩子访问路径名`usePathname`。
- 布局无法访问其自身下方的路由段。要访问所有路由段，可以在客户端组件中使用`useSelectedLayoutSegment`或`useSelectedLayoutSegments`

## Templates

模板与布局类似，它们包装了子布局或页面。与跨路由持久化并保持状态的布局不同，模板在导航时会为每个子项创建一个新实例。这意味着，当用户在共享模板的路由之间导航时，会安装子项的新实例，重新创建 DOM 元素，客户端组件中不会保留状态，并且会重新同步效果。

在 `app`目录下新建一个 `template.js`文件：

```tsx
// app/template.tsx
export default function Template({ children }) {
  return <div>{children}</div>;
}
```

如果同一目录下既有 `template.tsx 也有 `layout.tsx`，最后的输出效果如下：

```tsx
<Layout>
  {/* 模板需要给一个唯一的 key */}
  <Template key={routeParam}>{children}</Template>
</Layout>
```

**模版适用场景**

- 依赖于 useEffect 和 useState 的功能，比如记录页面访问数、用户反馈表单（每次重新填写）等
- 更改框架的默认行为，举个例子，`Layout`内的 `Suspense` 只会在布局加载的时候展示一次 `fallback UI`，当切换页面的时候不会展示。但是使用`模板`，fallback 会在每次路由切换的时候展示。

## Loading.tsx

这个功能的实现借助了 React 的 [Suspense](./note.html#react-中的-suspenseapi-实现原理) API。它实现的效果就是当发生路由变化的时候，立刻展示 fallback UI，等加载完成后，展示数据。

```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return <>Loading dashboard...</>;
}
```

```tsx
// app/dashboard/page.tsx
async function getData() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return {
    message: "Hello, Dashboard!",
  };
}
export default async function DashboardPage(props) {
  const { message } = await getData();
  return <h1>{message}</h1>;
}
```

**其关键在于 `page.tsx`导出了一个 async 函数** `loading.tsx` 的实现原理是将 `page.tsx`和下面的 children 用 `<Suspense>` 包裹。因为`page.tsx`导出一个 async 函数，Suspense 得以捕获数据加载的 promise，借此实现了 loading 组件的关闭。

![image-20241122160247544](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241122160247544.png)

**实现`loading`效果还可以借助 React 的[use](./note.html#react-中的-use-函数)函数**

```tsx
// /dashboard/about/page.tsx
import { use } from "react";

async function getData() {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return {
    message: "Hello, About!",
  };
}

export default function Page() {
  const { message } = use(getData());
  return <h1>{message}</h1>;
}
```

如果同一文件夹既有 `layout.js` 又有 `template.js` 又有 `loading.js` ，那它们的层级关系是怎样呢？

![image-20241122161435185](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241122161435185.png)

## error.tsx

它借助了React中的[Error Boundary(错误边界)](./note.html#react-的-error-boundary功能)，就是给 page.js 和 children 包了一层 `ErrorBoundary`。

![image-20241122165742141](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241122165742141.png)

错误可以分为两类：

- 预期错误
  预期错误是指应用程序正常运行期间可能发生的错误，例如来自服务器端表单验证或失败的请求的错误。这些错误应明确处理并返回给客户端。
- 意外错误
  未捕获异常是意外错误，表示应用程序正常流程中不应发生的错误或问题。这些应该通过抛出错误来处理，然后由错误边界捕获。

```tsx
"use client";
//必须是客户端组件
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

因为 `Layout` 和 `Template` 在 `ErrorBoundary` 外面，这说明错误边界不能捕获同级的 `layout.js` 或者 `template.js` 中的错误。如果你想捕获特定布局或者模板中的错误，那就需要在父级的 `error.js` 里进行捕获。

如果已经到了顶层，就比如根布局中的错误如何捕获呢？为了解决这个问题，Next.js 提供了 `global-error.js`文件，使用它时，需要将其放在 `app` 目录下。

`global-error.js`会包裹整个应用，而且当它触发的时候，它会替换掉根布局的内容。所以，`global-error.js` 中也要定义 `<html>` 和 `<body>` 标签。

```ts
'use client'
// app/global-error.ts
export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

注：`global-error.js` 用来处理根布局和根模板中的错误，`app/error.js` 建议还是要写的

##  not-found.js

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

关于 `app/not-found.js`它只能由两种情况触发：

1.  当组件抛出了 notFound 函数的时候
1.  当路由地址不匹配的时候

执行 notFound 函数时，会由最近的 not-found.js 来处理。但如果直接访问不存在的路由，则都是由 `app/not-found.js` 来处理。

对应到实际开发，当我们请求一个用户的数据时或是请求一篇文章的数据时，如果该数据不存在，就可以直接丢出 `notFound` 函数，渲染自定义的 `not-found.js` 界面。示例代码如下：

```tsx
// app/dashboard/blog/[id]/page.tsx
import { notFound } from 'next/navigation'
 
async function fetchUser(id) {
  const res = await fetch('https://...')
  if (!res.ok) return undefined
  return res.json()
}
 
export default async function Profile({ params }) {
  const user = await fetchUser(params.id)
 
  if (!user) {
    notFound()
  }
 
  // ...
}
```

注意：当 `app/not-found.js` 和路由组一起使用的时候，可能会出现问题。

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

2. title

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

1. 使用`<Link>`组件。

2. 使用`useRouter`钩子(客户端组件)

3. 使用`redirect`函数（服务端组件）

4. 使用原生`History API`

### `<Link>`组件

Next.js 的`<Link>`组件是一个拓展了原生 HTML `<a>` 标签的内置组件，用来实现预获取（prefetching） 和客户端路由导航。这是 Next.js 中路由导航的推荐方式。

#### 基本使用

```tsx
import Link from 'next/link'
 
export default function Page() {
  return <Link href="/dashboard">Dashboard</Link>
}
```

#### 动态渲染

```tsx
import Link from 'next/link'
 
export default function PostList({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  )
}
```

#### 获取当前路径名` usePathname()`

```tsx
'use client'
 
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function Navigation({ navLinks }) {
  const pathname = usePathname()
 
  return (
    <>
      {navLinks.map((link) => {
        const isActive = pathname === link.href
 
        return (
          <Link
            className={isActive ? 'text-blue' : 'text-black'}
            href={link.href}
            key={link.name}
          >
            {link.name}
          </Link>
        )
      })}
    </>
  )
}
```

#### 跳转行为设置

App Router 的默认行为是滚动到新路由的顶部，或者在前进后退导航时维持之前的滚动距离。

如果你想要禁用这个行为，你可以给 `<Link>` 组件传递一个 `scroll={false}`属性，或者在使用 `router.push`和 `router.replace`的时候，设置 `scroll: false`：

```tsx
// next/link
<Link href="/dashboard" scroll={false}>
  Dashboard
</Link>
```

```tsx
// useRouter
import { useRouter } from 'next/navigation'
 
const router = useRouter()
 
router.push('/dashboard', { scroll: false })
```

### useRouter()

只能在客户端组件中使用

```tsx
'use client'
 
import { useRouter } from 'next/navigation'
 
export default function Page() {
  const router = useRouter()
 
  return (
    <button type="button" onClick={() => router.push('/dashboard')}>
      Dashboard
    </button>
  )
}
```

### redirect函数

服务端组件可以直接使用 redirect 函数

```tsx
import { redirect } from 'next/navigation'
 
async function fetchTeam(id) {
  const res = await fetch('https://...')
  if (!res.ok) return undefined
  return res.json()
}
 
export default async function Profile({ params }) {
  const team = await fetchTeam(params.id)
  if (!team) {
    redirect('/login')
  }
 
  // ...
}
```

### History API

通常与 usePathname（获取路径名的 hook） 和 useSearchParams（获取页面参数的 hook） 一起使用。

比如用 pushState 对列表进行排序：

```tsx
'use client'
 
import { useSearchParams } from 'next/navigation'
 
export default function SortProducts() {
  const searchParams = useSearchParams()
 
  function updateSorting(sortOrder) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sortOrder)
    window.history.pushState(null, '', `?${params.toString()}`)
  }
 
  return (
    <>
      <button onClick={() => updateSorting('asc')}>Sort Ascending</button>
      <button onClick={() => updateSorting('desc')}>Sort Descending</button>
    </>
  )
}
```



