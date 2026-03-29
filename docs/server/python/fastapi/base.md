# FastAPI 基础功能学习总结

## 1. 应用初始化与路由模块化

代码展示了如何创建 FastAPI 的主实例，以及如何将拆分的路由模块合并到主应用中。

- **创建应用实例**：`app = FastAPI()`
- **注册外部路由**：使用 `app.include_router(book_router)` 挂载了来自 `router.book` 的 `book_router`，实现了路由的模块化管理。

## 2. 数据模型定义 (Pydantic)

代码使用 Pydantic 的 `BaseModel` 和 `Field` 来定义和校验复杂的请求体结构。

- **定义模型**：创建了 `User` 类。
- **字段校验 (`Field`)**：
  - `user_id`：整数类型，使用 `...` 标记为必填项，并添加了描述信息。
  - `user_name`：字符串类型，限制了长度范围（`min_length=2`, `max_length=10`），并添加了描述信息。

## 3. 接口路由与参数接收

代码演示了 GET 和 POST 两种请求方法，以及三种不同的参数传递和校验方式：

### 3.1 基础 GET 请求与简单路径参数

- **根目录接口 (`GET /`)**：返回基础的 JSON 消息 `{"message": "Hello World"}`。
- **简单路径参数 (`GET /hello/{name}`)**：通过 URL 路径传递参数，直接在视图函数中通过 `name: str` 接收。

### 3.2 路径参数校验 (`Path`)

使用 `fastapi.Path` 对 URL 路径中的动态参数进行严格的规则限制：

- **数值范围校验**：`GET /user/{user_id}` 接口中，规定 `user_id` 必须大于 0 (`gt=0`) 且小于 100 (`lt=100`)。
- **字符串长度校验**：`GET /userByName/{user_name}` 接口中，规定 `user_name` 的字符长度必须在 2 到 10 之间 (`min_length=2`, `max_length=10`)。

### 3.3 查询参数校验 (`Query`)

使用 `fastapi.Query` 对 URL 问号后面携带的查询字符串（Query String）进行校验：

- **分页参数提取 (`GET /users/list`)**：
  - `page_size`：必填项 (`...`)，要求数值在 1 到 100 之间。
  - `page_num`：选填项，设置了默认值为 `1`，并要求数值大于 0。

### 3.4 POST 请求与请求体接收

- **处理 JSON 请求体 (`POST /user`)**：通过将参数指定为前面定义的 `User` 模型，FastAPI 会自动读取 HTTP 请求体（Body）中的 JSON 数据，并根据 `User` 类中的 `Field` 规则进行自动校验和转换。

## 4. 响应类型

默认情况下，FastAPI 会**自动**将路径操作函数返回的 Python 对象（字典、列表、Pydantic 模型等），经由 `jsonable_encoder` 转换为 **JSON** 兼容格式，并包装为 `JSONResponse` 返回。这省去了手动序列化的步骤，让开发者能更专注于业务逻辑。

如果需要返回非 JSON 数据（如 HTML、文件流），FastAPI 提供了丰富的响应类型来返回不同数据：

| 响应类型              | 用途                   | 示例                                |
| :-------------------- | :--------------------- | :---------------------------------- |
| **JSONResponse**      | 默认响应，返回JSON数据 | `return {"key": "value"}`           |
| **HTMLResponse**      | 返回HTML内容           | `return HTMLResponse(html_content)` |
| **PlainTextResponse** | 返回纯文本             | `return PlainTextResponse("text")`  |
| **FileResponse**      | 返回文件下载           | `return FileResponse(path)`         |
| **StreamingResponse** | 流式响应               | 生成器函数返回数据                  |
| **RedirectResponse**  | 重定向                 | `return RedirectResponse(url)`      |

## 5. 自定义响应数据格式 (`response_model`)

`response_model` 是路径操作装饰器（如 `@app.get` 或 `@app.post`）的关键参数。

- **核心功能**：它通过一个 Pydantic 模型来严格定义和约束 API 端点的输出格式。
- **重要作用**：
  - 在提供自动数据验证和序列化的同时，更是**保障数据安全性的第一道防线**（例如确保敏感字段不会被意外返回给前端）。

## 6. 中间件 (Middleware)

中间件通过在函数的顶部使用装饰器 `@app.middleware("http")` 来定义。

中间件函数包含两个核心参数：

