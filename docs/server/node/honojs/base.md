---
outline: deep
---

## 中间件的使用方法

### 1. 全局中间件

全局中间件会应用于应用程序中的所有路由请求。要添加全局中间件，可以使用 Hono 实例的 `use` 方法。全局中间件按照添加的顺序执行。

```tsx
import { Hono } from "hono";

const app = new Hono();

// 日志中间件
app.use("*", async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
});
// 全局错误处理中间件
app.onError((err, c) => {
  logger.error("Error caught by onError:", err);
  // 错误处理逻辑
});

// 全局响应拦截中间件
app.use("*", responseInterceptor);

// CORS中间件
app.use("*", async (c, next) => {
  await next();
  c.header("Access-Control-Allow-Origin", "*");
});

app.get("/", (c) => c.text("Hello Hono!"));
```

### 2. 路由级别中间件

1. 为特定路由组添加中间件

   ```tsx
   const user = new Hono();

   // 为所有用户路由添加认证中间件，但排除特定路由
   user.use("*", async (c, next) => {
     // 如果是 login 路由，直接跳过认证
     if (c.req.path.endsWith("/login") && c.req.method === "POST") {
       return next();
     }
     // 其他路由都需要认证
     return authMiddleware(c, next);
   });
   ```

2. 为单个路由添加中间件

   ```tsx
   // 单个路由使用认证中间件
   links.get(
     "/",
     authMiddleware,
     zValidator("query", getLinksSchema),
     async (c) => {
       // 路由处理逻辑
     }
   );

   // 使用可选认证中间件
   links.get(
     "/:id",
     optionalAuth(),
     zValidator("param", getLinkSchema),
     async (c) => {
       // 路由处理逻辑
     }
   );

   // 多个中间件组合使用
   links.put(
     "/:id",
     authMiddleware,
     zValidator("param", getLinkSchema),
     zValidator("json", updateLinkSchema),
     async (c) => {
       // 路由处理逻辑
     }
   );
   ```
