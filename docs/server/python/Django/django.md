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

   `headers`简化了 HTTP 头访问，而`META`提供更底层的元数据。

4. 上传文件
