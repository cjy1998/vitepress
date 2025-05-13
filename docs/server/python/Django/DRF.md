---
outline: deep
---

## Django REST Framework：核心功能和设计原则

### 核心功能

1. Django REST framework 扩展了 Django 的功能，以促进 RESTful API 的创建。DRF 的核心是提供强大的 **序列化和反序列化 (Serialization and Deserialization)** 功能 。序列化器将复杂的数据类型（例如 Django 模型实例和查询集）转换为 JSON 或 XML 等格式，这些格式可以轻松地通过网络传输。相反，反序列化在验证后将传入的数据转换回 Python 对象或模型实例。

2. DRF 引入了 **ViewSet**，它将相关的视图分组到一个类中，从而简化了 CRUD（创建、检索、更新、删除）操作的常见 API 端点的创建 。这些 ViewSet 通常与 **Router** 结合使用，Router 自动为定义的 ViewSet 生成必要的 URL 模式，从而减少了手动 URL 配置的需求 。

3. 对于常见的 API 模式，DRF 提供了 **通用视图和 Mixin (Generic Views and Mixins)** 。这些预构建的视图处理诸如列出对象 (`ListAPIView`)、创建对象 (`CreateAPIView`)、检索单个对象 (`RetrieveAPIView`)、更新对象 (`UpdateAPIView`) 和删除对象 (`DestroyAPIView`) 等任务。Mixin 提供可重用的功能，可以与通用视图结合使用以进一步自定义其行为。

4. 保护 API 的安全至关重要，DRF 提供了一个灵活的 **身份验证和权限 (Authentication and Permissions)** 系统 。它支持各种身份验证方法，包括基于令牌和基于会话的身份验证，并提供一系列权限类来根据用户角色或身份验证状态控制对 API 端点的访问。

5. DRF 在 **内容协商 (Content Negotiation)** 方面表现出色，允许 API 根据客户端的请求支持多种数据格式 。通过检查 HTTP 请求中的 `Accept` 标头，DRF 可以自动以客户端首选的格式（例如 JSON 或 XML）呈现响应。

6. DRF 的一个重要的可用性特性是其 **可浏览的 API (Browsable API)** 。这个自动生成的 Web 界面允许开发人员直接从浏览器轻松检查和交互 API 端点，从而方便了测试和调试。

7. DRF 通过 `Request` 和 `Response` 对象提供了自己的 **请求和响应处理 (Request and Response Handling)** 机制 。`Request` 对象扩展了 Django 的 `HttpRequest`，以提供更灵活的请求解析，包括处理 JSON 数据。`Response` 对象是 Django 的 `TemplateResponse` 的扩展，它处理内容协商以将适当的内容类型返回给客户端。

8. 对于返回大型数据集的 API，DRF 提供了内置的 **分页 (Pagination)** 功能 。这些功能允许开发人员控制向客户端呈现数据的方式，从而提高性能和资源利用率。DRF 还包括 **限流 (Throttling)** 类，以通过限制用户在一定时间内可以发出的请求数量来防止 API 滥用 。

### 设计原则

1. Django REST framework 的设计原则是根据构建 Web API 的特定需求量身定制的。它强烈遵循 **RESTful 架构** 的原则，将数据和功能视为可通过 URL 访问的资源，利用标准的 HTTP 方法（GET、POST、PUT、DELETE），并强调无状态通信 。

2. DRF 通过鼓励开发人员将代码组织成不同的组件（如视图、序列化器和模型）来促进 **关注点分离 (Separation of Concerns)**，每个组件处理特定的职责 。这使得代码库更具模块化和可维护性。**DRY（不要重复自己）** 原则也是 DRF 设计的核心，它通过通用视图、Mixin 和序列化器来鼓励代码重用 。

3. 通常在 DRF 的上下文中提倡 **设计优先方法 (Design-First Approach)**，即在设计后端 API 之前优先考虑前端界面和用户交互 。这确保了 API 有效地满足客户端应用程序的需求。DRF 鼓励 **高效使用 ORM (Efficient Usage of ORM)**，利用 Django 的 ORM 功能高效地与数据库交互，从而减少了手动 SQL 查询的需求 。

4. **强大的身份验证和授权 (Robust Authentication and Authorization)** 在 API 开发中至关重要，DRF 提供了实现对 API 资源的安全访问所需的工具 。实现 **全面的错误处理和验证 (Comprehensive Error Handling and Validation)** 也是一个关键原则，确保数据完整性和一致的 API 响应，并提供适当的错误消息和状态代码 。

