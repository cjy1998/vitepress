## 路由处理程序

前后端分离架构中，客户端与服务端之间通过 API 接口来交互。这个“API 接口”在 Next.js 中有个更为正式的称呼，就是路由处理程序。

### 1.定义路由处理程序

![image-20241125112424904](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241125112424904.png)

该文件必须在`app`目录下，可以在`app`嵌套的文件夹下，但是`page.tsx`和`route.ts`不能在同一层级。

#### 1.1 GET请求

```tsx
//app/api/posts/route.ts
import { NextResponse } from "next/server"

export async function GET() {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts')
    const data = await res.json()

    return NextResponse.json({ data })
}
```

浏览器访问 `http://localhost:3000/api/posts`	

![image-20241125113954957](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241125113954957.png)

#### 1.2 支持方法

Next.js 支持 `GET`、`POST`、`PUT`、`PATCH`、`DELETE`、`HEAD` 和 `OPTIONS` 这些 HTTP 请求方法。如果传入了不支持的请求方法，Next.js 会返回 `405 Method Not Allowed`。

```tsx
// route.js
export async function GET(request) {}
 
export async function HEAD(request) {}
 
export async function POST(request) {}
 
export async function PUT(request) {}
 
export async function DELETE(request) {}
 
export async function PATCH(request) {}
 
// 如果 `OPTIONS` 没有定义, Next.js 会自动实现 `OPTIONS`
export async function OPTIONS(request) {}
```

#### 1.3 POST方法

```tsx
export async function POST(request) {
  const article = await request.json()
  
  return NextResponse.json({
    id: Math.random().toString(36).slice(-8),
    data: article
  }, { status: 201 })
}
```

#### 1.4 传入参数

每个请求方法的处理函数会被传入两个参数，一个 `request`，一个 `context` 。两个参数都是可选的：

```ts
export async function GET(request, context) {}
```

**request**

request对象是一个`NextRequest`对象，它是基于`Web Request API`的扩展。使用 request ，可以快捷读取 cookies 和处理 URL。

获取URL参数：

```ts
export async function GET(request, context) {
  //  访问 /home, pathname 的值为 /home
	const pathname = request.nextUrl.pathname
	// 访问 /home?name=lee, searchParams 的值为 { 'name': 'lee' }
	const searchParams = request.nextUrl.searchParams
}
```

nextUrl 是基于 Web URL API 的扩展（如果你想获取其他值，参考 [URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)）

**context**

目前`context`只有一个值`params`，包含当前动态路由参数的对象。

```ts
export async function GET(request, { params }) {
  const team = params.team
}
```

当访问 `/dashboard/1` 时，params 的值为 `{ team: '1' }`。其他情况还有：

| Example                          | URL            | params                    |
| -------------------------------- | -------------- | ------------------------- |
| `app/dashboard/[team]/route.js`  | `/dashboard/1` | `{ team: '1' }`           |
| `app/shop/[tag]/[item]/route.js` | `/shop/1/2`    | `{ tag: '1', item: '2' }` |
| `app/blog/[...slug]/route.js`    | `/blog/1/2`    | `{ slug: ['1', '2'] }`    |

注意第二行：此时 params 返回了当前链接所有的动态路由参数。

#### 1.5 缓存

默认缓存：默认情况下，使用Response（NextResponse）对象的GET请求会被缓存。

举例：

```ts
//app/api/time/route.ts
export async function GET() {
  console.log('GET /api/time')
  return Response.json({ data: new Date().toLocaleTimeString() })
}
```

开发模式下，并不会被缓存，每次刷新会改变

![chrome_wQlSSToRDp](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/chrome_wQlSSToRDp.gif)

部署生产版本并运行，`npm run build && npm run start`

![chrome_Bv0vJRtNt7](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/chrome_Bv0vJRtNt7.gif)

实现方式：

![image-20241125141458619](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241125141458619.png)

根据输出的结果，你会发现 `/api/time` 是静态的，也就是被预渲染为静态的内容，换言之，`/api/time` 的返回结果其实在构建的时候就已经确定了，而不是在第一次请求的时候才确定。

**退出缓存**

- `GET`请求使用`Request`对象

- 添加其他`HTTP`方法

  ```ts
  export async function GET() {
    console.log('GET /api/time')
    return Response.json({ data: new Date().toLocaleTimeString() })
  }
  
  export async function POST() {
    console.log('POST /api/time')
    return Response.json({ data: new Date().toLocaleTimeString() })
  }
  ```

​	此时会转为动态渲染。这是因为 POST 请求往往用于改变数据，GET 请求用于获取数据。如果写了 POST 请求，表示数据会发生变化，此时不适合缓存。

