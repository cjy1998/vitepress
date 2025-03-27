---
     outline: deep
---

## 项目结构

```
DjangoProject01 #项目根目录
├─ db.sqlite3
├─ manage.py #入口程序，终端脚本命令，提供一系列用于生成文件或者目录的命令，也叫脚手架
└─ DjangoProject01 #主应用开发目录
   ├─ asgi.py #django3.0以后新增的，让django运行在异步编程模式的一个web应用对象
   ├─ __init__.py #包初始化文件
   ├─ settings.py #默认开发配置文件，填写数据库账号、密码等相关配置
   ├─ urls.py #总路由文件，用于绑定 django 应用程序和 url 的映射关系
   └─ wsgi.py #项目运行在wsgi服务器时的入口文件，本质上来说，manage.py runserver内部调用的就是wsgi
```

## 快速使用

在 django 中快速展示数据给用户需要三个步骤：

1. 创建子应用

   ```
   python manage.py startapp  [子应用名称]
   ```

   - 子应用文件结构

   ```
   DjangoProject01
   ├─ db.sqlite3
   ├─ manage.py
   ├─ DjangoProject01
   │  ├─ asgi.py
   │  ├─ __init__.py
   │  ├─ settings.py
   │  ├─ urls.py
   │  └─ wsgi.py
   └─ user #子应用文件夹
      ├─ models.py #定义数据库模型（ORM类）。在此文件中声明与数据表对应的Python类（继承自django.db.models.Model），Django会根据这些类自动生成数据库表。
      ├─ __init__.py #标识当前目录为Python包。
      ├─ apps.py #配置子应用的基本信息。包含一个继承自django.apps.AppConfig的类（如UserConfig），用于设置应用的显示名称（verbose_name）、初始化信号处理器等。需在项目的settings.py的INSTALLED_APPS中以'user.apps.UserConfig'形式引用。
      ├─ admin.py
      ├─ tests.py #编写单元测试或集成测试。
      ├─ views.py #处理HTTP请求的业务逻辑。
      └─ migrations #数据迁移文件
         └─ __init__.py
   ```

2. 在子应用的视图文件`views.py`中编写视图函数。

   ```
   #/user/views.py

   from django.http import HttpResponse
   from django.shortcuts import render

   # Create your views here.
   def index(request):
       # 业务代码，调用数据，for循环之类的
       data = '<h1>ok!!!<h1>'

       return HttpResponse(data, content_type='text/html')
   ```

3. 把视图函数和`url`进行绑定注册到 django 项目

   ```
   #/DjangoProject01/urls.py
   from django.urls import path
   from user import views as user_views
   urlpatterns = [
       path('user/', user_views.index)
   ]
   ```

   此时访问`http://127.0.0.1:8000/user/`，就会出现编写的内容。

## 路由入门

路由是一种映射关系，是把客户端请求的`url`地址和用户请求的应用程序（指 django 里边的 view）进行一对一绑定绑定映射。

### 视图基础

django 里边的视图主要有两种写法，分别是`函数视图`和`类视图`。

#### 函数视图

django 中的所有视图都建议编写在子应用的`views.py`文件中。

```python
from django.http import HttpResponse

# Create your views here.
def index(request):
    # 业务代码，调用数据，for循环之类的
    data = '<h1>ok!!!<h1>'
    return HttpResponse(data, content_type='text/html')
```

#### 请求

视图中的 request，实际上 django 源码中的`HTTPRequest`的子类`WSGIRequest`类的实例对象，主要由`django`对客户端请求的`http`协议报文进行解析后得到的请求相关的数据都在`request`中。

##### 限制 http 请求

| 请求方法 | 描述                |
| -------- | ------------------- |
| post     | 添加/上传           |
| get      | 获取/下载           |
| put      | 修改/更新，修改整体 |
| patch    | 修改/更新，修改部分 |
| delete   | 删除                |

使用装饰器`@require_http_methods(["GET"])`来限制 http 请求

##### 路由分层

1. 在子应用下创建子路由文件，一般路由文件名建议是`urls.py`

2. 把子应用下面的视图绑定代码转到`home/urls.py`

   ```python
   from django.urls import path
   from user import views as user_views
   urlpatterns = [
       path('getlist/', user_views.getlist),
       path('create/',user_views.create)
   ]
   ```

3. 在总路由中通过`include`加载路由文件到 django 项目中

```python
from django.urls import path, include
from user import urls as user_urls
urlpatterns = [
   path('user/', include(user_urls)),
]

```

##### 视图接收`http`请求

客户端发送请求数据一般有以下几种格式：

1. 查询字符串`http://127.0.0.1:8000/user/getlist?id=1&name=2`

   `id=1&name=2`就是查询字符串，可以通过`request.GET`来获取，

   注意：`GET`不是指`get`请求，不管是哪种请求方式，只要地址上有查询字符串，都可用这个方法来获取参数。

   ```python
   @require_http_methods(["GET"])
   def getlist(request):
       params = request.GET.dict()
       print(request.GET)
       # 业务代码，调用数据，for循环之类的
       data = '<h1>我是get请求<h1>'
       return HttpResponse(data, content_type='text/html')
   ```

   输出：`<QueryDict: {'id': ['1'], 'name': ['张三']}>`

   `QueryDict`的父类继承的就是`dict`字典，所以字典提供的方法或者操作，`QueryDict`都有。

   之所以用`QueryDict`来保存请求参数的原因是：默认的字典的键是唯一的，所以会导致如果有多个值使用了同一个键，则字典会覆盖。而`QueryDict`允许多个值使用同一个键，会自动收集所有的值保存在一个列表中作为当前键的值区寄存起来。

   `QueryDict`常用的方法有两个：

   `get(键)`：通过指定键获取最后一个值。

   `getlist(键)`：通过指定键获取所有的值，并以列表格式返回。

   当客户端没有传递参数时，可以使用`get`或者`getlist`的第二个参数`default`设置默认值。

   ```python
   request.GET.get("name","ac")
   ```

2. 请求体数据

   在各种`http`请求方法中，`post/put/patch`都是可以设置请求体的。

   `request.POST`只能获取客户端通过`POST`发送过来的请求体，无法获取`PUT/PATCH`的请求体。

   `request.body`可以获取`POST/PUT/PATCH`的请求体包括 json 格式。

3. 请求头报文信息

   1. `request.headers`
   2. `request.META`
   3. 获取自定义请求头`request.META.get("HTTP_****")` 或`request.headers.get("***")`

   `headers`简化了 HTTP 头访问，而`META`提供更底层的元数据。

   常见请求头

   | SERVER_NAME     | 服务端系统名称                      |
   | --------------- | ----------------------------------- |
   | REMOTE_ADDR     | 客户端所在的 IP 地址                |
   | SERVER_PORT     | 服务端的运行端口                    |
   | SERVER_SOFTWARE | 服务端运行 web 服务器的软件打印信息 |
   | PATH_INFO       | 客户端本次请求时的 url 路径         |

4. 上传文件

```python
@require_http_methods(["POST"])
def upload(request):
    import os
    # __file__ 魔术变量，写在哪里，就代表哪个文件
    for file in request.FILES.getlist('avatar'):
        # 保存在当前文件下
        # with open(f"{os.path.dirname(__file__)}/{file.name}","wb") as f:
        #   保存在根目录
          with open(f"./{file.name}", 'wb') as f:
            f.write(file.read())
    return HttpResponse("上传成功！！！")
```

`request.FILES`只能接收`post`请求发送的文件

#### 响应

##### 视图响应数据

1. 返回 HTML 数据

   ```python
   from django.http import HttpResponse
   def returnhtml(request):
       return HttpResponse("<h1>文本<h1/>", content_type='text/html',status=200,headers={'token':'bear 125465464'})
   ```

2. 返回 Json 数据

3. ```python
   from django.http import JsonResponse
   def returnjson(request):
       data = {
           'name': '1234',
           'age': 15
       }
       arr = [
           {
               'name': '张三',
               'age': 15
           },
           {
               'name': '李四',
               'age': 19
           }
       ]
       #JsonResponse并不直接支持列表转换成json格式，需要关闭安全检测，把safe参数的值设置为false
       return JsonResponse(arr,safe=False)
   ```

4. 返回图片格式信息

   图片、压缩包、视频等文件也可以。

   ```python
   def retunfile(request):
       with open("./logo.svg", 'rb') as f:
           img = f.read()
       return HttpResponse(content=img,content_type='image/svg+xml')
   ```

5. 自定义响应头

   ```python
   def setresponseheaders(request):
       response = HttpResponse("ok!!!")
       response['company'] = 'test'
       return response
   ```

##### 页面跳转

- 站内跳转

  1. 首先在总路由文件定义`namespace`

     ```python
     path('user/', include(user_urls, namespace='user')),
     ```

  2. 在子应用路由文件中定义`app_name`和`name`

     ```python
     app_name = 'user'
     urlpatterns = [
         path('returnhtml',user_views.returnhtml,name='returnhtml')
     ]
     ```

  3. 使用`redirect`进行跳转

     ```python
     def redirectin(request):
         return  redirect("user:returnhtml")
     ```

- 站外跳转

  ```python
  @require_http_methods(["GET"])
  def redirecturl(request):
      url = "http://www.baidu.com/"
      # 原理
      # response = HttpResponse(status=301)
      # response['location'] = url
      # return response
      return HttpResponseRedirect(url)
  ```

### 会话控制技术

会话控制技术，主要作用是**为了识别和记录用户在 web 应用中的身份行为和操作历史**

实现会话控制的几种技术类型：

| 特性         | Cookie               | Session                 | Token（如 JWT）           |
| :----------- | :------------------- | :---------------------- | :------------------------ |
| **存储位置** | 客户端（浏览器）     | 服务端                  | 客户端（LocalStorage 等） |
| **安全性**   | 依赖 Cookie 安全标志 | 依赖 Session ID 安全性  | 依赖签名/加密机制         |
| **扩展性**   | 适用传统服务         | 服务器需存储会话数据    | 适合分布式系统            |
| **跨域支持** | 需配置 `SameSite` 等 | 依赖 Cookie 或 URL 传递 | 可轻松跨域                |
| **数据大小** | 有大小限制（~4KB）   | 无限制（服务端存储）    | 可较大，但影响请求头大小  |

#### 典型工作流程示例

1. **Cookie + Session**：
   - 用户登录 → 服务器创建 Session → 返回 Session ID 通过 Cookie 存储。
   - 后续请求携带 Session ID → 服务器验证 Session 有效性。
2. **Token（JWT）**：
   - 用户登录 → 服务器生成 JWT（含用户信息） → 返回给客户端。
   - 客户端存储 Token → 后续请求在 `Authorization` 头中携带 Token。
   - 服务器验证签名和过期时间 → 无需查询数据库。

---

#### 如何选择？

- **传统 Web 应用**：Cookie + Session（简单易用）。
- **前后端分离/移动端**：Token（无状态、跨域友好）。
- **高安全性场景**：结合 HTTPS、HttpOnly Cookie 和短期 Token。



## 类视图