5. 为了管理更改并确保向后兼容性，DRF 支持 **API 版本控制 (API Versioning)**，通常通过在 API 端点前加上版本号来实现 。最后，DRF 强调 **代码可读性和可维护性 (Code Readability and Maintainability)**，鼓励开发人员编写清晰、有良好文档记录且易于理解和修改的代码 。

### 处理 Web 请求和响应：Django VS Django REST Framework

- 在标准的 Django 应用程序中，处理 Web 请求的过程始于服务器接收到一个包含请求元数据的 **HttpRequest** 对象，例如标头、方法（GET、POST 等）和任何提交的数据 。然后，Django 通过中间件将此请求路由到 **视图函数 (view function)**，该函数处理请求并通常返回一个 **HttpResponse** 对象 。Django 视图通常渲染 HTML 模板以生成响应的内容 。虽然 Django 当然可以返回 JSON 或 XML 等格式的数据，但这通常涉及手动序列化数据并在 `HttpResponse` 中设置适当的 `Content-Type` 标头 。

- Django REST framework 引入了自己的 **Request** 对象，该对象扩展了 Django 的 `HttpRequest`，为 API 开发提供了增强的功能 。一个关键特性是 `request.data` 属性，它提供了一种统一的方式来访问来自各种请求正文（包括 JSON、表单数据等）的已解析内容，而不管使用的 HTTP 方法（POST、PUT、PATCH）如何 。DRF 还提供了 `request.query_params` 属性，用于轻松访问 URL 查询参数 。
- 类似地，DRF 提供了一个 **Response** 对象，它是 Django 的 `TemplateResponse` 的子类 。与 Django 的 `HttpResponse`（使用渲染的内容实例化）不同，DRF 的 `Response` 使用未渲染的数据进行初始化，该数据可以是任何 Python 原始类型 。然后，DRF 使用 **内容协商 (content negotiation)** 根据请求的 `Accept` 标头和可用的 **Renderer** 类自动确定要返回给客户端的最合适的内容类型 。这意味着单个视图可以以不同的格式（例如 JSON、XML）提供相同的数据，而无需开发人员为每种格式编写条件逻辑。
- DRF 提供了诸如 `@api_view` 装饰器（用于基于函数的视图）和 `APIView` 类（用于基于类的视图）之类的包装器 。这些包装器确保视图接收 DRF 的 `Request` 对象并可以返回 DRF 的 `Response` 对象，从而简化了 API 相关异常的自动内容协商和处理 。与在 Django 中手动处理请求和响应相比，这种抽象简化了构建 API 端点的过程。

| 功能     | Django                           | DRF                                               |
| -------- | -------------------------------- | ------------------------------------------------- |
| 请求对象 | HttpRequest                      | `Request` (扩展 `HttpRequest`)                    |
| 响应对象 | HttpResponse`, `TemplateResponse | `Response` (扩展 `TemplateResponse`)，带内容协商  |
| 数据处理 | request.POST`, `request.FILES    | request.data`(处理各种格式),`request.query_params |
| 响应格式 | 通常为 HTML，手动处理 JSON/XML   | 自动内容协商 (JSON, XML 等)                       |
| 主要用途 | 构建全栈 Web 应用程序            | 构建 RESTful API                                  |

### 数据序列化和反序列化

DRF 中的序列化器用于序列化 API 响应的数据和反序列化来自 API 请求的传入数据。在序列化时，使用模型实例或查询集创建序列化器实例，访问 `.data` 属性会返回序列化后的表示形式（例如，可以轻松转换为 JSON 的 Python 字典）。对于反序列化，使用传入的数据（例如，来自 `request.data`）实例化序列化器，并调用 `.is_valid()` 方法执行验证 。如果数据有效，则可以使用 `.save()` 方法创建新的模型实例或更新现有的模型实例 。

DRF 还提供了 **ModelSerializer** 类，它作为创建直接链接到 Django 模型的序列化器的快捷方式 。`ModelSerializer` 根据模型的定义自动生成一组字段和默认验证器，从而显着减少了样板代码 。例如，为具有 `title`、`author` 和 `publication_date` 字段的 `Book` 模型创建 `ModelSerializer` 将需要最少的代码 。