- **`request`**：代表当前的 HTTP 请求。
- **`call_next`**：用于将请求传递给后端的路径处理函数，并接收处理完成后的响应。

**代码示例：**

```python
@app.middleware("http")
async def middleware(request, call_next):
    print('中间件开始处理 -- start') # 请求到达路径函数前的处理
    response = await call_next(request) # 将请求传递给路径处理函数
    print('中间件处理完成 -- end')   # 获取到响应后的处理
    return response
```

## 7. 依赖注入 (Depends) 与路由分组

FastAPI 提供了一个强大且易用的依赖注入系统，常用于提取公共逻辑（如分页、鉴权、数据库连接等），极大提高代码复用率。

### 路由分组前缀 (prefix)：

创建子路由时使用 APIRouter(prefix="/depend")，可以为该路由模块下的所有接口自动加上统一的 /depend 前缀，使 URL 结构更清晰，减少重复书写。

### 依赖注入

1. 提取公共逻辑：

将原本需要在多个接口中重复写的查询参数校验逻辑（如提取 page_size 和 page_num），封装成一个普通的函数 common_paramters。

```python
async  def common_paramters(
        page_size: int=Query(...,gt=0,lt=100,description="每页数量，必须在1到100之间。"),
        page_num: int=Query(1,gt=0,description="页码")
):
    return {"page_size": page_size,"page_num": page_num}
```

2. 注入依赖 (Depends)：

在路径操作函数 get_depend 中，通过形参 common = Depends(common_paramters) 声明依赖。

```python
@depend_router.get("")
async def get_depend(common = Depends(common_paramters)):
    return {"message": "depend","common": common}
```

运行机制：当请求到达时，FastAPI 会自动先执行 common_paramters 函数，自动解析并校验 HTTP 请求中的参数，然后将其返回值直接注入给 common 变量，供业务逻辑使用。

## 8. 异常捕获与处理 (Exception Handling)

FastAPI 提供了强大且直观的异常处理机制，能够优雅地处理业务错误和参数校验错误。

### 8.1 抛出标准 HTTP 异常 (`HTTPException`)

这是最基本也是最常用的异常处理方式。当遇到业务逻辑错误（例如：数据不存在、权限不足等）时，可以直接通过 `raise` 抛出 `fastapi.HTTPException`。

- **核心参数**：
  - `status_code`：HTTP 状态码（例如 404 表示未找到，400 表示请求错误，403 表示禁止访问）。
  - `detail`：具体的错误描述信息，最终会转换为 JSON 返回给客户端。
  - `headers`：可选参数，用于在响应中添加自定义的 HTTP 头。
- **代码示例**：

  ```python
  from fastapi import HTTPException

  @app.get("/items/{item_id}")
  async def read_item(item_id: int):
      if item_id == 0:
          raise HTTPException(status_code=404, detail="Item not found")
      return {"item_id": item_id}
  ```

### 8.2 全局自定义异常处理器 (@app.exception_handler)

为了统一接口的返回格式（如企业级项目中通常要求返回固定的 {code, msg, data} 格式），我们可以自定义异常类，并使用 @app.exception_handler 装饰器进行全局拦截。

使用流程：

1. 定义一个继承自 Exception 的自定义异常类。

2. 编写一个处理函数，使用 @app.exception_handler(自定义异常类) 装饰。

3. 在处理函数中返回 JSONResponse（或其他类型的 Response）。

```python
from fastapi import Request
from fastapi.responses import JSONResponse

# 1. 自定义异常类
class BusinessException(Exception):
    def __init__(self, err_msg: str):
        self.err_msg = err_msg

# 2. 全局拦截该异常
@app.exception_handler(BusinessException)
async def business_exception_handler(request: Request, exc: BusinessException):
    return JSONResponse(
        status_code=400,
        content={"code": -1, "message": f"业务报错: {exc.err_msg}"},
    )

```

### 8.3 覆盖 FastAPI 默认的异常处理器

FastAPI 依赖 Pydantic 进行参数校验，当校验失败时，默认会抛出 RequestValidationError 并返回 422 Unprocessable Entity 状态码。可以通过覆盖该异常的处理器来改变默认行为（比如改成返回 400 状态码）。

```python

from fastapi.exceptions import RequestValidationError
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400, # 将默认的 422 状态码改为 400
        content={"message": "参数校验失败", "details": exc.errors()},
    )
```