Django 提供了两种主要的视图编写方式：`函数视图和类视图`。类视图作为函数视图的替代方案，通过将视图逻辑组织为 Python 对象的方式来实现。虽然函数视图对于简单的场景非常直观，但类视图在处理更复杂的逻辑、代码重用以及利用面向对象的技术（如继承和混入）方面展现出显著的优势

 类视图和函数视图的核心目标是一致的：接收一个 `HttpRequest` 对象作为输入，并返回一个 `HttpResponse` 对象或引发一个异常 。然而，函数视图通常将所有 HTTP 方法的处理逻辑都放在一个函数中，可能需要使用条件语句来区分不同的请求类型。相比之下，类视图则将针对不同 HTTP 方法（如 GET、POST）的处理逻辑分别封装在类的方法中，例如 `get()` 方法处理 GET 请求，`post()` 方法处理 POST 请求 。这种组织方式使得代码结构更加清晰，易于阅读和维护。

Django 引入类视图的主要目的是为了解决函数视图在大型项目中可能出现的代码冗余问题，并提供更好的代码复用机制，尤其是在实现常见的 Web 开发任务（如创建、读取、更新、删除，即 CRUD 操作）时 。虽然对于初学者来说，函数视图可能更容易理解，但随着应用程序复杂性的增加，类视图所提供的结构化和可扩展性使其成为更强大和可维护的解决方案 。

使用类视图带来了诸多益处。其中最显著的优势之一便是代码的可重用性，这主要通过继承来实现 。可以将通用的视图逻辑实现在一个基类中，然后让其他的视图类继承这个基类，从而避免了重复编写相同的代码。此外，类视图还支持使用混入（mixins）来扩展功能 。混入是一些提供特定功能的类，可以通过多重继承的方式将这些功能添加到视图类中，而无需深入理解继承的复杂性。

类视图通过将不同 HTTP 请求方法的处理逻辑分离到不同的方法中，实现了更好的代码结构 。这使得代码更易于理解和维护，因为每个方法都专注于处理特定的请求类型。更重要的是，Django 本身提供了一系列内置的通用类视图，这些视图为常见的 Web 开发任务提供了预配置的功能，例如显示对象列表、显示单个对象的详细信息以及处理表单等 。这些通用视图极大地加快了开发速度，并遵循了最佳实践。

类视图还提供了很高的自定义灵活性，开发者可以通过重写类中的属性和方法来定制视图的行为，以满足特定的需求 。例如，可以修改视图使用的模板名称、查询的数据集或者表单处理的逻辑。然而，需要注意的是，虽然混入提供了强大的代码复用能力，但在不当使用或理解不足的情况下，可能会增加代码的复杂性，使得调试变得更加困难 。因此，在使用混入时，需要对其提供的功能有清晰的理解。

### 常用的内置类视图

Django 提供了一系列强大的内置类视图，可以极大地简化常见的 Web 开发任务。

- **`View`**: 这是所有类视图的基础类 2。它提供了一个 `dispatch()` 方法，该方法接收一个 HTTP 请求，并根据请求的方法（例如 GET、POST）将请求分发到相应的处理方法（例如 `get()`、`post()`） 2。虽然 `View` 类本身很少直接使用，但它是构建其他更高级类视图的基础。理解 `dispatch()` 方法的工作原理对于理解类视图如何处理请求至关重要。
- **`TemplateView`**: 这个视图类的主要功能是渲染一个指定的模板 3。它非常适用于显示静态内容或者只需要简单地将数据传递给模板进行展示的场景。使用 `TemplateView` 需要指定 `template_name` 属性，告知视图需要渲染哪个模板文件 3。可以通过重写 `get_context_data(**kwargs)` 方法向模板传递额外的上下文数据 4。
- **`ListView`**: 用于显示模型对象列表 3。使用 `ListView` 需要指定 `model` 属性来指示要显示哪个模型的数据，或者可以重写 `get_queryset()` 方法来定义需要显示的对象的查询集 3。`ListView` 默认会使用一个遵循特定命名约定的模板（例如 `<app_name>/<model_name>_list.html`），但可以通过设置 `template_name` 属性进行自定义 3。对于需要展示大量数据的场景，`ListView` 通常会与 `PaginationMixin` 配合使用来实现分页功能 5。
- **`DetailView`**: 用于显示单个模型对象的详细信息 3。与 `ListView` 类似，`DetailView` 也需要指定 `model` 属性 3。它会根据 URL 中提供的参数（通常是主键 `pk`）自动获取对应的对象并传递给模板进行渲染 3。`DetailView` 也遵循类似的模板命名约定（例如 `<app_name>/<model_name>_detail.html`），并且可以通过 `template_name` 进行自定义 3。
- **`FormView`**: 用于处理表单的显示和提交 4。使用 `FormView` 需要指定 `form_class` 属性，该属性指向要使用的 Django 表单类 3。表单的提交通常在 `post()` 方法中处理 4。`FormView` 提供了 `form_valid(form)` 和 `form_invalid(form)` 方法，分别在表单验证成功和失败时被调用，允许开发者定义相应的处理逻辑 4。成功处理表单后，通常会通过 `success_url` 属性指定的 URL 进行重定向 3。
- **`CreateView`**: 专门用于创建新的模型对象 3。它继承自 `FormView`，通常需要指定 `model` 属性以及 `fields` 属性（指定要在表单中显示的字段）或 `form_class` 属性 3。`CreateView` 默认使用 `<app_name>/<model_name>_form.html` 作为模板，但可以自定义 3。
- **`UpdateView`**: 用于更新已存在的模型对象 3。它同样继承自 `FormView`，并且需要指定 `model` 属性以及 `fields` 或 `form_class` 属性 3。`UpdateView` 会根据 URL 中的参数（通常是 `pk`）自动获取要更新的对象 3。其默认模板也为 `<app_name>/<model_name>_form.html`，并支持自定义 3。
- **`DeleteView`**: 用于删除模型对象 4。它需要指定 `model` 属性以及 `success_url` 属性，用于在成功删除后进行重定向 4。`DeleteView` 也会根据 URL 中的参数（通常是 `pk`）获取要删除的对象 3。它通常会使用一个确认删除的模板（默认命名约定为 `<app_name>/<model_name>_confirm_delete.html`），并且可以通过 `template_name` 进行自定义。

这些内置的通用类视图为常见的 CRUD 操作提供了强大的抽象，极大地减少了开发者需要编写的代码量 3。理解这些视图的默认行为和配置方式对于高效地使用 Django 进行 Web 开发至关重要。同时，它们提供的自定义选项也确保了在更复杂的场景下依然能够满足需求 3。

### 在类视图中处理 HTTP 请求

在类视图中，针对不同 HTTP 请求方法的处理逻辑被分别定义在不同的方法中。

当类视图接收到一个 HTTP GET 请求时，Django 会调用该视图类中的 `get()` 方法 。在像 `DetailView` 和 `ListView` 这样的通用视图中，`get()` 方法主要负责从数据库中获取所需的数据，并准备好传递给模板的上下文 。而在 `FormView` 中，`get()` 方法通常用于实例化并显示初始表单 5。

对于 HTTP POST 请求，Django 会调用类视图中的 `post()` 方法 。`post()` 方法通常用于处理提交的数据。在 `FormView`、`CreateView` 和 `UpdateView` 等处理表单的视图中，`post()` 方法负责接收表单数据，进行验证，并在验证成功后保存数据到数据库 。

除了 `get()` 和 `post()` 方法之外，类视图还可以实现其他 HTTP 方法的处理逻辑，例如 `put()`、`delete()`、`head()` 和 `options()` 等 。这使得类视图能够更全面地处理各种类型的 HTTP 请求，尤其是在构建 RESTful API 时非常有用。决定调用哪个方法的核心在于基类 `View` 中的 `dispatch()` 方法 。`dispatch()` 方法会检查传入请求的 HTTP 方法，并将其路由到视图类中名称与之对应的方法。例如，如果请求是 GET 请求，则调用 `get()` 方法；如果是 POST 请求，则调用 `post()` 方法，以此类推。

将不同 HTTP 方法的处理逻辑清晰地分离到不同的方法中，是类视图相较于函数视图的一个显著优势 。这种组织方式使得代码结构更加清晰，开发者可以更容易地理解和维护不同请求类型对应的处理逻辑，而不需要在一个函数中使用大量的条件语句进行区分。

### `as_view()` 方法的作用与用法

由于类视图本质上是 Python 类，而不是可以直接调用的函数，因此它们不能直接在 Django 的 URL 配置文件（`urls.py`）中使用 。为了将类视图连接到 URL 配置，Django 提供了一个名为 `as_view()` 的类方法 。

`as_view()` 方法的作用是将一个类视图转换成一个可调用的视图函数，这个函数可以被 Django 的 URL 路由系统所识别和使用。当 Django 的 URL 匹配到某个模式，并且该模式指向一个通过 `as_view()` 得到的函数时，Django 就会调用这个函数。

实际上，当 `as_view()` 被调用时，它会创建一个类视图的实例，并返回一个内部函数。当这个内部函数被调用时（通常是因为有匹配的请求到来），它会调用该视图实例的 `dispatch()` 方法 。正是 `dispatch()` 方法根据 HTTP 请求的方法将请求分发到视图类中相应的处理方法（如 `get()` 或 `post()`）。

一个非常有用的特性是，可以在 `urls.py` 中调用 `as_view()` 时传递参数，这些参数会作为属性传递给类视图的实例 2。例如，对于 `TemplateView`，可以直接在 `urls.py` 中指定 `template_name`：

```python
from django.urls import path
from django.views.generic import TemplateView

urlpatterns =
```

在这个例子中，当访问 `/about/` 路径时，`TemplateView` 的实例会被创建，并且其 `template_name` 属性会被设置为 `'about.html'`。

`as_view()` 方法就像一个适配器，它将面向对象的类视图结构转换成 Django URL 调度器所期望的基于函数的接口。这种设计使得我们既可以享受到面向对象编程带来的好处，又能够无缝地集成到 Django 的请求-响应处理流程中。

### 类视图中的模板渲染与上下文数据

在类视图中，模板的渲染和上下文数据的传递是至关重要的环节，用于将动态生成的内容呈现给用户。

许多 Django 的通用类视图都遵循一定的模板命名约定 。例如，`ListView` 默认会查找名为 `<app_name>/<model_name>_list.html` 的模板，而 `DetailView` 则会查找 `<app_name>/<model_name>_detail.html`。这种约定化的方式可以减少开发者的配置工作。当然，也可以通过在视图类中设置 `template_name` 属性来显式指定要使用的模板文件 。对于像 `CreateView` 和 `UpdateView` 这样的表单处理视图，默认的模板名称通常会带有 `_form` 后缀，例如 `<app_name>/<model_name>_form.html` 。

上下文数据是指在视图中准备好并传递给模板的变量字典，模板可以使用这些变量来动态地生成 HTML 内容 。Django 的通用类视图会自动提供一些默认的上下文数据。例如，在 `ListView` 中，模型对象的列表通常会以 `object_list` 或模型名称的小写形式作为键传递给模板；在 `DetailView` 中，单个模型对象通常会以 `object` 或模型名称的小写形式作为键传递 。

为了向模板传递额外的自定义上下文数据，可以在类视图中重写 `get_context_data(**kwargs)` 方法 。这个方法通常会返回一个字典，其中包含了所有需要在模板中使用的变量。在重写 `get_context_data()` 方法时，一个重要的最佳实践是首先调用父类的 `get_context_data()` 方法，使用 `super()` 关键字来实现，这样可以确保父类提供的默认上下文数据不会丢失 。然后，可以在返回的字典中添加自定义的键值对。例如：