DRF 序列化器还支持 **字段级和对象级验证 (field-level and object-level validation)**，允许实现自定义验证逻辑以确保数据完整性 。`SerializerMethodField` 通过在序列化器上定义一个方法，可以将自定义的只读字段添加到序列化输出中 。此外，DRF 提供了各种用于不同数据类型的序列化器字段，包括 `CharField`、`IntegerField`、`EmailField` 和 `HyperlinkedRelatedField`，用于使用超链接表示模型之间的关系 。不同类型的关联字段，如 `PrimaryKeyRelatedField`、`SlugRelatedField` 和 `StringRelatedField`，提供了各种序列化关系的方法 。

### Django REST Framework 中的内容协商

**内容协商 (content negotiation)** 是构建灵活且可互操作的 API 的关键方面。它是服务器和客户端就交换的数据格式达成一致的过程 。Django REST framework 根据客户端 HTTP 请求中的 `Accept` 标头和服务器配置的 **Renderer** 类自动处理内容协商 。

当客户端发送请求时，`Accept` 标头指示客户端可以处理的首选内容类型（例如，`application/json`、`application/xml`、`text/html`）。DRF 检查此标头并将其与为视图配置的可用渲染器列表进行比较 。`Accept` 标头中更具体的媒体类型具有更高的优先级 。例如，如果客户端发送 `Accept: application/json; indent=4, application/json, */*`，DRF 将优先选择支持缩进的 JSON 渲染器。

DRF 为常见格式提供了默认的渲染器，例如 `JSONRenderer` 和 `BrowsableAPIRenderer`（它生成可浏览 API 的 HTML）。开发人员还可以配置额外的渲染器，例如 `XMLRenderer`，以支持其他格式。内容协商过程确保服务器以客户端理解的格式响应，而无需在 URL 中显式指定格式（尽管 DRF 也支持格式后缀）。

### 常用的 DRF API 及其示例

- 序列器

  `ModelSerializer` 示例

```python
# models.py
from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    publication_date = models.DateField()

    def __str__(self):
        return self.title

# serializers.py
from rest_framework import serializers
from .models import Book

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'publication_date']

# 视图中的示例用法
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Book
from .serializers import BookSerializer

class BookListView(APIView):
    def get(self, request):
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
```

`BookSerializer` 自动包含与模型的属性对应的字段。该视图使用此序列化器来检索和列出所有书籍，以及从请求数据创建新的书籍条目 。

- 自定义 `Serializer` 示例

  ```python
  # serializers.py
  from rest_framework import serializers

  class RegistrationSerializer(serializers.Serializer):
      username = serializers.CharField(max_length=150)
      email = serializers.EmailField()
      password = serializers.CharField(write_only=True, min_length=8)
      confirm_password = serializers.CharField(write_only=True, min_length=8)

      def validate(self, data):
          if data['password'] != data['confirm_password']:
              raise serializers.ValidationError("Passwords do not match.")
          return data

      def create(self, validated_data):
          # 创建用户的自定义逻辑
          user = User.objects.create_user(
              username=validated_data['username'],
              email=validated_data['email'],
              password=validated_data['password']
          )
          return user

  # 视图中的示例用法
  from django.contrib.auth.models import User
  from rest_framework.response import Response
  from rest_framework.views import APIView
  from .serializers import RegistrationSerializer

  class RegistrationView(APIView):
      def post(self, request):
          serializer = RegistrationSerializer(data=request.data)
          if serializer.is_valid():
              user = serializer.save()
              return Response({'message': 'User registered successfully.'}, status=201)
          return Response(serializer.errors, status=400)
  ```

  此示例展示了一个用于用户注册的自定义 `Serializer` 。它包含用户名、电子邮件、密码和确认密码的字段。`validate` 方法实现了自定义验证以确保密码匹配，`create` 方法定义了如何创建新的用户对象。

