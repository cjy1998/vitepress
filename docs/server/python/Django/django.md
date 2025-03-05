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

 会话控制技术，主要作用是**为了识别和记录用户在web应用中的身份行为和操作历史**

实现会话控制的几种技术类型：

| 特性         | Cookie               | Session                 | Token（如 JWT）          |
| :----------- | :------------------- | :---------------------- | :----------------------- |
| **存储位置** | 客户端（浏览器）     | 服务端                  | 客户端（LocalStorage等） |
| **安全性**   | 依赖 Cookie 安全标志 | 依赖 Session ID 安全性  | 依赖签名/加密机制        |
| **扩展性**   | 适用传统服务         | 服务器需存储会话数据    | 适合分布式系统           |
| **跨域支持** | 需配置 `SameSite` 等 | 依赖 Cookie 或 URL 传递 | 可轻松跨域               |
| **数据大小** | 有大小限制（~4KB）   | 无限制（服务端存储）    | 可较大，但影响请求头大小 |

#### 典型工作流程示例

1. **Cookie + Session**：
   - 用户登录 → 服务器创建 Session → 返回 Session ID 通过 Cookie 存储。
   - 后续请求携带 Session ID → 服务器验证 Session 有效性。
2. **Token（JWT）**：
   - 用户登录 → 服务器生成 JWT（含用户信息） → 返回给客户端。
   - 客户端存储 Token → 后续请求在 `Authorization` 头中携带 Token。
   - 服务器验证签名和过期时间 → 无需查询数据库。

------

#### 如何选择？

- **传统 Web 应用**：Cookie + Session（简单易用）。
- **前后端分离/移动端**：Token（无状态、跨域友好）。
- **高安全性场景**：结合 HTTPS、HttpOnly Cookie 和短期 Token。





## 数据库

### 配置数据库连接

在`settings.py` 中保存了数据库的连接配置信息，Django 默认初始配置使用`sqlite`数据库。

使用Django的数据库操作，主要分为以下步骤：

1. 在`settings.py`配置数据库连接信息。
2. 在目标子应用的`models.py`中定义模型类。
3. 生成数据库迁移文件并执行迁移文件。
4. 通过模型类对象提供的方法或属性完成数据表的增删改查操作。

#### 配置mysql 数据库

1. 安装驱动

   ```python
    pip install PyMySQL
   ```

2. 在django 的主应用目录下的`_init_.py`文件中添加如下语句：

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

- 模型类必须直接或者间接继承于django.db.models.Model类

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



### ORM框架

ORM（Object-Relational Mapping，对象关系映射）是一种编程技术，用于在**面向对象编程语言**和**关系型数据库**之间建立桥梁，让开发者能用面向对象的方式操作数据库，而无需直接编写复杂的 SQL 语句。

------

#### 核心思想

将数据库中的 **表（Table）** 映射为程序中的 **类（Class）**，表中的每一行数据（记录）映射为类的 **对象（Object）**，表中的字段（列）映射为对象的 **属性（Property）**。开发者通过操作对象，间接完成对数据库的增删改查。

------

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

------

#### 常见 ORM 框架

- **Java**: Hibernate、MyBatis（半自动 ORM）、JPA（规范，Hibernate 是其实现）
- **Python**: Django ORM、SQLAlchemy
- **Ruby**: ActiveRecord（Rails 内置）
- **C#**: Entity Framework

------

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

------

#### ORM 适用场景

- **快速开发**：适合 CRUD（增删改查）为主的业务系统（如后台管理、电商平台）。
- **中小型项目**：数据模型相对简单，ORM 能显著提升效率。
- **团队协作**：统一数据操作规范，减少 SQL 风格差异。

------

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

------

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

### 数据库进阶操作

### 关联模型

### 模型管理器