```python
from django.views.generic import DetailView
from myapp.models import MyModel

class MyModelDetailView(DetailView):
    model = MyModel
    template_name = 'myapp/mymodel_detail.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['extra_info'] = '一些额外的信息'
        return context
```

在这个例子中，除了 `DetailView` 默认提供的模型对象之外，模板 `'myapp/mymodel_detail.html'` 还可以访问名为 `extra_info` 的变量，其值为 `'一些额外的信息'`。

`get_context_data()` 方法提供了一种标准化的、可扩展的方式来管理传递给模板的数据。这有助于保持代码的清晰和一致性，使得开发者能够更容易地理解哪些数据在模板中可用，以及这些数据是如何从视图传递过来的。

### 在类视图中处理 Django 表单

Django 的类视图为处理 Web 表单提供了强大的支持，特别是 `FormView`、`CreateView` 和 `UpdateView` 这几个通用视图。

要显示一个表单，通常需要在视图类中指定 `form_class` 属性，该属性指向要使用的 Django 表单类 。在 `FormView` 中，表单实例会自动在模板上下文中以 `form` 为键提供，使得模板可以轻松地渲染表单字段 。

当用户提交表单时，通常会发送一个 HTTP POST 请求，这个请求会被类视图的 `post()` 方法处理 。在 `post()` 方法中，会使用提交的数据（通常在 `request.POST` 中）创建一个表单实例。

接下来，需要对提交的表单数据进行验证。这是通过调用表单实例的 `is_valid()` 方法来完成的 。如果 `is_valid()` 返回 `True`，则表示表单数据通过了所有验证规则，此时会调用视图的 `form_valid(form)` 方法 。在这个方法中，开发者可以执行与成功提交的表单数据相关的操作，例如将数据保存到数据库。如果 `is_valid()` 返回 `False`，则表示表单数据存在错误，此时会调用视图的 `form_invalid(form)` 方法 。在这个方法中，通常会将包含错误信息的表单重新渲染给用户。

对于像 `FormView`、`CreateView` 和 `UpdateView` 这样的视图，在成功处理完有效的表单后，通常需要将用户重定向到另一个页面。这个重定向的目标 URL 通常通过在视图类中设置 `success_url` 属性来指定 。

`form_valid()` 和 `form_invalid()` 方法的引入，为处理表单提交的成功和失败情况提供了一个清晰的结构 。通过重写这两个方法，开发者可以精确地控制在不同验证结果下应该执行的操作，使得代码更加模块化和易于维护。

### 自定义类视图

Django 的类视图提供了多种方式进行自定义，以满足各种不同的需求。

一种常见的自定义方式是重写视图类的属性 。例如，可以通过设置 `template_name` 属性来指定视图使用的模板，覆盖默认的模板名称 。同样，可以设置 `model` 属性来指定与视图相关的模型，设置 `form_class` 属性来指定要使用的表单类，以及设置 `success_url` 属性来定义表单提交成功后的重定向 URL。

另一种更强大的自定义方式是重写视图类的方法 。以下是一些常用的可以被重写的方法：

- **`get_context_data(\**kwargs)`**: 这个方法用于向模板传递额外的上下文数据 。通过重写这个方法，可以将需要在模板中使用的任何自定义变量添加到上下文字典中。
- **`get_queryset()`**: 在 `ListView` 中，这个方法用于获取要显示的对象的查询集 。通过重写这个方法，可以对查询结果进行过滤、排序等操作，以满足特定的显示需求。
- **`form_valid(form)`**: 在处理表单的视图中，当表单验证成功后，这个方法会被调用 。可以在这个方法中实现保存表单数据、发送邮件等自定义逻辑。
- 还有许多其他的方法可以被重写，例如 `get_object()`（用于在 `DetailView` 和 `UpdateView` 中获取要操作的单个对象）、`get_success_url()`（用于动态生成成功后的重定向 URL）以及 HTTP 方法的处理函数 `get()` 和 `post()` 等。

通过重写属性和方法，开发者可以在不修改 Django 框架源代码的情况下，灵活地定制通用类视图的行为，使其能够适应各种复杂的应用场景 。这种自定义能力是类视图强大功能的重要体现。

### Mixin 的概念与在类视图中的应用

Mixin 是一种可重用的类，它提供了一组特定的功能，可以通过多重继承将其混入到其他的类中 。在 Django 的类视图中，Mixin 是一种强大的工具，用于扩展视图的功能而无需使用传统的继承方式。

使用 Mixin 的主要优势在于代码的重用性 。可以将一些通用的功能封装在 Mixin 中，然后在多个视图类中混入这些 Mixin，避免了重复编写相同的代码，遵循了 DRY（Don't Repeat Yourself）原则。此外，Mixin 还有助于提高代码的模块化程度和可扩展性 。通过简单地添加或移除 Mixin，可以轻松地为视图类添加或移除特定的功能。

Django 提供了许多常用的 Mixin，用于实现各种常见的功能：

- **`LoginRequiredMixin`**: 用于确保只有已登录的用户才能访问该视图 。如果用户未登录，则会被重定向到登录页面。
- **`PermissionRequiredMixin`**: 要求用户拥有特定的权限才能访问该视图 。
- **`UserPassesTestMixin`**: 允许定义自定义的测试函数来判断用户是否有权访问该视图 。
- **`FormMixin`**: 为那些不直接继承自表单处理通用视图的类视图（如 `TemplateView`）提供处理表单的方法 。
- **`MultipleObjectMixin`** 和 **`SingleObjectMixin`**: 提供处理多个或单个对象的方法，常与 `TemplateView` 等视图配合使用来显示数据 。
- **`PaginationMixin`**: 为显示对象列表的视图添加分页功能 。
- **`ContextMixin`**: 提供了一种方便的方式向模板上下文添加额外的变量 。
- **`CsrfExemptMixin`**: 使视图免受 CSRF 保护（谨慎使用）。

通过将多个 Mixin 组合到一个类视图中，可以轻松地实现复杂的功能 。例如，要创建一个需要用户登录才能访问的对象列表视图，可以将 `LoginRequiredMixin` 和 `ListView` 结合使用：

```python
from django.views.generic import ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import MyModel

class MyProtectedListView(LoginRequiredMixin, ListView):
    model = MyModel
    template_name = 'myapp/mymodel_list.html'
```

在这个例子中，`MyProtectedListView` 同时继承了 `LoginRequiredMixin` 和 `ListView`，因此它既具有 `ListView` 展示对象列表的功能，又具备 `LoginRequiredMixin` 提供的登录验证功能。

Mixin 是扩展 Django 类视图功能的强大工具，它通过组合可重用的功能模块，使得代码更加灵活、易于维护和扩展。然而，在使用多个 Mixin 时，需要注意它们之间的相互作用以及方法解析顺序（MRO），以确保最终的视图行为符合预期 。

### 结论

Django 的类视图提供了一种强大且灵活的方式来构建 Web 应用程序的视图。它们通过组织代码、利用面向对象的技术（如继承和混入）以及提供一系列内置的通用视图，极大地提高了开发效率和代码质量。虽然函数视图在某些简单场景下依然适用，但对于更复杂的应用，类视图无疑是更佳的选择。理解类视图的定义、优势、常用的内置类、HTTP 请求处理方式、`as_view()` 方法、模板渲染、表单处理、自定义方法以及 Mixin 的应用，是成为一名高效 Django 开发者的关键。通过合理地使用类视图，开发者可以编写出更清晰、更易于维护和扩展的 Django 应用程序。

| **特性**       | **函数视图 (FBVs)**                                  | **类视图 (CBVs)**                            |
| -------------- | ---------------------------------------------------- | -------------------------------------------- |
| 定义           | Python 函数                                          | Python 类                                    |
| 代码组织       | 通常在一个函数中处理所有 HTTP 方法，可能使用条件分支 | 将不同 HTTP 方法的处理逻辑分离到不同的方法中 |
| 可重用性       | 通过辅助函数或装饰器实现，继承机制较弱               | 通过继承和混入实现高度的代码重用             |
| 可扩展性       | 主要通过装饰器扩展                                   | 通过继承和混入实现灵活的功能扩展             |
| 初学者复杂度   | 相对容易理解                                         | 学习曲线稍高                                 |
| 处理 HTTP 方法 | 通常使用条件语句 (if/elif)                           | 使用不同的类方法 (get(), post() 等)          |
| 使用继承       | 较少使用                                             | 广泛使用                                     |
| 使用混入       | 不直接支持                                           | 支持使用混入扩展功能                         |
| 适用简单视图   | 非常适合                                             | 也可以，但可能显得过于复杂                   |
| 适用复杂视图   | 可能导致代码臃肿和难以维护                           | 更易于组织和维护                             |

| **类视图**     | **主要用途**               | **关键属性/方法**                                            |
| -------------- | -------------------------- | ------------------------------------------------------------ |
| `View`         | 所有类视图的基础           | `dispatch()`                                                 |
| `TemplateView` | 渲染指定的模板             | `template_name`, `get_context_data()`                        |
| `ListView`     | 显示模型对象列表           | `model`, `queryset`, `template_name`, `get_queryset()`       |
| `DetailView`   | 显示单个模型对象的详细信息 | `model`, `template_name`, `get_object()`                     |
| `FormView`     | 显示和处理表单             | `form_class`, `template_name`, `success_url`, `post()`, `form_valid()`, `form_invalid()` |
| `CreateView`   | 创建新的模型对象           | `model`, `fields`, `form_class`, `template_name`, `success_url` |
| `UpdateView`   | 更新已存在的模型对象       | `model`, `fields`, `form_class`, `template_name`, `success_url`, `get_object()` |
| `DeleteView`   | 删除模型对象               | `model`, `template_name`, `success_url`, `get_object()`      |

| **Mixin**                 | **主要用途**                                           |
| ------------------------- | ------------------------------------------------------ |
| `LoginRequiredMixin`      | 确保只有已登录的用户才能访问视图                       |
| `PermissionRequiredMixin` | 要求用户拥有特定权限才能访问视图                       |
| `UserPassesTestMixin`     | 允许定义自定义测试函数来判断用户是否有权访问视图       |
| `FormMixin`               | 为非表单处理通用视图提供处理表单的方法                 |
| `MultipleObjectMixin`     | 提供处理多个对象的方法，常与 `TemplateView` 等配合使用 |
| `SingleObjectMixin`       | 提供处理单个对象的方法，常与 `TemplateView` 等配合使用 |
| `PaginationMixin`         | 为显示对象列表的视图添加分页功能                       |
| `ContextMixin`            | 提供一种方便的方式向模板上下文添加额外的变量           |
| `CsrfExemptMixin`         | 使视图免受 CSRF 保护（谨慎使用）                       |

## 中间件

### **1. 引言**

在 Django 框架中，中间件是一个强大的组件，它构成了一个处理 HTTP 请求和响应的钩子框架 。这种轻量级的底层插件系统允许开发者全局地修改 Django 的输入和输出 。**中间件位于 Web 服务器和视图层之间，充当着桥梁的角色** 。它使得在 HTTP `请求到达视图函数之前`以及`响应返回给客户端之前`，对请求和响应进行`拦截`、`修改`或`增强`成为可能 。Django 中间件以“中间件栈”的形式运作，其中每个中间件组件都是一个实现特定功能的 Python 类或函数 。