- ViewSet

  `ModelViewSet` 示例

  ```python
  # views.py
  from rest_framework import viewsets
  from .models import Book
  from .serializers import BookSerializer

  class BookViewSet(viewsets.ModelViewSet):
      queryset = Book.objects.all()
      serializer_class = BookSerializer

  # urls.py
  from rest_framework import routers
  from .views import BookViewSet

  router = routers.DefaultRouter()
  router.register(r'books', BookViewSet)

  urlpatterns = router.urls
  ```

  `Book` 模型创建了一个 `ModelViewSet` 。`ModelViewSet` 自动为所有标准的 CRUD 操作提供实现。`DefaultRouter` 将 `BookViewSet` 注册在 `/books/` 端点下，生成用于列出、创建、检索、更新和删除书籍的 URL。

  `ReadOnlyModelViewSet` 示例

  ```python
  # views.py
  from rest_framework import viewsets
  from .models import Book
  from .serializers import BookSerializer

  class BookReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
      queryset = Book.objects.all()
      serializer_class = BookSerializer

  # urls.py
  from rest_framework import routers
  from .views import BookReadOnlyViewSet

  router = routers.DefaultRouter()
  router.register(r'books', BookReadOnlyViewSet)

  urlpatterns = router.urls
  ```

  它仅提供只读操作：列出和检索书籍。

- 通用视图

  `ListCreateAPIView` 示例

```python
# views.py
from rest_framework import generics
from .models import Book
from .serializers import BookSerializer

class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
```

使用 `ListCreateAPIView` 通用视图来处理列出所有书籍（GET 请求）和创建新书籍（POST 请求）。

`RetrieveUpdateDestroyAPIView` 示例

```python
# views.py
from rest_framework import generics
from .models import Book
from .serializers import BookSerializer

class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
```

`RetrieveUpdateDestroyAPIView` 通用视图提供了用于根据 URL 参数（例如，`/books/1/`）检索特定书籍（GET 请求）、更新书籍（PUT 或 PATCH 请求）和删除书籍（DELETE 请求）的端点 。

- 权限

  `IsAuthenticated` 示例

  ```python
  # views.py
  from rest_framework import viewsets, permissions
  from .models import Book
  from .serializers import BookSerializer

  class BookViewSet(viewsets.ModelViewSet):
      queryset = Book.objects.all()
      serializer_class = BookSerializer
      permission_classes = [permissions.IsAuthenticated]
  ```

  将 `IsAuthenticated` 权限类应用于 `BookViewSet` 可确保只有经过身份验证的用户才能访问此 ViewSet 提供的 API 端点 。

  `自定义权限类`示例

  ```python
  # permissions.py
  from rest_framework import permissions

  class IsAdminUserOrReadOnly(permissions.BasePermission):
      def has_permission(self, request, view):
          if request.method in permissions.SAFE_METHODS:
              return True
          return request.user and request.user.is_staff

  # views.py
  from rest_framework import viewsets
  from .models import Book
  from .serializers import BookSerializer
  from .permissions import IsAdminUserOrReadOnly

  class BookViewSet(viewsets.ModelViewSet):
      queryset = Book.objects.all()
      serializer_class = BookSerializer
      permission_classes =
  ```

  此示例创建了一个自定义权限类 `IsAdminUserOrReadOnly`，该类允许所有用户进行只读访问，但将修改（POST、PUT、DELETE）限制为仅限管理员用户 。

- 身份验证

  `TokenAuthentication` 示例

  要使用 `TokenAuthentication`，需要将其添加到 Django 设置文件中的 `DEFAULT_AUTHENTICATION_CLASSES` 中：

  ```python
  # settings.py
  REST_FRAMEWORK = {
      'DEFAULT_AUTHENTICATION_CLASSES':,
  }
  ```

  然后，用户可以生成令牌，这些令牌可以包含在 API 请求的 `Authorization` 标头中（例如，`Authorization: Token YOUR_TOKEN`）以进行身份验证 。

 `SessionAuthentication` 示例

 `SessionAuthentication` 使用 Django 的内置会话管理 。如果用户已登录到 Django 管理后台或使用 Django 的身份验证的 Web 应用程序，则可以使用他们的会话来验证来自同一浏览器的 API 请求。

- ### 路由

  `SimpleRouter` 和 `DefaultRouter` 示例

  ```python
  # urls.py
  from rest_framework import routers
  from .views import BookViewSet, AuthorViewSet # 假设 AuthorViewSet 存在

  router = routers.SimpleRouter()
  router.register(r'books', BookViewSet, basename='book')
  router.register(r'authors', AuthorViewSet, basename='author')

  # urlpatterns = router.urls

  router = routers.DefaultRouter()
  router.register(r'books', BookViewSet, basename='book')
  router.register(r'authors', AuthorViewSet, basename='author')

  urlpatterns = router.urls
  ```

  `SimpleRouter` 为注册的 ViewSet 生成基本的 URL 模式（例如，`/books/`、`/books/{pk}/`）。`DefaultRouter` 扩展了 `SimpleRouter`，还生成一个根 API 端点，该端点显示所有可用 API 端点的列表 。`basename` 参数用于帮助生成唯一的 URL 名称。

