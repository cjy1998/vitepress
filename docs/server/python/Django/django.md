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

#### 多对多

#### 虚拟外键

#### 查询优化

### 模型管理器