中间件提供了一种实现诸如`日志记录`、`缓存`、`安全性`、`身份验证`和`会话管理`等横切关注点的有效方式，这些功能需要在应用程序的多个视图中应用 。通过集中管理这些通用功能，中间件提高了代码的重用性和模块化 。此外，中间件还增强了应用程序的安全性，因为它提供了一个全局机制来执行安全检查 。通过缓存和其他技术，中间件也有助于应用程序的性能优化 。

### **2. 中间件在请求-响应周期中的作用**

中间件是 Django 请求生命周期中不可或缺的一部分 。在请求阶段，中间件位于 URL 路由和视图执行之间 。当服务器接收到请求后，Django 会首先进行 URL 路由，将请求的路径与 `urls.py` 文件中定义的 URL 模式进行匹配 。在视图执行之前，请求会通过一系列中间件进行处理 。而在响应阶段，中间件则在视图执行之后、响应发送回客户端之前处理响应 。

在请求处理阶段，中间件会拦截所有进入的 HTTP 请求，在它们到达视图函数之前进行处理 。这些中间件按照它们在 `settings.py` 文件的 `MIDDLEWARE` 设置中列出的顺序（从上到下）依次执行 。每个中间件都有机会修改请求对象或者通过返回一个 `HttpResponse` 对象来短路后续的处理 。这种机制允许在请求到达实际处理它的视图之前执行一些预处理操作，例如`身份验证`或`日志记录`。

在响应处理阶段，中间件会拦截所有发出的 HTTP 响应，在它们发送回客户端之前进行处理 。这些中间件按照它们在 `MIDDLEWARE` 设置中列出的顺序的逆序（从下到上）依次执行 。每个中间件都有机会修改响应对象 。这使得在响应离开 Django 应用程序之前，可以进行一些后处理操作，例如添加特定的 HTTP 头或压缩响应内容。

此外，中间件还可以处理在请求-响应周期中引发的异常 。Django 会自动将视图或中间件引发的异常转换为适当的 HTTP 错误响应 。中间件中的 `process_exception` 方法会在视图引发异常时被调用，允许开发者自定义异常处理逻辑，例如记录错误或返回特定的错误页面 。

### **3. 中间件的执行顺序**

Django 中间件的执行顺序至关重要，它直接影响着请求和响应的处理流程 。

- 在请求阶段，中间件按照其在 `settings.py` 文件中 `MIDDLEWARE` 列表中定义的顺序从上到下依次应用 。这意味着列表顶部的中间件会首先处理请求。具体来说，`process_request` 和 `process_view` 这两个方法会按照这个顺序被执行 。

- 在响应阶段，中间件的应用顺序则完全相反，即按照 `MIDDLEWARE` 列表中定义的顺序从下到上依次执行 。这意味着列表底部的中间件会首先处理响应。`process_response`、`process_template_response` 和 `process_exception` 这些方法会按照这个逆序被执行 。

值得注意的是，如果一个中间件的 `process_request` 或 `process_view` 方法返回了一个 `HttpResponse` 对象，那么 Django 将不会继续处理链中后续的中间件，也不会执行相应的视图函数 。相反，该响应会立即传递给响应中间件，并按照逆序进行处理 。这种机制被称为短路请求处理，它在实现某些功能时非常有用，例如未经验证的用户尝试访问受保护的资源时，可以立即返回一个重定向到登录页面的响应。

中间件的顺序对于应用程序的正确运行至关重要，因为某些中间件可能依赖于其他中间件提供的功能 。例如，`AuthenticationMiddleware` 通常应该放在 `SessionMiddleware` 之后，因为它需要访问会话数据来识别用户 。同样，为了尽早实施安全策略，`SecurityMiddleware` 通常会放在 `MIDDLEWARE` 列表的顶部附近 。因此，配置 `MIDDLEWARE` 设置时需要仔细考虑每个中间件的功能及其依赖关系，以确保请求和响应能够按照预期的方式被处理。错误的中间件顺序可能会导致应用程序出现意想不到的行为，甚至引入安全漏洞。

### **4. Django 内置中间件**

这些内置中间件通常在创建新 Django 项目时默认激活，并在 `settings.py` 文件的 `MIDDLEWARE` 设置中列出 。

以下是一些常用的内置中间件及其功能：

- **`SecurityMiddleware`**: 该中间件通过添加各种安全相关的 HTTP 头（例如 `X-XSS-Protection`、`X-Content-Type-Options`），强制执行 SSL/TLS (HTTPS) 重定向，以及管理 HTTP 严格传输安全 (HSTS) 等功能来增强应用程序的安全性 。
- **`SessionMiddleware`**: 该中间件负责管理用户的会话，使得 Django 可以处理会话数据并将用户与使用会话的请求关联起来 。
- **`CommonMiddleware`**: 该中间件处理一些常见的操作，例如根据 `APPEND_SLASH` 设置进行 URL 规范化（添加或移除尾部斜杠），根据 `PREPEND_WWW` 设置将不带 "www" 前缀的 URL 重定向到带有前缀的版本，以及设置 `Content-Length` 响应头 。
- **`CsrfViewMiddleware`**: 该中间件通过在 POST 请求中添加并验证 CSRF 令牌，来提供针对跨站请求伪造 (CSRF) 攻击的保护 。
- **`AuthenticationMiddleware`**: 该中间件在请求对象中添加 `user` 属性，表示当前登录的用户（如果已登录），并使用会话管理用户的身份验证状态 。
- **`MessageMiddleware`**: 该中间件支持基于 Cookie 和会话的消息传递，确保消息在重定向后仍然存在，并在用户访问的下一个页面上显示 。
- **`GZipMiddleware`**: 该中间件使用 GZip 压缩响应内容，以减少带宽使用 。

这些内置中间件为许多常见的 Web 应用程序需求提供了坚实的基础。通过理解每个内置中间件的目的和功能，开发者可以利用这些组件快速实现基本功能，而无需从头开始编写代码。通常建议至少保持 `CommonMiddleware` 处于激活状态 。

| **中间件类**               | **功能**                                                 |
| -------------------------- | -------------------------------------------------------- |
| `SecurityMiddleware`       | 添加安全头，强制执行 SSL/TLS 重定向，管理 HSTS。         |
| `SessionMiddleware`        | 管理用户会话。                                           |
| `CommonMiddleware`         | 处理 URL 规范化，"www" 前缀处理，设置 `Content-Length`。 |
| `CsrfViewMiddleware`       | 提供针对跨站请求伪造 (CSRF) 攻击的保护。                 |
| `AuthenticationMiddleware` | 在请求对象中添加 `user` 属性。                           |
| `MessageMiddleware`        | 支持基于 Cookie 和会话的消息传递。                       |
| `GZipMiddleware`           | 使用 GZip 压缩响应。                                     |

### **5. 自定义 Django 中间件**

除了使用 Django 提供的内置中间件之外，开发者还可以根据应用程序的特定需求创建自定义中间件 。自定义中间件允许开发者添加专门的逻辑来处理请求、修改响应、执行自定义身份验证和授权、进行日志记录、监控性能等等 。

创建自定义中间件有两种主要方法：基于类和基于函数 。

**基于类的中间件**: 

通过定义一个 Python 类来实现，该类通常包含一个 `__init__` 方法（用于一次性初始化）和一个 `__call__` 方法（用于处理每个请求/响应）。`__init__` 方法接收一个 `get_response` 可调用对象作为参数，该对象是链中的下一个中间件或视图函数本身 。`__call__` 方法接收一个 `request` 对象作为参数，并且应该返回一个 `response` 对象。它通常会调用 `self.get_response(request)` 将请求传递给下一个中间件或视图 。此外，基于类的中间件还可以实现特定的钩子方法，例如 `process_request`、`process_response`、`process_view`、`process_exception` 和 `process_template_response` 。

**基于函数的中间件**: 

通过定义一个函数来实现，该函数接收一个 `get_response` 可调用对象，并返回另一个接收 `request` 并返回 `response` 的函数 。

**以下是创建自定义中间件（以基于类为例）的步骤 ：**

1. 在你的 Django 应用程序中创建一个 Python 文件（例如，`middleware.py`）。
2. 定义一个类（例如，`RequestLoggingMiddleware`），并在其中定义一个 `__init__` 方法，该方法接收 `get_response` 作为参数 。
3. 实现 `__call__` 方法，在该方法中执行你希望在调用 `self.get_response(request)` 之前和/或之后执行的操作 。
4. 可选地，可以实现其他钩子方法，例如 `process_request`、`process_response` 等。
5. 在项目的 `settings.py` 文件中的 `MIDDLEWARE` 列表中注册你的自定义中间件，通过提供中间件类的完整 Python 路径 。

自定义中间件提供了一种强大的方式来全局扩展 Django 的功能。无论是使用基于类还是基于函数的方法，其核心原则都是拦截和处理请求与响应。选择哪种方法通常取决于中间件的复杂性和是否需要在中间件中管理状态。基于类的中间件允许通过 `__init__` 方法存储状态，这在某些场景下非常有用 。

### **6. 常用的中间件方法及其功能**

Django 中间件提供了多个钩子方法，允许开发者在请求-响应周期的不同阶段插入自定义逻辑 2。理解这些方法的调用时机和作用对于创建有效的自定义中间件至关重要。

- **`__init__(self, get_response)`**: 这是一个构造方法，在 Web 服务器启动时只会被调用一次 。它接收一个 `get_response` 可调用对象作为参数，该对象要么是链中的下一个中间件，要么是视图函数本身 。这个方法通常用于中间件的一次性配置和初始化 。
- **`__call__(self, request)`**: 这个方法对于每个请求都会被调用 。它接收一个 `HttpRequest` 对象作为输入，并且应该返回一个 `HttpResponse` 对象 1。通常，它会调用 `self.get_response(request)` 将请求传递给处理链中的下一个阶段 。`__call__` 方法允许在视图（或后续中间件）被调用之前和之后执行代码 。
- **`process_request(self, request)`**: 这个方法在 Django 确定哪个视图应该处理请求之前被调用 。它接收一个 `HttpRequest` 对象作为输入，并且应该返回 `None` 或一个 `HttpResponse` 对象 。如果返回 `None`，Django 将继续处理请求 。如果返回一个 `HttpResponse`，Django 将短路请求处理并返回该响应 。
- **`process_view(self, request, view_func, view_args, view_kwargs)`**: 这个方法在 Django 确定要执行的视图函数之后，但在实际调用视图函数之前被调用 。它接收 `HttpRequest` 对象、视图函数以及传递给视图的参数作为输入，并且应该返回 `None` 或一个 `HttpResponse` 对象，与 `process_request` 类似 。当你需要知道哪个视图将被执行时，这个方法非常有用 。
- **`process_template_response(self, request, response)`**: 这个方法在视图函数执行完毕后被调用，前提是响应是一个 `TemplateResponse` 对象或等效对象（即具有 `render()` 方法）。它接收 `HttpRequest` 对象和 `TemplateResponse` 对象作为输入，并且必须返回一个实现了 `render` 方法的响应对象 。这个方法允许在渲染之前修改模板或上下文数据 。
- **`process_response(self, request, response)`**: 这个方法在视图函数执行完毕并且响应即将返回给浏览器之前，对所有响应都会被调用 。它接收 `HttpRequest` 对象和 `HttpResponse` 对象作为输入，并且必须返回一个 `HttpResponse` 或 `StreamingHttpResponse` 对象 。即使同一个中间件中的 `process_request` 或 `process_view` 方法返回了一个响应，`process_response` 方法也总是会被调用 。这个方法按照逆序执行 。
- **`process_exception(self, request, exception)`**: 当视图函数引发异常时，这个方法会被调用 。它接收 `HttpRequest` 对象和 `Exception` 对象作为输入，并且应该返回 `None` 或一个 `HttpResponse` 对象 。如果它返回一个 `HttpResponse`，该响应将被返回给浏览器。否则，将使用默认的异常处理机制 。这个方法也按照逆序执行 。