- #### 解析器

  DRF 使用解析器来理解请求正文的内容。常见的解析器包括用于处理 JSON 数据的 `JSONParser`、用于标准 HTML 表单数据的 `FormParser` 和用于处理文件上传的 `MultiPartParser` 。默认解析器可以在设置中全局配置，也可以使用 `parser_classes` 属性按视图配置。

- #### 渲染器

 渲染器被 DRF 用来将 API 响应格式化为特定的内容类型。常见的渲染器包括 `JSONRenderer`、`BrowsableAPIRenderer` 和 `XMLRenderer` 。与解析器类似，默认渲染器可以在设置中设置，并且可以使用 `renderer_classes` 属性定义特定于视图的渲染器。



| API 名称 | 主要功能                                                     | 关键类/装饰器                                                       | 示例用例                                                     |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| 序列化器 | 将数据转换为 JSON 等格式/从 JSON 等格式转换数据；执行验证。  | Serializer`,`ModelSerializer`, `SerializerMethodField               | 定义模型数据在 API 中的表示方式以及验证传入数据。            |
| ViewSet  | 将 CRUD 操作的相关视图分组到一个类中。                       | ViewSet`, `ModelViewSet`, `ReadOnlyModelViewSet                     | 为管理特定资源（例如，书籍）创建一组 API 端点。              |
| 通用视图 | 为常见的 API 模式（列表、创建、检索等）提供预构建的视图。    | `ListCreateAPIView`, `RetrieveUpdateDestroyAPIView` 等              | 快速创建标准操作的 API 端点，而无需编写大量样板代码。        |
| 权限     | 根据身份验证和授权控制对 API 端点的访问。                    | IsAuthenticated`, `AllowAny`, `IsAdminUser`, `BasePermission        | 将对某些 API 端点的访问限制为已登录用户或管理员。            |
| 身份验证 | 识别发出 API 请求的用户。                                    | TokenAuthentication`, `SessionAuthentication`, `BasicAuthentication | 通过要求用户在访问 API 端点之前进行身份验证来保护 API 端点。 |
| 路由     | 自动为 ViewSet 生成 URL 模式。                               | SimpleRouter`, `DefaultRouter                                       | 简化基于 ViewSet 的 API 端点的 URL 配置。                    |
| 解析器   | 处理不同的请求内容类型（例如，JSON、表单数据）。             | JSONParser`, `FormParser`, `MultiPartParser                         | 使 API 能够接收来自客户端请求的各种格式的数据。              |
| 渲染器   | 将 API 响应格式化为不同的内容类型（例如，JSON、HTML、XML）。 | JSONRenderer`, `BrowsableAPIRenderer`, `XMLRenderer                 | 允许 API 根据内容协商以客户端可以理解的格式响应数据。        |

### 序列化的使用

```python
from django.db import models

# Create your models here.
class BookInfo(models.Model):
    name = models.CharField(max_length=100,verbose_name="名称")
    pub_data = models.DateField(verbose_name="发布时间",null=True)
    readcount = models.IntegerField(default=0,verbose_name="阅读量")
    commentcount = models.IntegerField(default=0,verbose_name="评论量")
    is_delete = models.BooleanField(default=False,verbose_name="逻辑删除")
    image = models.ImageField(upload_to="book",null=True,verbose_name="照片")

    class Meta:
        db_table = 'book_info'
        verbose_name = '图书'

    def __str__(self):
        return self.name

class PeopleInfo(models.Model):
    name = models.CharField(max_length=100,verbose_name="名称")
    password = models.CharField(max_length=20,verbose_name="密码")
    description = models.CharField(max_length=200,null=True,verbose_name="描述信息")
    book = models.ForeignKey(BookInfo,related_name="people",on_delete=models.CASCADE,verbose_name='图书')
    is_delete = models.BooleanField(default=False,verbose_name="逻辑删除")

    class Meta:
        db_table = 'peopleinfo'
        verbose_name = "人物信息"

    def __str__(self):
        return self.name
```