- 使用像`cookies`、`headers`这样的动态函数

  ```ts
  export async function GET(request) {
    const token = request.cookies.get('token')
    return Response.json({ data: new Date().toLocaleTimeString() })
  }
  ```

  此时会转为动态渲染。这是因为 cookies、headers 这些数据只有当请求的时候才知道具体的值。

- 路由段配置项手动声明为动态模式

  ```ts
  export const dynamic = 'force-dynamic'
  
  export async function GET() {
    return Response.json({ data: new Date().toLocaleTimeString() })
  }
  ```

重新验证：除了退出缓存，可以设置缓存的时效，适用于一些重要性低、时效性低的页面。

- 路由段配置项

  ```ts
  export const dynamic = 'force-dynamic'
  
  export async function GET() {
    return Response.json({ data: new Date().toLocaleTimeString() })
  }
  ```

  假设你现在访问了 `/api/time`，此时时间设为 0s，10s 内持续访问，`/api/time`返回的都是之前缓存的结果。当 10s 过后，假设你第 12s 又访问了一次 `/api/time`，此时虽然超过了 10s，但依然会返回之前缓存的结果，但同时会触发服务器更新缓存，当你第 13s 再次访问的时候，就是更新后的结果。

- `next.revalidate`

  ```ts
  export async function GET() {
    const res = await fetch('https://api.thecatapi.com/v1/images/search', {
      next: { revalidate: 5 }, //  每 5 秒重新验证
    })
    const data = await res.json()
    console.log(data)
    return Response.json(data)
  }
  ```

### 2. 常见问题

#### 2.1 获取参数

```ts
// app/api/search/route.ts
// 访问 /api/search?query=hello
export function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query') // query
}
```

#### 2.2 处理Cookie

- ```ts
  export async function GET(request) {
    const token = request.cookies.get('token')
    request.cookies.set(`token2`, 123)
  }
  ```

- 通过`next/headers`包提供的 `cookies`方法

  ```ts
  import { cookies } from 'next/headers'
   
  export async function GET(request) {
    const cookieStore = cookies()
    const token = cookieStore.get('token')
   
    return new Response('Hello, Next.js!', {
      status: 200,
      headers: { 'Set-Cookie': `token=${token}` },
    })
  }
  ```

#### 2.3 处理Headers

- ```ts
  export async function GET(request) {
    const headersList = new Headers(request.headers)
    const referer = headersList.get('referer')
  }
  ```

- `next/headers`包提供的 `headers` 方法

  ```ts
  import { headers } from 'next/headers'
   
  export async function GET(request) {
    const headersList = headers()
    const referer = headersList.get('referer')
   
    return new Response('Hello, Next.js!', {
      status: 200,
      headers: { referer: referer },
    })
  }
  ```

#### 2.4 重定向

重定向使用 `next/navigation` 提供的 `redirect` 方法

```ts
import { redirect } from 'next/navigation'
 
export async function GET(request) {
  redirect('https://nextjs.org/')
}
```

#### 2.5 获取请求体内容

- json

  ```ts
  import { NextResponse } from 'next/server'
   
  export async function POST(request) {
    const res = await request.json()
    return NextResponse.json({ res })
  }
  ```

- FormData

  ```ts
  import { NextResponse } from 'next/server'
   
  export async function POST(request) {
    const formData = await request.formData()
    const name = formData.get('name')
    const email = formData.get('email')
    return NextResponse.json({ name, email })
  }
  ```

#### 2.6 设置`CORS`

```ts
export async function GET(request) {
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

#### 2.7 如何响应无`UI`内容

```ts
export async function GET() {
  return new Response(`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
 
<channel>
  <title>Next.js Documentation</title>
  <link>https://nextjs.org/docs</link>
  <description>The React Framework for the Web</description>
</channel>
 
</rss>`)
}
```

注：`sitemap.xml`、`robots.txt`、`app icons` 和 `open graph images` 这些特殊的文件，Next.js 都已经提供了内置支持

#### 2.8 `Streaming`

openai 的打字效果背后用的就是流：

```ts
import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
 
export const runtime = 'edge'
 
export async function POST(req) {
  const { messages } = await req.json()
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
  })
 
  const stream = OpenAIStream(response)
 
  return new StreamingTextResponse(stream)
}
```

也可以直接使用底层的 Web API 实现 Streaming：

```ts
function iteratorToStream(iterator) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next()
 
      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    },
  })
}
 
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
 
const encoder = new TextEncoder()
 
async function* makeIterator() {
  yield encoder.encode('<p>One</p>')
  await sleep(200)
  yield encoder.encode('<p>Two</p>')
  await sleep(200)
  yield encoder.encode('<p>Three</p>')
}
 
export async function GET() {
  const iterator = makeIterator()
  const stream = iteratorToStream(iterator)
 
  return new Response(stream)
}
```