| **方法名**                  | **调用时机**                                | **作用**                                                     | **返回值**                                     |
| --------------------------- | ------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| `__init__`                  | 服务器启动时，仅一次                        | 中间件的一次性初始化                                         | `None`                                         |
| `__call__`                  | 每个请求                                    | 处理请求和响应，包含中间件的核心逻辑                         | `HttpResponse` 对象                            |
| `process_request`           | 在视图选择之前                              | 在 Django 确定执行哪个视图之前调用，可以修改请求或短路处理   | `None` 或 `HttpResponse` 对象                  |
| `process_view`              | 在视图选择之后，视图执行之前                | 在 Django 识别视图之后但在执行之前调用，可以根据视图修改请求或短路处理 | `None` 或 `HttpResponse` 对象                  |
| `process_template_response` | 视图执行之后，如果响应是 `TemplateResponse` | 如果视图返回 `TemplateResponse` 则调用，允许修改模板或上下文 | 实现了 `render` 方法的响应对象                 |
| `process_response`          | 视图执行之后，响应返回浏览器之前            | 对所有响应调用，允许修改响应                                 | `HttpResponse` 或 `StreamingHttpResponse` 对象 |
| `process_exception`         | 视图引发异常时                              | 当视图引发异常时调用，允许自定义异常处理                     | `None` 或 `HttpResponse` 对象                  |

### **7. Django 中间件的实际应用场景**

Django 中间件具有广泛的应用场景，开发者可以利用它来解决各种实际问题。

- **日志记录**: 中间件可以用于记录传入的请求（例如，HTTP 方法、路径、头部信息、用户信息）、响应状态码和内容 ，以及跟踪请求的处理时间以进行性能分析 。
- **性能监控**: 通过中间件可以测量和记录请求/响应的时间 6，并可以集成到各种性能监控工具中 。
- **安全检查**: 中间件是执行各种安全检查的理想场所，例如身份验证和授权 、IP 白名单或黑名单 、限制请求频率以防止滥用 、添加自定义安全 HTTP 头 、清理请求数据以防止恶意输入 、处理跨域资源共享 (CORS) ，以及实现 JSON Web Tokens (JWT) 身份验证 。
- **请求和响应修改**: 中间件可以用于修改请求和响应，例如向响应添加自定义 HTTP 头 、修改请求参数 、进行内容压缩（例如，使用 GZip），以及进行 URL 重写或重定向 。
- **会话管理**: 虽然 Django 提供了内置的会话管理机制，但通过中间件可以实现自定义的会话处理逻辑 。
- **错误处理**: 中间件可以用于实现自定义的错误页面或针对特定异常的响应 ，以及记录错误信息 。
- **分析和跟踪**: 中间件可以用于跟踪用户活动和行为 ，以及收集用于分析目的的数据 。

中间件的多功能性使其成为解决各种应用程序需求的不可或缺的工具。通过实现自定义中间件，开发者可以将特定的功能封装起来，并在整个 Django 项目中全局应用，从而使得代码更清晰、更有条理、更易于维护。

### **8. Django 中间件的配置方式**

Django 中间件的配置主要通过 `settings.py` 文件中的 `MIDDLEWARE` 设置来完成 。

要激活一个中间件组件（无论是内置的还是自定义的），只需将其完整的 Python 路径（以字符串形式）添加到 `MIDDLEWARE` 列表中即可 。`MIDDLEWARE` 列表中中间件的顺序决定了请求阶段的执行顺序 。

要禁用一个中间件，只需从 `MIDDLEWARE` 列表中移除其路径即可 。

### **9. Django 中间件的最佳实践和注意事项**

在使用 Django 中间件时，遵循一些最佳实践可以帮助开发者构建更健壮、更高效的应用程序。

- **保持中间件的专注和轻量**: 理想情况下，每个中间件应该只处理一个特定的任务 。避免在中间件中执行繁重的计算或 I/O 密集型操作，以最大程度地减少开销并降低对请求/响应时间的影响 。
- **维护正确的顺序**: 确保中间件在 `MIDDLEWARE` 设置中以正确的顺序列出，考虑到它们之间的依赖关系以及期望的处理流程 。
- **优雅地处理异常**: 在中间件中实现适当的错误处理机制，以防止意外崩溃或中断请求/响应周期 。
- **为自定义中间件编写文档**: 清晰地记录自定义中间件的目的、功能以及任何特定的注意事项，以提高可维护性和可理解性 。
- **测试你的中间件**: 编写单元测试以确保你的自定义中间件按预期工作，并且不会引入任何意外的副作用 。
- **避免过度使用中间件**: 虽然中间件功能强大，但应避免创建过多的中间件层，因为它会给请求处理增加不必要的开销 。考虑某些功能是否最好在视图或实用函数中实现，而不是作为全局中间件。
- **注意性能影响**: 分析你的中间件以识别任何性能瓶颈，并优化中间件的逻辑以提高速度和效率 。
- **考虑异步支持**: 了解中间件可以支持同步、异步或两种类型的请求 ，如果你的中间件可以处理异步请求，请声明其异步能力 。
- **限制对请求对象的依赖**: 虽然中间件可以修改请求对象，但通常建议保持其原始结构，以确保视图中的一致性和可维护性 。

有效使用 Django 中间件需要在利用其全局功能强大性的同时，避免性能瓶颈或过于复杂的中间件栈之间取得平衡。通过遵循最佳实践，例如保持中间件的专注性、维护正确的顺序以及彻底测试自定义中间件，开发者可以构建健壮且高效的 Django 应用程序。

### **10. 结论**

Django 中间件提供了一个强大而灵活的机制，用于全局拦截和处理 HTTP 请求和响应。它在实现横切关注点和增强 Django 应用程序的功能方面发挥着至关重要的作用。理解请求-响应周期、中间件执行顺序和常用的中间件方法对于有效使用中间件至关重要。

使用 Django 中间件的益处包括提高代码的重用性和模块化、集中管理通用功能、增强应用程序的安全性和性能，以及允许自定义请求/响应流程。

掌握 Django 中间件是任何希望构建健壮、可扩展和可维护的 Web 应用程序的 Django 开发者的一项关键技能。

## 数据库

### 配置数据库连接

在`settings.py` 中保存了数据库的连接配置信息，Django 默认初始配置使用`sqlite`数据库。

使用 Django 的数据库操作，主要分为以下步骤：

1. 在`settings.py`配置数据库连接信息。
2. 在目标子应用的`models.py`中定义模型类。
3. 生成数据库迁移文件并执行迁移文件。
4. 通过模型类对象提供的方法或属性完成数据表的增删改查操作。

#### 配置 mysql 数据库

1. 安装驱动

   ```python
    pip install PyMySQL
   ```

2. 在 django 的主应用目录下的`_init_.py`文件中添加如下语句：

   ```python
   # 让mysql以mysqldb的方式来对接orm
   from pymysql import install_as_MySQLdb
   install_as_MySQLdb()
   ```

3. 在`settings.py`配置数据库连接信息

   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'HOST': '127.0.0.1',
           'PORT': '3306',
           'NAME': 'school',
           'USER': 'root',
           'PASSWORD': 'cjy19980128',
           #数据库连接池配置，主要是为了节省连接数据库的开销，临时存储数据库连接对象
           'POOL_OPTIONS': {
               'POOL_SIZE': 10,
               'MAX_OVERFLOW': 30,
           }
   
       }
   }
   ```

#### 定义模型类

- 模型类被定义在**子应用/models.py**文件中。

- 模型类必须直接或者间接继承于 django.db.models.Model 类

  ```python
  from django.db import models

  # Create your models here.
  class Student(models.Model):
      # django模型不需要自己单独声明主键，模型会自动创建主键 ID，在代码中直接可以通过模型对象.id或者模型对象.pk就可以调用主键。
      STATUS_CHOICES = (
          # (数据库值，程序显示给外界看的文本)
          (0,"正常"),
          (1,"未入学"),
          (2,"已毕业")
      )
      # django模型不需要自己单独声明主键，模型会自动创建主键 ID，在代码中直接可以通过模型对象.id或者模型对象.pk就可以调用主键。
      name = models.CharField(max_length=15,db_index=True,verbose_name="姓名")
      age = models.IntegerField(default=0,verbose_name="年龄")
      sex = models.BooleanField(default=True,verbose_name="性别")
      phone = models.CharField(max_length=20,unique=True,verbose_name="手机号码")
      classmate = models.CharField(max_length=50,db_column="class",default="",verbose_name="班级编号")
      description = models.TextField(null=True,verbose_name="个性签名")
      status  = models.IntegerField(choices=STATUS_CHOICES,default=0,verbose_name="学生状态")

      class Meta:
          db_table = 'student'
          verbose_name = "学生信息"
          verbose_name_plural = verbose_name

      def __str__(self):
          return self.name
  ```

- 字段选项

  [https://docs.djangoproject.com/zh-hans/4.2/ref/models/fields/#model-field-types]:

#### 迁移数据库   

```bash
 python manage.py makemigrations
 python manage.py migrate
```

### ORM 框架

ORM（Object-Relational Mapping，对象关系映射）是一种编程技术，用于在**面向对象编程语言**和**关系型数据库**之间建立桥梁，让开发者能用面向对象的方式操作数据库，而无需直接编写复杂的 SQL 语句。

---

#### 核心思想

将数据库中的 **表（Table）** 映射为程序中的 **类（Class）**，表中的每一行数据（记录）映射为类的 **对象（Object）**，表中的字段（列）映射为对象的 **属性（Property）**。开发者通过操作对象，间接完成对数据库的增删改查。

---

#### ORM 的核心组成部分

1. **模型类（Model Class）**
   定义一个类，对应数据库中的一张表。例如，`User` 类对应 `users` 表，类的属性（如 `id`、`name`）对应表的字段。

2. **映射配置（Mapping Configuration）**
   通过配置文件或注解（Annotation）定义类与表、属性与字段的对应关系。例如：

   ```python
   # Django ORM 示例
   class User(models.Model):
       name = models.CharField(max_length=100)
       age = models.IntegerField()
   ```

3. **查询接口（Query Interface）**
   提供面向对象的 API 代替 SQL。例如：

   ```java
   // Hibernate (Java) 示例
   List<User> users = session.createQuery("FROM User WHERE age > 18").list();
   ```

4. **事务管理（Transaction Management）**
   封装数据库事务的提交、回滚操作，确保数据一致性。

5. **数据库连接池（Connection Pool）**
   管理数据库连接，提升性能。

---

#### 常见 ORM 框架

- **Java**: Hibernate、MyBatis（半自动 ORM）、JPA（规范，Hibernate 是其实现）
- **Python**: Django ORM、SQLAlchemy
- **Ruby**: ActiveRecord（Rails 内置）
- **C#**: Entity Framework

---

#### ORM 的优缺点

##### 优点

1. **提高开发效率**
   避免手写 SQL，减少重复代码。
2. **代码可维护性**
   用面向对象思维设计数据模型，代码更直观。
3. **数据库兼容性**
   更换数据库（如 MySQL → PostgreSQL）时，只需修改配置，无需重写 SQL。
4. **防 SQL 注入**
   通过参数化查询自动处理输入，提升安全性。

##### 缺点

1. **性能损耗**
   复杂查询可能生成低效 SQL，需手动优化。
2. **学习成本**
   需要掌握 ORM 的查询语法和配置规则。
3. **复杂场景受限**
   如多表关联查询、存储过程、复杂聚合操作，可能仍需手写 SQL。

---

#### ORM 适用场景

- **快速开发**：适合 CRUD（增删改查）为主的业务系统（如后台管理、电商平台）。
- **中小型项目**：数据模型相对简单，ORM 能显著提升效率。
- **团队协作**：统一数据操作规范，减少 SQL 风格差异。

---

#### 示例：Django ORM 操作数据库

```python
# 定义模型
class Book(models.Model):
    title = models.CharField(max_length=200)
    publish_date = models.DateField()