```python
# 序列化器
'''
将模型对象转化为字典/json
'''

from rest_framework import serializers

from book.models import BookInfo

class PeopleForeignKeySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=100)
#声明关于模型的序列化器类
class BookSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    pub_data = serializers.DateField()
    readcount = serializers.IntegerField()
    commentcount = serializers.IntegerField()
    people = PeopleForeignKeySerializer(many=True)
    # author = serializers.StringRelatedField()
class PeopleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=100)
    #声明外键字段
    '''
    序列化外键的第一种方式 IntegerField
        序列化器中的字段名必须和数据库中的字段名保持一致
    序列化外键的第二种方式 PrimaryKeyRelatedField
        queryset 将被用作反序列化时参数的校验
        read_only=True 该字段不能用作反序列化使用
    序列化外键的第三种方式 StringRelatedField
        返回外键中的字符串 这里的值对应的是模型类中的def __str__(self):  的返回值
    序列化外键的第四种方式 BookSerializer()
        序列化外键对应模型的所有序列化数据
    '''
    book_id = serializers.IntegerField()
    '''
     通过模型类字段名称声明序列化器字段名
     在验证参数时，通过queryset告诉 drf 当前的这个外键字段需要关联到哪个模型
    '''
    # book = serializers.PrimaryKeyRelatedField(queryset=BookInfo.objects.all())
    # book = serializers.PrimaryKeyRelatedField(read_only=True)
    '''
    返回外键中的字符串 这里的值对应的是模型类中的def __str__(self):  的返回值
    '''
    # book = serializers.StringRelatedField()
    '''
     返回外键对应模型的所有数据
    '''
    book = BookSerializer()
```

### 反序列化的使用

```python
  def post(self, request):
        json_data = request.body
        book_dict = json.loads(json_data)
        try:
            serializer = BookSerializer(data=book_dict)
            serializer.is_valid(raise_exception=True)  # 自动抛出验证错误
            # serializer.save()  # 使用序列化器保存数据，避免手动创建对象
            return JsonResponse(serializer.data, status=201, safe=False)
        except serializers.ValidationError as e:
            # 返回详细的验证错误信息
            return JsonResponse({'error': e.detail}, status=400)
        except Exception as e:
            print('eee',e)
```

#### 反序列化验证数据

基本验证

```python
class BookSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    name = serializers.CharField(max_length=100)
    pub_data = serializers.DateField()
    readcount = serializers.IntegerField(required=False)
    commentcount = serializers.IntegerField(required=False)
    people = PeopleForeignKeySerializer(many=True,required=False)
```

单个字段验证

```python
class BookSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    name = serializers.CharField(max_length=100)
    pub_data = serializers.DateField()
    readcount = serializers.IntegerField(required=False)
    commentcount = serializers.IntegerField(required=False)
    people = PeopleForeignKeySerializer(many=True,required=False)
    def validate_readcount(self, value):
        if value < 0:
            raise serializers.ValidationError('阅读量不能为负数')
        return value
   
```

多个字段验证

```python
 def validate(self, attrs):
        readcount = attrs.get('readcount')
        commentcount = attrs.get('commentcount')
        if commentcount > readcount:
            raise serializers.ValidationError('评论量不能大于阅读量')
        return attrs
```



#### 保存、更新数据

保存数据

```python
 # views.py
  def post(self, request):
        json_data = request.body
        book_dict = json.loads(json_data)
        try:
            serializer = BookSerializer(data=book_dict)
            serializer.is_valid(raise_exception=True)  # 自动抛出验证错误
            serializer.save()  # 使用序列化器保存数据，避免手动创建对象
            return JsonResponse(serializer.data, status=201, safe=False)
        except serializers.ValidationError as e:
            # 返回详细的验证错误信息
            return JsonResponse({'error': e.detail}, status=400)
        except Exception as e:
            print('eee',e)
```

```python
# 序列化器
class BookSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    name = serializers.CharField(max_length=100)
    pub_data = serializers.DateField()
    readcount = serializers.IntegerField(required=False)
    commentcount = serializers.IntegerField(required=False)
    people = PeopleForeignKeySerializer(many=True,required=False)
    # author = serializers.StringRelatedField()
    def validate_readcount(self, value):
        if value < 0:
            raise serializers.ValidationError('阅读量不能为负数')
        return value
    def validate(self, attrs):
        readcount = attrs.get('readcount')
        commentcount = attrs.get('commentcount')
        if commentcount > readcount:
            raise serializers.ValidationError('评论量不能大于阅读量')
        return attrs
    def create(self, validated_data):
        return BookInfo.objects.create(**validated_data)
```