# 插入数据
book = Book(title="Python编程", publish_date="2023-10-01")
book.save()

# 查询数据
books = Book.objects.filter(publish_date__year=2023)

# 更新数据
book.title = "Python入门到精通"
book.save()

# 删除数据
book.delete()
```

---

#### 简单的增删改查

```python
import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
# 1.先导入模型
from . import models

# Create your views here.

class StudentView(View):
    def get(self, request):
        """
        第一种方式
        """
        object_list = models.Student.objects.all()
        # student_list = []
        # for student in object_list:
        #     student_list.append({
        #         "id": student.id,
        #         "name": student.name,
        #         "age": student.age,
        #         "sex": student.sex,
        #         "classmate": student.classmate,
        #         "description": student.description,
        #         "created_time": student.created_time,
        #         "updated_time": student.updated_time,
        #     })
        # print(student_list)
        student = object_list[0]
        #获取模型对象的字段属性
        print(student.id,student.pk) #获取主键
        print(student.name,student.description) #获取其他属性
        print(student.created_time.strftime("%Y-%m-%d %H:%M:%S")) #获取日期格式化内容
       # 当字段声明中，使用 choices 可选值选项以后，在模型对象里边就可以通过get_<字段名>_display() 来获取当前选项的文本提示
        print(student.status,student.get_status_display())
        """
        第二种
        """
        # student_list = models.Student.objects.all().values()
        # return JsonResponse(list(student_list), safe=False)
        return JsonResponse({}, safe=False)


    def post(self, request):
        # print(request.body.decode())
        # data = request.body.decode()
        # models.Student.objects.create(data=data)
        #
        # return JsonResponse(data, status=201)
        try:
            # 解析 JSON 数据
            raw_data = request.body.decode()
            data = json.loads(raw_data)

            # 创建学生对象（注意字段对应）
            student = models.Student.objects.create(
                name=data.get('name'),
                age=data.get('age', 0),  # 默认值处理
                sex=data.get('sex', True),
                phone=data.get('phone'),
                classmate=data.get('classmate', ''),  # 注意模型中的 db_column="class"
                description=data.get('description', None),
                status=data.get('status', 0)
            )

            # 返回创建的对象数据
            return JsonResponse({
                'id': student.id,
                'name': student.name,
                'age': student.age,
                'phone': student.phone,
                'status': student.get_status_display(),  # 显示 choice 的文本
                'created_time': student.created_time.isoformat()
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    def put(self, request):
        data = {}
        return JsonResponse(data, status=201)

    def delete(self, request):
        data = {}
        return JsonResponse(data, status=204)
```

#### 总结

ORM 是面向对象与关系数据库之间的“翻译器”，简化了数据库操作，但需权衡其便利性与性能成本。对于复杂场景，可以结合原生 SQL 或使用“混合模式”（如 MyBatis 的动态 SQL）。

### 数据库基本操作

#### 增加数据

1. **save**

   ```python
    def post(self, request):
               # 解析 JSON 数据
               raw_data = request.body
               data = json.loads(raw_data)
               student = models.Student(
                       name=data.get('name'),
                       age=data.get('age', 0),  # 默认值处理
                       sex=data.get('sex', True),
                       phone=data.get('phone'),
                       classmate=data.get('classmate', ''), 
                       description=data.get('description', None),
                       status=data.get('status', 0)
               )
               student.save()
   
               # 返回创建的对象数据
               return JsonResponse({
                  'msg':"成功",
                   'code':200
               }, status=201)
   
   ```

   

2. **create**

   ```python
   def post(self, request):
               # 解析 JSON 数据
               raw_data = request.body
               data = json.loads(raw_data)
                #创建学生对象
               student = models.Student.objects.create(
                   name=data.get('name'),
                   age=data.get('age', 0),  # 默认值处理
                   sex=data.get('sex', True),
                   phone=data.get('phone'),
                   classmate=data.get('classmate', ''),  # 注意模型中的 db_column="class"
                   description=data.get('description', None),
                    status=data.get('status', 0)
                )
               # 返回创建的对象数据
               return JsonResponse({
                  'msg':"成功",
                   'code':200
               }, status=201)
   ```

3. **bulk_create**

   ```python
   def post(self, request):
               # 解析 JSON 数据
               raw_data = request.body
               data = json.loads(raw_data)
               stu1 = models.Student(
                   name='p1',
                   age=15,
                   sex=True,
                   phone= "15970076941",
                   classmate= "9",
                   description= "最好的安排",
                   status="1"
               )
               stu2 = models.Student(
                   name='p2',
                   age=15,
                   sex=True,
                   phone="15970076942",
                   classmate="9",
                   description="最好的安排",
                   status="1"
               )
               stu3 = models.Student(
                   name='p3',
                   age=15,
                   sex=True,
                   phone="15970076943",
                   classmate="9",
                   description="最好的安排",
                   status="1"
               )
               models.Student.objects.bulk_create([stu1, stu2, stu3])
               # 返回创建的对象数据
               return JsonResponse({
                  'msg':"成功",
                   'code':200
               }, status=201)
   ```

#### 基本查询

1. **get**

   ```python
     name = request.GET.get('name')
           #如果获取不到则抛出DoesNotExist异常
           # try:
           #     student =  models.Student.objects.get(name=name)
           # except models.Student.DoesNotExist:
           #     return JsonResponse({'msg':'失败','code':500,'data':None})
           # return JsonResponse({'msg':'成功','code':200,'data':{'name': student.name,'age': student.age})
   
           #如果获取到符合条件的数据有多条也会报错
           try:
               student = models.Student.objects.get(name=name)
           except models.Student.MultipleObjectsReturned:
               return JsonResponse({'msg': '失败', 'code': 500, 'data': None})
           return JsonResponse({'msg': '成功', 'code': 200, 'data': {'name': student.name,'age': student.age}})
   ```

2. **first**

   获取查询结果的第一条记录，如果查询数据不存在，则返回None

   ```python
    student = models.Student.objects.first()
   ```

3. **all**

   ```python
    """
     第一种方式
     """
      object_list = models.Student.objects.all()
      student_list = []
      for student in object_list:
          student_list.append({
              "id": student.id,
              "name": student.name,
              "age": student.age,
              "sex": student.sex,
              "classmate": student.classmate,
              "description": student.description,
              "created_time": student.created_time,
              "updated_time": student.updated_time,
          })
      print(student_list)
   
      student = object_list[0]
     #获取模型对象的字段属性
      print(student.id,student.pk) #获取主键
      print(student.name,student.description) #获取其他属性
      print(student.created_time.strftime("%Y-%m-%d %H:%M:%S")) #获取日期格式化内容
     # 当字段声明中，使用 choices 可选值选项以后，在模型对象里边就可以通过get_<字段名>_display() 来获取当前选项的文本提示
       print(student.status,student.get_status_display())
   
     """
     第二种
     """
     # student_list = models.Student.objects.all().values()
     # return JsonResponse(list(student_list), safe=False)
   
   ```

4. **count**

   统计返回查询的结果集的数量，结果是一个数字。 

   ```python
    num = models.Student.objects.filter(name='p1').count()
    return JsonResponse({'msg': '成功', 'code': 200, 'data': num})
   ```

#### 更新数据

1. **save**

   ```python
    def put(self, request):
           raw_data = request.body
           json_data = json.loads(raw_data)
           print(json_data)
           student = models.Student.objects.get(id=json_data['id'])
           if student:
               student.name = json_data['name']
               student.age = json_data['age']
               student.sex = json_data['sex']
               student.phone = json_data['phone']
               student.classmate = json_data['classmate']
               student.description = json_data['description']
               student.status = json_data['status']
               student.save()
           data = {
               'id': student.id,
               'name': student.name,
               'age': student.age,
           }
           return JsonResponse(data, status=201)
   ```

2. **update**

   更新符合条件的一条或者多条数据

   ```python
   student = models.Student.objects.filter(id__in=[1,2]).update(classmate='c101')
   ```

#### 删除数据

1. **objects.filter().delete()**

   删除符合条件的一条或多条

   ```python
    def delete(self, request):
           id = request.GET.get('id')
           student = models.Student
           student.objects.filter(id=id).delete()
           data = {'msg':'删除成功'}
           return JsonResponse(data, status=204)
   ```

2. **模型类对象.delete()**

   ```python
      student = models.Student.objects.get(id=id)
           if student:
               student.delete()
   ```

   

### 数据库进阶操作

#### 过滤条件

- **filter**：过滤出符合条件的多个结果

- **exclude**：排除掉符合条件的多个结果，与`filter`相反

- **get**：过滤单一结果，结果不是一个会报错

  ```python
  #单表过滤
  #此处的运算符是django的ORM提供的英文单词运算符，与python的运算符不一样，例如ORM 的大于是gt，大于等于是gte
  模型类.objects.filter(属性名称__=值)
  
  #多表过滤
  模型类.objects.filter(外键属性名称__外键模型的属性名称__运算符=值)
  ```

  **运算符**

  1. 相等 `exact` 等同于 `=`

  2. 模糊查询 

     `contains`：是否包含

     ```python
     class StusView(View):
         def get(self, request):
             name = request.GET.get('name')
             obj_list = models.Student.objects.filter(name__contains=name)
             stu_list = []
             for obj in obj_list:
                 stu_list.append({
                     "id": obj.id,
                     "name": obj.name,
                     "age": obj.age,
                     "classmate": obj.classmate,
                     "description": obj.description,
                     "status": obj.status,
                     "phone": obj.phone,
                 })
     
             print(stu_list)
             return JsonResponse({'code': 200, 'mes': '成功','data':stu_list}, status=200)
     ```

     `startswith`:以什么开头

     ```python
     # 模糊查询 以什么开头
     obj_list = models.Student.objects.filter(name__startswith=name)
     ```

     `endswith`:什么结尾

     ```python
     # 以什么结尾
     obj_list = models.Student.objects.filter(name__endswith=name)
     ```

  3. 空查询 `isnull`

     ```python
      obj_list = models.Student.objects.filter(description__isnull=True)
     ```

  4. 范围查询

     `in`:是否包含在范围内

     ```python
       obj_list = models.Student.objects.filter(classmate__in=['c101','c102','c103'])     
     ```

  5. 取值范围

     `range`:设置开始值与结束值范围，进行数值判断，符合范围的数据被查询出来。不仅可以设置数值范围，也可以设置时间范围。

     ```python
       obj_list = models.Student.objects.filter(created_time__range=('2025-03-05','2025-03-08'))
     ```

  6. 比较查询

     - `gt`大于
     - `gte`大于等于
     - `lt`小于
     - `lte`小于等于
     - 不等于运算符使用`exclude()`过滤器

  7. 日期查询

     1. django的ORM中提供了许多方法用于进行日期的查询过滤，例如：`year` `month` `day` `week_day` `hour` `minute` `second` 都可以对日期时间类型的属性进行运算。
     2. 要进行日期时间的过滤查询，必须保证python 代码中使用的时间时区与mysql 数据库中的时间时区是对应的。
     3. 时间范围查询，先把字符转转换为时间戳。

  8. F对象

     主要用于在 SQL 语句中针对字段之间的值进行比较的查询。

     ```python
      def post(self, request):
             student = models.Student.objects.filter(created_time=F('updated_time')).values("name","created_time","updated_time")
     
             return JsonResponse({'code': 200,'data':  list(student)}, status=200)
     ```

  9. Q对象

     多个过滤器逐个调用表示逻辑与关系，同sql 语句中where 部分的and 关键字。

     例如：

     ```python
       def get(self, request):
             name = request.GET.get('name')
             phone = request.GET.get('phone')
             obj_list = models.Student.objects.filter(name=name).filter(phone=phone).values()
             return JsonResponse({'code': 200,'data':list(obj_list)}, status=200)
     ```

     如果需要实现逻辑或or 的查询，需要使用Q()对象结合｜运算符。

     ```python
       obj_list = models.Student.objects.filter(Q(name='p1')|Q(name='p2')).values()
     ```

#### 结果排序

`order_by`：升序（ASC）数值从小到大；降序（DESC）数值从大到小。 

```python
 obj_list = models.Student.objects.filter(Q(classmate='c101') | Q(classmate='c102') | Q(classmate='c103')).order_by('age').values()
```

```python
#降序 -age
obj_list = models.Student.objects.filter(Q(classmate='c101') | Q(classmate='c102') | Q(classmate='c103')).order_by('-age').values()
```

多字段排序：

- 多字段升序：order_by('字段名','字段名')  优先级从左往右
- 多字段降序：order_by('-classmate','-age')

#### 限制查询

ORM中针对查询结果的数量限制，提供了一个查询集对象[QuerySet]。这个QuerySet是ORM中针对查询结果进行临时保存数据的一个容器对象，可以通过了解**QuerySet**达到**查询优化**的目的，也或者**限制查询结果数量**的作用。

##### 查询集QuerySet

查询集，也称查询结果集、`QuerySet`，表示从数据库中获取的对象集合。

当调用如下ORM提供的过滤方法时，Django会返回查询集（不是简单的列表）。

- all()：返回所有数据。
- filter()：返回满足条件的数据。filter会默认调用all方法。
- exclude()：返回满足条件之外的数据集。`exclude`会默认调用all 方法。
- order_by()：对结果进行排序。order_by 会默认调用all 方法。

**判断某一个查询集中是否有数据：**

- `exists()`: 判断查询集中是否有数据，如果有则返回True，没有则返回False。
- `values()`: 把结果集中的模型对象转换成`字典`，并可以设置转换的字段列表，达到减少内存损耗，提高性能。
- `values_list()`: 把结果集中的模型对象转换成**列表**，并可以设置转换的字段列表（元祖），达到减少内存损耗，提高性能。

**`QuerySet`的两大特性**

**1. 惰性执行（Lazy Loading）**

**特性**：QuerySet 的查询操作**不会立即执行**，而是延迟到真正需要数据时才向数据库发送请求。
**原理**：

- 当你通过 `filter()`、`exclude()`、`annotate()` 等方法链式构建查询时，Django 只会记录这些操作，**不会生成或执行 SQL**。
- 只有在以下情况发生时，才会触发真正的数据库查询（称为 **"Evaluation"**）：
  - 遍历 QuerySet（如 `for obj in queryset`）
  - 强制转换（如 `list(queryset)`）
  - 切片（如 `queryset[5:10]`）
  - 调用 `len()`、`exists()`、`count()` 等方法

```python
# 此时未执行任何 SQL
queryset = Book.objects.filter(title__contains="Django")

# 添加更多过滤条件（依然不会执行 SQL）
queryset = queryset.exclude(publish_year__lt=2020)

# 真正触发 SQL 执行（遍历时）
for book in queryset:
    print(book.title)
```

**优势**：

- **减少冗余查询**：避免中间步骤生成无效 SQL。
- **灵活组合查询**：可动态拼接条件，最后生成最优 SQL。

**2. 缓存机制（Caching）**

**特性**：QuerySet **第一次被求值时会将结果缓存**，后续重复使用同一 QuerySet 时直接读取缓存，避免重复查询数据库。
**原理**：

- 第一次遍历或强制求值时，Django 会执行 SQL 并将结果存储在 QuerySet 的缓存中。
- 后续对同一 QuerySet 的操作（如再次遍历）会直接使用缓存，**不再访问数据库**。

```python
# 第一次遍历：执行 SQL 并缓存结果
books = Book.objects.all()
print([book.title for book in books])  # 触发数据库查询

# 第二次遍历：直接读取缓存，无 SQL
print([book.price for book in books])  # 无数据库查询
```

**注意**：

- 如果中途修改 QuerySet（如新增过滤条件），会**清空缓存**并重新生成 SQL。
- 缓存是**基于 QuerySet 实例**的，不同 QuerySet 实例不共享缓存。

**优势**：

- **避免重复查询**：对同一 QuerySet 多次操作时节省数据库开销。

##### 限制结果数量

django中还可以对查询集QuerySet进行**取下标*或切片操作，等同于SQL中的limit和offset字句**。

注意：QuerySet不是真正的列表，所以它不支持负数索引。

**对查询集进行切片后返回一个新的查询集，但还是不会立即执行查询。**

如果获取一个对象，直接使用[0]，等同于[0:1].get()，但是如果没有数据，[0]引发`IndexError异常`，[0:1].get()如果没有数据引发`DoesNotExist异常`

#### 聚合分组

在 Django 中，**聚合函数（Aggregation）** 用于对数据库中的数据进行统计和计算（如求和、平均值、最大值、最小值等）。Django 的 ORM 通过 `django.db.models` 模块提供了丰富的聚合函数，结合 `aggregate()` 和 `annotate()` 方法，可以高效地完成复杂的数据分析操作。

------

##### **核心聚合函数**  

Django 内置了以下常用聚合函数，可直接从 `django.db.models` 导入：

| 聚合函数                        | 说明                                                       |
| :------------------------------ | :--------------------------------------------------------- |
| `Count(field, distinct=False)`  | 统计数量（`distinct=True` 表示去重计数）。                 |
| `Sum(field)`                    | 对字段值求和。                                             |
| `Avg(field)`                    | 计算字段的平均值。                                         |
| `Max(field)`                    | 取字段的最大值。                                           |
| `Min(field)`                    | 取字段的最小值。                                           |
| `StdDev(field, sample=False)`   | 计算标准差（`sample=True` 为样本标准差，默认总体标准差）。 |
| `Variance(field, sample=False)` | 计算方差（`sample=True` 为样本方差，默认总体方差）。       |

##### **两种聚合方法**

**1. `aggregate()`：全局聚合**

- **作用**：对整个 `QuerySet` 进行聚合计算，返回一个包含聚合结果的**字典**。

- **适用场景**：统计全表数据的总和、平均值等。

- **语法**

  ```python
  from django.db.models import Sum, Avg
  
  result = Model.objects.aggregate(
      别名1=聚合函数(字段名),
      别名2=聚合函数(字段名),
  )
  ```

**示例**：统计所有书籍的总价格和平均价格

```python
from django.db.models import Sum, Avg

# 查询结果：{'total_price': 1000, 'avg_price': 50}
Book.objects.aggregate(
    total_price=Sum('price'),
    avg_price=Avg('price')
)
```

------

#### **2. `annotate()`：分组聚合**

- **作用**：为 `QuerySet` 中的每个对象添加聚合结果（类似 SQL 的 `GROUP BY`）。

- **适用场景**：按某个字段分组统计（如统计每个分类的商品数量）。

- **语法**：

  ```python
  Model.objects.values('分组字段').annotate(
      别名=聚合函数(字段名)
  )
  ```

**示例**：统计每个作者的书籍数量

```python
from django.db.models import Count
# 按 author 分组，统计每个作者的书籍数量
# 结果：[{'author': 'Alice', 'book_count': 3}, {'author': 'Bob', 'book_count': 5}]
Author.objects.values('name').annotate(
    book_count=Count('book')
)
```

#### 原生查询

执行原生SQL语句，在django中我们可以自己引入pymysql执行SQL，也可以调用ORM提供的raw方法来执行SQL语句。

如果使用raw方法执行SQL语句，则返回结果是QuerySet，这个返回结果在操作字段时，会有额外的性能损耗。

#### 多库共存

##### 1. 配置多数据库

在 `settings.py` 中定义多个数据库连接。例如，配置一个默认数据库和一个名为 `secondary` 的数据库：

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'default_db',
        'USER': 'user',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '3306',
    },
    'secondary': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'secondary_db',
        'USER': 'user',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

------

##### 2. 手动选择数据库

在查询时通过 `using()` 方法显式指定数据库：

```python
# 向 secondary 数据库写入数据
User.objects.using('secondary').create(name='Alice')

# 从 secondary 数据库读取数据
users = User.objects.using('secondary').all()
```

------

##### 3. 数据库路由（自动选择数据库）

编写路由类（如 `routers.py`），定义读写规则：

```python
# routers.py
class SecondaryRouter:
    """
    将特定模型的操作路由到 secondary 数据库。
    """
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'myapp':
            return 'secondary'
        return None  # 其他情况由默认路由处理

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'myapp':
            return 'secondary'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        # 允许跨数据库关联（根据需求调整）
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # 控制迁移操作的目标数据库
        if app_label == 'myapp':
            return db == 'secondary'
        return None
```

在 `settings.py` 中注册路由：

```python
DATABASE_ROUTERS = ['path.to.routers.SecondaryRouter']
```

------

##### 4. 迁移多数据库

为不同数据库执行迁移命令：

```python
# 迁移 default 数据库
python manage.py migrate

# 迁移 secondary 数据库
python manage.py migrate --database=secondary
```

------

##### 5. 事务处理

Django 默认不支持跨数据库事务，需分开处理：

```python
from django.db import transaction

# 在 default 数据库的事务
with transaction.atomic(using='default'):
    User.objects.create(name='Bob')

# 在 secondary 数据库的事务
with transaction.atomic(using='secondary'):
    LogEntry.objects.create(action='update')
```

------

##### 6. 动态切换数据库

在视图或中间件中根据请求动态切换：

```python
class DBRouterMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 根据请求参数动态选择数据库
        if request.user.is_premium:
            request.db = 'secondary'
        else:
            request.db = 'default'
        response = self.get_response(request)
        return response

# 在视图中使用
def my_view(request):
    User.objects.using(request.db).filter(...)
```

------

##### 7. 自动生成模型

从特定数据库生成模型：

```python
python manage.py inspectdb --database=secondary > secondary_models.py
```

------

##### 注意事项

1. **模型归属**：通过 `app_label` 或路由规则确保模型与数据库对应。
2. **跨数据库关联**：默认不支持跨数据库外键，需通过 `db_constraint=False` 或手动处理。
3. **性能**：避免频繁跨库查询，可能影响性能。

### 关联模型

关联模型实际上就是ORM提供给开发者使用用于操作多表数据的功能，因为多个表之间存在的关联关系，往往都是基于建库建表之初的实体关系分析（ER图）和范式理论梳理出来的。

构建数据库和构建数据表：实体、属性、关系。

实体：在现实世界中，客观存在的能够被区分的人事物或集体概念。

属性：具有描述性、修饰性的词语，用于描述实体的特征。

#### 一对一

| 选项                     | 作用描述                                          | 应用场景示例                                                 | 注意事项                                                     |
| :----------------------- | :------------------------------------------------ | :----------------------------------------------------------- | ------------------------------------------------------------ |
| **`models.CASCADE`**     | 删除父对象时，**级联删除**所有关联的子对象。      | 用户（父）删除后，其所有文章（子）一并删除。                 | 谨慎使用，可能导致意外数据丢失。                             |
| **`models.DO_NOTHING`**  | 不干预数据库操作，**完全依赖数据库约束**处理。    | 需要手动处理外键关系，或在数据库层通过触发器控制。           | 需确保数据库有相应约束（如外键级联），否则可能引发 `IntegrityError`。 |
|                          |                                                   |                                                              |                                                              |
| **`models.SET_NULL`**    | 父对象删除时，将子对象的外键字段设为 **`NULL`**。 | 删除分类（父）时，保留文章（子），但将其分类字段设为 `NULL`。 | 外键字段必须设置 `null=True`，否则报错。                     |
| **`models.SET_DEFAULT`** | 父对象删除时，将子对象的外键字段设为 **默认值**。 | 删除用户（父）时，将子对象（如订单）的 `user` 字段设为预设的“匿名用户”。 | 必须为字段定义有效的 `default` 值。                          |

```python
from django.db import models

# Create your models here.
class Student(models.Model):
    name = models.CharField(max_length=20,db_index=True)
    age = models.IntegerField()
    sex = models.BooleanField(null=True,blank=True,default=None)

    class Meta:
        db_table = 'orm_student'
        verbose_name = '学生信息'
        verbose_name_plural = verbose_name

    def __str__(self):
        return str({"id":self.id, "name":self.name, "age":self.age,"sex":self.sex})

class StudentProfile(models.Model):
    # 一对一 CASCADE 级联删除 DO_NOTHING 互不影响
    student = models.OneToOneField('Student',on_delete=models.CASCADE,related_name='profile')
    description = models.TextField(default='',verbose_name="描述信息")
    address = models.CharField(max_length=500,verbose_name="家庭住址")
    mobile = models.CharField(max_length=15,verbose_name="紧急联系电话")

    class Meta:
        db_table = 'orm_student_profile'
        verbose_name = "学生详细信息"
        verbose_name_plural = verbose_name

    def __str__(self):
        return str({"address":self.address, "mobile":self.mobile})
```

```python
from django.http import JsonResponse
from django.shortcuts import render
from django.views import View

from . import models
# from django. import view
# Create your views here.

class Student1(View):
    def get1(self, request):
    # 添加数据操作
    # 先添加主模型 再添加外键模型
        student = models.Student.objects.create(
            name = "小小",
            age=10,
            sex=True
        )
        models.StudentProfile.objects.create(
            student = student,
            description="44585",
            address="686454",
            mobile="5454455555"
        )
        return JsonResponse({'msg':'添加成功！'})

    def get2(self,request):
        # 从主模型查询到外键模型
        student = models.Student.objects.get(id = 1)
        if student:
            print(student.profile.address)
        # 从外键模型查询到主模型
        profile = models.StudentProfile.objects.get(id = 1)
        if profile:
            print(profile.student.name)
        return JsonResponse({'msg':'查询成功'})

    def get3(self,request):
        student = models.Student.objects.get(name = "小小")
        if student:
            student.profile.address = "新地址"
            student.profile.mobile = "5454455555"
            student.profile.save()
        return JsonResponse({'msg':'1'})

    def get(self, request):
        student = models.Student.objects.get(id = 1)
        if student:
            student.delete()
        return JsonResponse({'msg':'2'})
```

#### 一对多

```python
class Author(models.Model):
    name = models.CharField(max_length=20,db_index=True,verbose_name="姓名")
    age = models.IntegerField(verbose_name="年龄")
    sex = models.BooleanField(null=True,blank=True,default=None,verbose_name="性别")

    class Meta:
        db_table = 'orm_author'
        verbose_name = "作者信息"
        verbose_name_plural = verbose_name

    def __str__(self):
        return str({"id":self.pk ,"name":self.name, "age":self.age})

class Article(models.Model):
    author = models.ForeignKey(Author,on_delete= models.DO_NOTHING,related_name="article_list", verbose_name="作者")
    title = models.CharField(max_length=20,verbose_name="文章标题")
    createdTime = models.DateTimeField(auto_now_add=True)
    updateTime = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orm_article'
        verbose_name = "文章信息"
        verbose_name_plural = verbose_name

    def __str__(self):
        return str({"id":self.pk ,"title":self.title})
```

##### 添加操作

```python
 def get1(self, request):
        # 先添加主模型
        # author = models.Author.objects.create(
        #     name="李白",
        #     age=10,
        #     sex=True
        # )
        #
        # article_list = [
        #     models.Article(title="赠汪伦",author=author),
        #     models.Article(title="将进酒",author_id=author.id)
        # ]
        #
        # models.Article.objects.bulk_create(article_list)

        #作者已存在，添加多篇文章

        # author = models.Author.objects.get(id = 1)
        # if author:
        #     article_list = [
        #         models.Article(title="天生我材必有用",author=author),
        #         models.Article(title="杯莫停",author_id=author.id)
        #     ]
        #     models.Article.objects.bulk_create(article_list)

        models.Article.objects.create(
            title="春蚕到死丝方尽",
            author= models.Author.objects.create(
                name="李商隐",
                age=10,
                sex=True
            )
        )
        return JsonResponse({'msg':'3'})
```

##### 查询操作

```python
 def get(self,request):
        #通过主模型  拿到外键模型
        # query_id = request.GET.get('id')
        # author = models.Author.objects.get(id = query_id)
        # article = author.article_list.all().values()

        #通过主键模型作为条件，直接查询外键模型的数据
        # article_list = models.Article.objects.filter(author_id= query_id).values()

        #通过外键模型 拿到主模型
        # article = models.Article.objects.get(title="赠汪伦")
        # if article:
        #    name = article.author.name
        #    print(name)

        #通过外键模型作为条件  直接查询主键模型的数据
        name = models.Author.objects.get(article_list__title="春蚕到死丝方尽").name
        print(name)
        return  JsonResponse({'msg':'4'})
```

##### 更新操作

```python
    def get(self,request):
        # 把李白所有的文章创建时间改为 2025-05-01 13:00:00
        # author = models.Author.objects.get(name = '李白')
        # for article in author.article_list.all():
        #     article.createdTime = "2025-05-01 13:00:00"
        #     article.save()

        #吧赠汪伦的作者改为汪伦
        author = models.Author.objects.filter(name = '杜甫').first()
        article = models.Article.objects.get(title = "赠汪伦")
        if author and article:
           article.author = author
           article.save()
        else:
            author = models.Author.objects.create(
                name="杜甫",
                age=10,
                sex=True
            )
            article.author = author
            article.save()
        return JsonResponse({'msg':'5'})
```

#### 多对多

```python
#多对多关联以后，在数据迁移时，在数据库中实际上会创建三张表，分别是：2个模型对象实体表，1张关联 2个模型的关系表
class Teacher(models.Model):
    name = models.CharField(max_length=20,db_index=True,verbose_name="姓名")
    age = models.IntegerField(verbose_name="年龄")
    sex = models.BooleanField(null=True,blank=True,default=None,verbose_name="性别")
    class Meta:
        db_table = 'orm_teacher'
        verbose_name = "老师信息"
        verbose_name_plural = verbose_name
    def __str__(self):
        return str({"id":self.pk ,"name":self.name})

class Course(models.Model):
    name = models.CharField(max_length=20,verbose_name="课程名称")
    teacher = models.ManyToManyField(Teacher,related_name="course")
    class Meta:
        db_table = 'orm_course'
        verbose_name = "课程信息"
        verbose_name_plural = verbose_name
    def __str__(self):
        return str({"id":self.pk ,"name":self.name})
```

#### 自关联

自关联就是1张数据表中，主键和外键都在一张表上，一般会在多级部分，多级菜单，多级权限。省市区行政区划，粉丝关注，好友关系，这些业务中使用到。

```python
class Area(models.Model):
    #一对多的自关联
    name = models.CharField(max_length=50)
    parent = models.ForeignKey("self",on_delete=models.SET_NULL,related_name="son_list",null=True,blank=True)
    class Meta:
        db_table = 'orm_area'
        verbose_name = '行政区划表'
        verbose_name_plural = verbose_name
    def __str__(self):
        return str({"id":self.pk ,"name":self.name})

class User(models.Model):
    name = models.CharField(max_length=20,unique=True)
    age = models.IntegerField(default=0)
    friends = models.ManyToManyField("self",symmetrical=True)
    class Meta:
        db_table = 'orm_user'
        verbose_name = "用户信息表"
        verbose_name_plural = verbose_name
    def __str__(self):
        return str({"id":self.pk ,"name":self.name})
```

#### 虚拟外键

在前面所有的关联查询操作中，我们使用的外联手段都是依靠数据库本身维护的物理外键，但是这在一定程度上会增加数据库的运行成本，消耗数据库性能，因为数据量大了之后DB在高并发情况会产生大量锁。所以在外界就存在了相当一部分公司(50%左右)为了追求性能，舍弃了物理外键(就是在数据库建表操作中不再创建外键索引)，改用ORM提供的虚拟外键(逻辑外键)来进行关联查询操作。当然，如果没有数据库本身维护的物理外键，肯定也会存在对数据库一致性的风险。

```
db_constraint=False  表示当前外键使用虚拟外键
db_constraint=True   表示当前外键使用物理外键
```

```python
    student = models.OneToOneField('Student',db_constraint=False,on_delete=models.CASCADE,related_name='profile')
		author = models.ForeignKey(Author,db_constraint=False,on_delete= models.DO_NOTHING,related_name="article_list", verbose_name="作者")
    teacher = models.ManyToManyField(Teacher,db_constraint=False,related_name="course")
```

```python
from django.db import models

# Create your models here.
class Student(models.Model):
    name = models.CharField(max_length=100,verbose_name="姓名")
    class Meta:
        db_table = 'dbw_student'
        verbose_name = '外键学生'
        verbose_name_plural = verbose_name
    def __str__(self):
        return self.name

class StudentDetail(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE,db_constraint=False)
    age = models.IntegerField(verbose_name="年龄")
    address = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    class Meta:
        db_table = 'dbw_student_detail'

    def __str__(self):
        return self.age
```

#### 查询优化

### 模型管理器