更新

```python
 def put(self,request,pk):
        json_data = request.body
        book_dict = json.loads(json_data)
        try:
            book = models.BookInfo.objects.get(id=pk)
            serializer = BookSerializer(instance=book, data=book_dict)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        except models.BookInfo.DoesNotExist:
            return JsonResponse({},status=404)
```

```python
 def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        # instance.description = validated_data.get('description', instance.description)
        instance.pub_data = validated_data.get('pub_data', instance.pub_data)
        instance.readcount = validated_data.get('readcount', instance.readcount)
        instance.commentcount = validated_data.get('commentcount', instance.commentcount)
        instance.save()
        return instance
```

### 模型类序列化器

`ModelSerializer`提供了一种快捷方式，可以自动创建一个`Serializer`具有与模型字段相对应的字段的类。

- 将根据模型自动为您生成一组字段。
- 将自动为序列化器生成验证器，例如 unique_together 验证器。
- 默认实现`.create()` `.update()`

```python
#serializers.py
class BookModelSerializer(serializers.ModelSerializer):
    #如果当前模型类的字段约束不能满足当前业务，可以再此处进行字段重写
    readcount =serializers.IntegerField(required=True)    
    class Meta:
            model = BookInfo
            fields = '__all__'
          #显示部分字段
            #fields = ('id', 'name', 'pub_data')
          # 取反  把字段排除在外
            #exclude = ('is_delete','pub_data')
          # 只读字段 即仅用于序列化输出的字段
            read_only_fields = ('id',)
          #字段约束
            extra_kwargs = {
                "name":{
                    "min_length":5,
                },
              # 在序列化时不显示当前字段
                'password': {'write_only': True}
            }
```

```python
#views.py
class BookModelView(ModelViewSet):
    queryset = models.BookInfo.objects.all()
    serializer_class = BookModelSerializer
```

```python
#urls.py
router = DefaultRouter()
router.register('bookModel', BookModelView)
urlpatterns = [
    path('',include(router.urls))
]
```

#### 序列化器嵌套序列化器保存字典数据

```python
from rest_framework import serializers
from books.models import BookInfo,PeopleInfo


class PeopleSerializer(serializers.ModelSerializer):
    book_id = serializers.IntegerField(required=False)

    class Meta:
        model = PeopleInfo
        fields = ['id','name','password','description','book_id']
        extra_kwargs = {
            'password': {'write_only': True},
        }


class BookSerializer(serializers.ModelSerializer):
    # 添加反向关联字段
    people = PeopleSerializer(many=True)
    # 将数据拆分  先保存图书信息 再保存人物信息
    def create(self, validated_data):
        peoples = validated_data.pop('people')
        book = BookInfo.objects.create(**validated_data)
        for people in peoples:
            PeopleInfo.objects.create(book=book,**people)
        return book
    class Meta:
        model = BookInfo
        exclude = ('is_delete',)
```

### 视图

#### 1.基础视图 `APIView`

DRF 的基础视图类，继承自 Django 的 `View`，但增加了对请求解析、响应渲染、权限校验等功能的支持。

- **特点**：
  - 需要手动实现 `get()`, `post()`, `put()`, `delete()` 等方法。
  - 支持基于类的视图装饰器（如 `@throttle_classes`）。

- **适用场景**：需要完全自定义逻辑的简单 API。

- 示例：

  ```python
  from rest_framework.views import APIView
  from rest_framework.response import Response
  
  class MyView(APIView):
      def get(self, request):
          return Response({"message": "Hello World"})
  ```

#### 2.通用视图 `Generic Views`

DRF 提供了一系列通用视图类，封装了常见的 CRUD 操作逻辑，适合快速开发标准化的 API。

1.**`GenericAPIView`**

继承自 `APIView`，添加了对查询集（`queryset`）和序列化器（`serializer_class`）的支持。

- **核心功能**：

  - `get_queryset()`：获取数据查询集。

  - `get_serializer()`：获取序列化器实例。

  - `get_object()`：获取单个对象（用于详情视图）。

    ```python
    class BookDetailView(GenericAPIView):
        queryset = BookInfo.objects.all()
        serializer_class = BookSerializer
        lookup_field = 'name'
        def get(self, request, name):
            book = self.get_object()
            ser = self.get_serializer(book)
            return Response(ser.data)
     #url
     path('book/<str:name>',BookDetailView.as_view())
    ```

    

- **需要配合 Mixin 使用**（如 `ListModelMixin`, `CreateModelMixin`）。

- 示例：

  ```python
  class Generic(GenericAPIView):
      queryset = BookInfo.objects.all()
      serializer_class = BookSerializer
      def get(self, request):
          book = self.get_queryset()
          ser = self.get_serializer(book,many=True)
          return Response(ser.data)
      def post(self, request):
          book = request.data
          ser = self.get_serializer(data=book)
          if ser.is_valid(raise_exception=True):
              ser.save()
              return Response(ser.data)
          else:
              return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
  ```

2.**Mixin 类**

- `ListModelMixin`：提供 `list()` 方法，用于处理 GET 请求返回列表。

  ```python
  class GenericAndMixin(ListModelMixin,GenericAPIView):
      queryset = BookInfo.objects.all()
      serializer_class = BookSerializer
      def get(self, request):
          return self.list(request)
  ```

- `CreateModelMixin`：提供 `create()` 方法，处理 POST 请求创建对象。

- `RetrieveModelMixin`：提供 `retrieve()` 方法，处理 GET 请求返回单个对象。

- `UpdateModelMixin`：提供 `update()` 方法，处理 PUT/PATCH 请求。

- `DestroyModelMixin`：提供 `destroy()` 方法，处理 DELETE 请求。

3.**组合通用视图**

DRF 将 `GenericAPIView` 和 Mixin 组合成以下常用类：

- `ListAPIView`：仅支持 GET 列表（`ListModelMixin` + `GenericAPIView`）。
- `RetrieveAPIView`：仅支持 GET 单个对象。
- `CreateAPIView`：仅支持 POST。
- `UpdateAPIView`：仅支持 PUT/PATCH。
- `DestroyAPIView`：仅支持 DELETE。
- `ListCreateAPIView`：支持 GET 列表 + POST。
- `RetrieveUpdateAPIView`：支持 GET + PUT/PATCH。
- `RetrieveDestroyAPIView`：支持 GET + DELETE。
- `RetrieveUpdateDestroyAPIView`：支持 GET + PUT/PATCH + DELETE。

示例：

```python
from rest_framework.generics import ListCreateAPIView
from .models import Book
from .serializers import BookSerializer

class BookListCreateView(ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
```

### 视图集

#### 1.**`ModelViewSet`**

提供完整的CRUD操作（`list`, `create`, `retrieve`, `update`, `destroy`），需指定`queryset`和`serializer_class`。

```python
class BooksView(ModelViewSet):
    queryset = BookInfo.objects.all()
    serializer_class = BookSerializer
```

```python
router = DefaultRouter()
'''
prefix  路由前缀
viewset 视图集
basename 路由别名
'''
router.register('books',BooksView)
router.register('people',PeopleInfoView)
urlpatterns = [
    path('',include(router.urls)),
    path('generic/',Generic.as_view()),
]
```

#### 2.**`ReadOnlyModelViewSet`**

仅支持只读操作（`list`和`retrieve`），适用于数据展示场景。

#### 3.**`GenericViewSet`**

基础类，不包含默认动作，需结合**混入类（Mixins）**（如`CreateModelMixin`）或自定义方法实现功能。

#### 4.与路由器配合

使用`SimpleRouter`或`DefaultRouter`，自动将视图集动作映射到URL，例如：

- `list` → `GET /资源/`
- `create` → `POST /资源/`
- `retrieve` → `GET /资源/{id}/`

#### 5.自定义动作

**`@action`装饰器**

扩展非标准操作，例如添加`激活用户`：

```python
from rest_framework.decorators import action
class UserViewSet(ModelViewSet):
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        # 自定义逻辑
```

- 生成URL：`/users/{id}/activate/`。
- 参数：`detail`（是否针对单个对象）、`methods`（支持的HTTP方法）。

#### 6.混入类

- 提供可组合的动作方法，灵活构建视图集：
  - `CreateModelMixin` → 实现`create`。
  - `ListModelMixin` → 实现`list`。
  - 其他如`RetrieveModelMixin`、`UpdateModelMixin`等。

#### 7.配置选项

- **权限控制**：通过`permission_classes`设置访问策略。
- **分页与过滤**：使用`pagination_class`、`filter_backends`等属性集成分页或过滤（如DjangoFilterBackend）。
- **自定义查询集/序列化器**：重写`get_queryset()`或`get_serializer_class()`方法。
