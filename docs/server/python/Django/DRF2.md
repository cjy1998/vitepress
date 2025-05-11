- 快速上手
- 请求的封装
- 版本管理
- 认证
- 权限
- 限流
- 序列化 (源码未学习)
- 视图
- 条件搜索
- 分页
- 路由
- 解析器

## 1. 快速上手

- 安装

```python
 pip install djangorestframework
```

- 配置
  - 注册 APP: 在 `settings.py `中的 INSTALLED_APPS 列表里添加 `'rest_framework'`。
  - 配置字典: 在 `settings.py` 中添加 `REST_FRAMEWORK = {} `字典，用于后续添加 DRF 相关配置。
- URL 和视图
  - URL 定义: 与 Django 的 CBV 类似，通过 path 函数将 URL 与视图类关联。
  - 视图类继承: 视图类需继承自 rest_framework.views.APIView 而不是 Django 的 View。
  - 返回值: 使用 rest_framework.response.Response 返回响应，而不是 Django 的 JsonResponse。
    drf 中重写了`as_view`和`dispatch`方法：
  - `as_view`免除了`csrf`验证，一般前后端分离不会使用`csrf token`认证（后期会使用 jwt 认证）。
  - `dispatch`内部添加了版本处理、认证、权限、访问频率限制等功能。

## 2. 请求的封装

- 封装本质：DRF 框架对 Django 原生 request 对象进行了二次封装，创建了 rest_framework.request.Request 类的新对象
- 封装内容：
  - 包含原始 Django 的 request 对象（通过\_request 属性访问）
  - 新增了认证器、解析器等组件
  - 提供了更便捷的数据访问方式
- 访问方式对比： - Django 原生：直接通过 request.method/GET/POST 访问 - DRF 封装： - 原始数据：request.\_request.method/GET/POST - 新方式：request.query_params/data
  **源码分析**
- 初始化流程
  - 请求进入 APIView.dispatch 方法
    - 调用 initialize_request 方法封装请求
    - 返回包含原始 request 和新组件的 Request 对象
- 关键源码

```python
	def initialize_request(self, request, *args, ​**​kwargs):
	    return Request(
	        request,  # 原始Django request
	        parsers=self.get_parsers(),
	        authenticators=self.get_authenticators(),
	        negotiator=self.get_content_negotiator(),
	        parser_context=parser_context
	    )
```

- `__getattr__`实现

```python
	def __getattr__(self, attr):
	    try:
	        return getattr(self._request, attr)  # 委托给原始request
	    except AttributeError:
	        return self.__getattribute__(attr)
```

当访问 DRF request 不存在的属性时，自动尝试从原始 Django request 中获取，实现了对原生 request 方法的无缝兼容。

## 3. 版本管理

drf 框架中支持 5 种版本管理：

1. URL 的 GET 参数传递

```python
 class UserView(APIView):
	  versioning_class = QueryParameterVersioning
	  def get(self,request):
		  print(request.version)
```

- 实现方式：在视图类中设置`versioning_class = QueryParameterVersioning`，通过 URL 问号传参形式传递版本，如`/api/users/?version=v1`
- 获取版本：在视图方法中直接使用 request.version 即可获取传入的版本值
- 参数配置，在`settings.py`中的`REST_FRAMEWORK`配置：
  - 默认参数名为 version，可通过`VERSION_PARAM`配置修改
  - 设置默认版本：`DEFAULT_VERSION = "v1"`
  - 限制允许版本：`ALLOWED_VERSIONS = ["v1","v2","v3"]`
  - 可在`settings.py`中配置`DEFAULT_VERSIONING_CLASS`实现全局版本控制，避免每个视图类重复配置。

```python
		REST_FRAMEWORK = {
		    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.QueryParameterVersioning',
		}
```

2.  URL 路径传递

```python
	 #urls.py
	 urlpatterns = [
		path('api/<str:version>/users/',views.UserView.as_view())
		 ]
	 #views.py
	 class UserView(APIView)
	 #或在 settings.py中配置
		 versioning_class = URLPathVersioning
```

3. 请求头传递
   `versioning_class = AcceptHeaderVersioning`
4. 二级域名传递
   `versioning_class = HostNameVersioning`
5. 路由的`namespace`传递
   `versioning_class = NamespaceVersioning`

```python
	  urlpatterns = [
		path('api/v1/',include('user.urls',namespace='v1'))
		 ]
```

### 过滤

1.  简单过滤

    ```python
    class GoodsListView(ReadOnlyModelViewSet):
        # queryset = Goods.objects.all()
        def get_queryset(self):
            return Goods.objects.filter(shop_price__gt=100)
        serializer_class = GoodsSerializer
        pagination_class = GoodsPagination
    ```

    ```python
    router = DefaultRouter()
    router.register('goods', GoodsListView,basename='goods')
    urlpatterns = [
        # ...
        path('', include(router.urls)),
    ]
    ```

    `basename`- 用于创建 URL 名称的基名称。如果未设置，则基名称将根据`queryset`视图集的属性（如果有）自动生成。请注意，如果视图集不包含`queryset`属性，则必须`basename`在注册视图集时设置。

2.  `django_filters`

    - 配置

      ```python
      INSTALLED_APPS = [
      	    'crispy_forms',
      	    "crispy_tailwind",
      	    'django_filters',
      	]
      	CRISPY_ALLOWED_TEMPLATE_PACKS = "tailwind"

      	CRISPY_TEMPLATE_PACK = "tailwind"
      ```

    - 简单使用
      ```python
      from django_filters.rest_framework import DjangoFilterBackend
      class GoodsListView(ReadOnlyModelViewSet):
          queryset = Goods.objects.all()
          pagination_class = GoodsPagination
          filter_backends = [DjangoFilterBackend]
          filterset_fields = ['name', 'shop_price']
      ```
    - 自定义过滤器

      ```python
      	#新建 filters.py文件
      	from django_filters import rest_framework as filters

      	from goods.models import Goods


      	class GoodsFilter(filters.FilterSet):
      	    """
      	    商品的过滤类
      	    """    min_price = filters.NumberFilter(field_name="shop_price", lookup_expr='gte')
      	    max_price = filters.NumberFilter(field_name="shop_price", lookup_expr='lte')
      	    #icontains  i代表不区分大小写 contains代表包含
      	    name = filters.CharFilter(field_name="name", lookup_expr='icontains')

      	    class Meta:
      	        model = Goods
      	        fields = ['min_price', 'max_price', 'name']
      ```

      ```python
      class GoodsListView(ReadOnlyModelViewSet):
      	...
      	filter_backends = [DjangoFilterBackend]
      	filterset_class = GoodsFilter  # 过滤类
      	...
      ```

3.  SearchFilter
    默认情况下，搜索将`使用不区分区大小写的部分匹配`。搜索参数可以包含多个搜索词，应将其用空格或逗号分隔。如果使用多个搜索词，则仅当所有提供的词都匹配时，对象才会在列表中返回。
    可以通过再前面加上各种字符来限制搜索行为： - '^' 以什么开头进行搜索 - '='完全匹配 - '@'全文搜索 - '$'正则表达式搜索 - 还可以使用查找 API 双下划线符号对 ForeignKey 或 ManyToManyField 执行相关查找

```python
filter_backends = [filters.SearchFilter]
search_fields = ['username', 'email', 'profile__profession']
search_fields = ['=name']
```

4. OrderingFilter

```python
	filter_backends =  [filters.OrderingFilter]
	ordering_fields = ['sold_num','shop_price','add_time']
```

## 4. 认证

1. 认证类的定义及使用

```python
	import uuid
	from rest_framework.authentication import  BaseAuthentication
	from rest_framework.exceptions import AuthenticationFailed
	from rest_framework.response import Response
	from rest_framework.views import APIView

	from authtest import models
	# Create your views here.
	class AuthTestView(APIView):
	    def post(self, request):
	        username = request.data.get('username')
	        password = request.data.get('password')
	        user_object = models.AuthtestUser.objects.filter(username=username, password=password).first()
	        if not user_object:
	            return Response({"code": 1001, "error": "用户名或密码错误"})
	        token = str(uuid.uuid4())
	        user_object.token = token
	        user_object.save()
	        return Response({"code": 200, "token": token})
	class TokenAuthentication(BaseAuthentication):
	    def authenticate(self, request):
	        print(request.query_params.get('token'))
	        token = request.query_params.get('token')

	        if not token:
	            raise  AuthenticationFailed({"code": 1002,"data":"认证失败"})
	        user = models.AuthtestUser.objects.filter(token=token).first()
	        print(user)
	        if not user:
	            raise AuthenticationFailed({"code": 1002,"data":"认证失败"})
	        ## 返回的两个值  在源码中分别赋值给了request.user、request.auth
	        return user, token
	    def authenticate_header(self, request):
	        return 'Token'

	class orderView(APIView):
	    authentication_classes = [TokenAuthentication,]
	    def get(self, request):
	        return Response({"code": 200, "data": "订单列表"})
	class userView(APIView):
	    authentication_classes = [TokenAuthentication,]
	    def get(self, request):
	        return Response({"code": 200, "data": "用户列表"})
```

2. 认证类的配置
   - 局部配置
     在需要认证的视图类中添加类变量：`authentication_classes = [TokenAuthentication]`

- 全局配置：
  - 可在 settings.py 中的`REST_FRAMEWORK`配置`“DEFAULT_AUTHENTICATION_CLASSES”:{"xxxx.xxxx.xx.类名"}`，在不需要认证的接口中配置`authentication_classes = []`,则该接口不需要认证。

2. 关于返回`None`
   多认证类机制: 与版本管理不同，认证支持定义多个认证类（authentication_classes 列表），系统会按顺序依次执。
   - **三种返回值处理:**
     - 抛出异常：立即终止认证流程
     - 返回元组：认证成功，终止后续认证
     - 返回 None：跳过当前认证类，继续执行下一个
   - **全 None 处理**:
     - 当所有认证类都返回 None 时，request.user 会被设为匿名用户"AnonymousUser"，request.auth 设为 None。
     - 默认值配置:
       - 可在 settings.py 中通过`UNAUTHENTICATED_USER`和`UNAUTHENTICATED_TOKEN`配置匿名访问时的默认值
     - 使用场景：当某个接口，已认证用户和未认证用户都可以访问时，比如
       - 已认证用户，访问接口返回该用户的视频播放记录列表
       - 未认证用户，访问接口返回最新的视频列表
3. 多个认证类
   - 在请求中传递`token`进行验证
   - 请求携带`cookie`进行验证
   - 请求携带`jwt`进行验证
   - 请求携带的加密数据

## 5. 权限

1. 定义
   认证，根据用户携带的 token/其它获取用户信息。
   权限，读取认证中获取的用户信息，判断当前用户是否有权限访问。
2. 基本使用

```python
 class CustomPermission(BasePermission):
	message = {"code": 1001, "error": "权限不足"}
	def has_permission(self, request, view):
	   is_permission = request.user.role == 3
	   if not is_permission:
		   return False
	   return True    def has_object_permission(self, request, view, obj):
		return True
```

- 继承 BasePermission: 自定义权限类需继承自 BasePermission。
- has_permission 方法: 必须实现 has_permission 方法，用于判定当前用户是否具有访问权限。返回 True 表示有权限，返回 False 表示无权限。
- 关联视图: 在视图中通过 permission_classes 属性将权限类与视图关联，使得视图在访问时进行权限判定。

```python
class orderView(APIView):
	permission_classes = [CustomPermission]
	def get(self, request):
		return Response({"code": 200, "data": "订单列表"})
```

- message 属性: 可在权限类中定义 message 属性，用于在权限判定失败时返回相应的错误信息。

3. 多个权限
   如果配置多个权限，则需要满足全部权限。
4. 全局配置
   `'DEFAULT_PERMISSION_CLASSES': []`

## 6. 限流

1. 作用
   - 核心功能：限制用户访问频率，防止 API 接口被过度调用
   - 应用场景：如平台发布接口限制用户 5 分钟内只能发布 1 次内容
   - 实现效果：当用户频繁访问时会返回 HTTP 429 状态码和等待时间提示
2. 内部处理原理
   - 用户分类：
     - 登录用户：使用用户 ID 作为唯一标识记录访问频率
     - 匿名用户：使用 IP 地址作为唯一标识（存在代理 IP 绕过限制的风险）
   - 底层机制：
     - 数据结构：为每个用户维护一个时间戳列表，记录每次访问时间
     - 频率计算：检查最近时间段内的访问次数（如 1 分钟内）
     - 过期清理：自动移除超出时间窗口的旧记录
   - 缓存存储：
     - 存储位置：所有访问记录存储在 Django 缓存中
     - 推荐配置：使用 Redis 作为缓存后端，需安装 django-redis 包
3. 简单使用

```python
    # settings.py
	CACHES = {
	    'default': {
	        'BACKEND': 'django_redis.cache.RedisCache',
	        'LOCATION': 'redis://127.0.0.1:6379',
	        'OPTIONS': {
	            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
	            'PASSWORD': '',
	        }
	    }
	}
```

```python
class ThrottledException(exceptions.APIException):
    status_code =  status.HTTP_429_TOO_MANY_REQUESTS
    default_code = 'throttled'
#限流
class MyRateThrottle(SimpleRateThrottle):
   cache = default_cache
   scope = 'user'
   cache_format = 'throttle_%(scope)s_%(ident)s'
   # 设置访问频率，每分钟访问10次
   # 其他 's' ,'sec', 'm' , 'min','h','hour','d','day','M','month','y','year'   THROTTLE_RATES = {
       'user': '2/m',
   }
   def get_cache_key(self, request, view):
       if request.user:
           ident = request.user.pk
       else:
           ident = self.get_ident(request) # 未登录用户的ip地址
       return self.cache_format % {'scope': self.scope, 'ident': ident}
   def throttle_failure(self):
       wait = self.wait()
       detail = {
           'code': 1005,
           'data': '访问过于频繁',
           'detail': '请在{}秒后再试'.format(int(wait))
       }
       raise ThrottledException(detail)
```

`throttle_classes = [MyRateThrottle]` 4. 多个限流类

- 本质，每个限流类中都有一个`allow_request`方法，此方法内部有三种情况
  - 返回 `True`，表示当前限流类允许访问，继续执行后续的限流类。
  - 返回 `False`，表示当前限流类不允许访问，继续执行后续的限流类。所有的限流类执行完毕，读取所有不允许的限流，并计算还需等待的时间。
  - 抛出异常，表示当前限流类不允许访问，后续限流类不再执行。
- 两种实现方式:
  - 直接抛出异常: 在 throttle_failure 中抛出异常，中断后续执行
  - 返回 False+视图处理: 在 throttle_failure 返回 False，在视图中重写 throttled 方法处理错误

5. 全局配置

```python
REST_FRAMEWORK = {
	'DEFAULT_THROTTLE_CLASSES': [],
	'DEFAULT_THROTTLE_RATES': {
		'user': '2/m',
		'xxx':'100/h'
	}
}
```

## 7. Serializer

1.  主要功能
    - 对请求的数据校验（底层调用 Django 的 Form 和 ModelForm）
    - 对数据库查询到的对象进行反序列化
2.  数据校验
    1. 基于`Serializer`
    ```python
    	import re
    	from django.core.validators import RegexValidator
    	from django.shortcuts import render
    	from rest_framework import serializers
    	from rest_framework.response import Response
    	from rest_framework.views import APIView
    	from serializertest import models
    	class RegexValidator(object):
    	    def __init__(self, base):
    	       self.base = str(base)
    	    def __call__(self, value):
    	       match_object = re.match(self.base,value)
    	       if not match_object:
    	            raise serializers.ValidationError("邮箱格式错误")
    	class UserSerializer(serializers.Serializer):
    	    username = serializers.CharField(min_length=6,max_length=32)
    	    age = serializers.IntegerField(label="年龄",min_value=0,max_value=150)
    	    level = serializers.ChoiceField(label="级别",choices=models.UserS.level_choices)
    	    email = serializers.EmailField(label="邮箱")
    	    email2 = serializers.CharField(label="邮箱2",validators= [RegexValidator])
    	    email3 = serializers.EmailField(label="邮箱3",validators= [RegexValidator(r'^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$')])
    	    email4 = serializers.EmailField(label="邮箱4")
    	    # 钩子函数  用于验证某个字段
    	    def validate_email4(self, value):
    	        if not value.endswith("163.com"):
    	            raise serializers.ValidationError("邮箱必须以163.com结尾")
    	        return value
    	# Create your views here.
    	class UserSView(APIView):
    	    authentication_classes = []
    	    def post(self, request):
    	        ser = UserSerializer(data=request.data)
    	        if not ser.is_valid():
    	            return Response({"code": 1001,"data": ser.errors})
    	        ser.save()
    	        return Response({"code": 200, "data": "成功"})
    ```
        在settings中设置`LANGUAGE_CODE = 'zh-hans'`可以将错误信息转换为中文。
    2. 基于`ModelSerializer`
    ```python
    class UserModelSerializer(serializers.ModelSerializer):
        email4 = serializers.CharField()
        class Meta:
            model = models.UserS
            fields = "__all__"
            # fields = ["username","age","level","email"]
            # exclude = ["email"]
             # extra_kwargs = {
             #     "username": {
             #         "min_length": 6,
             #         "max_length": 32
             #     }
            # }
            # read_only_fields = ["username"]
            # write_only_fields = ["password"]
        def ValidateEmail4(self, value):
            if not value.endswith("163.com"):
                raise serializers.ValidationError("邮箱必须以163.com结尾")
    ```
3.  序列化

    - 简单使用
      ```python
      from django.shortcuts import render
      from rest_framework import serializers
      from rest_framework.response import Response
      from rest_framework.views import APIView
      from serializertest02 import models
      class UserSerializer(serializers.ModelSerializer):
          class Meta:
              model = models.UserInfo
              fields = ['name', 'age', 'email']
      # Create your views here.
      class UserInfView(APIView):
          def get(self, request):
             queryset = models.UserInfo.objects.all()
             serializer = UserSerializer(queryset, many=True)
             print(serializer.data)
             return Response({"code":200,"data": serializer.data})
      ```
    - 自定义字段

      ```python
       class UserSerializer(serializers.ModelSerializer):
      	department = serializers.CharField(source='department.title')
      	level = serializers.CharField(source='get_level_display')

      	roles = serializers.SerializerMethodField()
      	def get_roles(self, obj):
      		list = obj.roles.all()
      		return [model_to_dict(item,['id','title']) for item in list]
      	extra = serializers.SerializerMethodField()
      	def get_extra(self, obj):
      		return 666
      	class Meta:
      		model = models.UserInfo
      		fields = ['name', 'age', 'email','level','department','roles','extra']
      ```

    - 序列化类的嵌套
      ```python
      class DepartmentSerializer(serializers.ModelSerializer):
          class Meta:
              model = models.Department
              fields = ['id', 'title']
      class RoleSerializer(serializers.ModelSerializer):
          class Meta:
              model = models.Role
              fields = ['id', 'title']
      class UserSerializer(serializers.ModelSerializer):
          department = DepartmentSerializer()
          roles = RoleSerializer(many=True, read_only=True)
          level = serializers.CharField(source='get_level_display')
          def get_extra(self, obj):
              return 666
          class Meta:
              model = models.UserInfo
              fields = ['name', 'age', 'email','level','department','roles','extra']
      ```

4.  序列化和数据校验结合

```python
	from django.forms import model_to_dict
	from django.shortcuts import render
	from rest_framework import serializers
	from rest_framework.response import Response
	from rest_framework.views import APIView
	from serializertest02 import models
	class DepartmentSerializer(serializers.ModelSerializer):
	    class Meta:
	        model = models.Department
	        fields = ['id', 'title']
	        # extra_kwargs = {'id':{"read_only":False},'title': {"read_only":True}}
	class RoleSerializer(serializers.ModelSerializer):
	    class Meta:
	        model = models.Role
	        fields = ['id', 'title']
	        # extra_kwargs = {'id': {"read_only": False}, 'title': {"read_only":True}}
	class UserSerializer(serializers.ModelSerializer):
	    department = DepartmentSerializer(read_only=True)
	    roles = RoleSerializer(many=True,read_only=True)
	    role_ids = serializers.ListField(write_only=True)
	    dept_id = serializers.IntegerField(write_only=True)
	    level = serializers.CharField(source='get_level_display',read_only=True)
	    level_id = serializers.IntegerField(write_only=True)
	    # roles = serializers.SerializerMethodField()
	    # def get_roles(self, obj):    #     list = obj.roles.all()    #     return [model_to_dict(item,['id','title']) for item in list]    extra = serializers.SerializerMethodField(read_only=True)
	    def get_extra(self, obj):
	        return 666
	    class Meta:
	        model = models.UserInfo
	        fields = ['name', 'age', 'email','level','level_id','role_ids','dept_id','department','roles','extra']

	    def create(self, validated_data):
	            """
	             如果有嵌套的 Serializer ，在进行数据校验时，只有两种选择
	             1. 将嵌套的序列化设置成 read_only             2. 自定义 create 和 update方法，自定义新建和更新的逻辑
	             注意：用户端提交数据的格式
	            """            depart_id = validated_data.pop('dept_id')
	            role_ids = validated_data.pop('role_ids')
	            level_id = validated_data.pop('level_id')
	            validated_data['department_id'] = depart_id
	            validated_data['level'] = level_id
	            print(validated_data)
	            user_obj = models.UserInfo.objects.create(**validated_data)
	            user_obj.roles.add(*role_ids)
	            return user_obj

	# Create your views here.
	class UserInfView(APIView):
	    authentication_classes = []
	    def get(self, request):
	       queryset = models.UserInfo.objects.all()
	       serializer = UserSerializer(queryset, many=True)
	       print(serializer.data)
	       return Response({"code":200,"data": serializer.data})
	    def post(self, request):
	        serializer = UserSerializer(data=request.data)
	        if not serializer.is_valid():
	            return Response({"code": 1001, "data": serializer.errors})
	        serializer.save()
	        return Response({"code": 200, "data": serializer.data})
```

## 8. 视图

### 8.1 APIView

DRF 的基础视图类，继承自 Django 的 `View`，但增加了对请求解析、版本、认证、限流响应渲染、权限校验等功能的支持。
`APIView`是 drf 中“顶层”的视图类。

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

### 8.2 通用视图 `GenericAPIView`

继承自 `APIView`，添加了对查询集（`queryset`）和序列化器（`serializer_class`）的支持。

- **核心功能**：
  - `get_queryset()`：获取数据查询集。
  - `get_serializer()：`获取序列化器实例。
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

- 作用
  “中间人”，内部定义了一些方法，将数据库中获取数据，序列化类提取到类变量中，方便咱们去定义，内部如果调用`get_serializer`、`get_queryset()`就会去读取。

### 8.3 **`GenericViewSet`**

`GenericViewSet`类中没有定义任何代码，就是继承`ViewSetMixin`和`GenericAPIView` 不包含默认动作，需结合**混入类（Mixins）**（如`CreateModelMixin`）或自定义方法实现功能。

- `GenericAPIView`:将数据库中获取数据，序列化类提取到类变量中。
- `ViewSetMixin`:将 get/post/put/delete 等方法映射到 list、create、retrieve、update、destroy 方法中。

```python
class UserViewSet(GenericViewSet):
    # queryset = User.objects.all()
    # serializer_class = UserSerializer    # permission_classes = [IsAuthenticated]    authentication_classes = []
    def list(self, request):
        return  Response({"code": 200})
    def create(self, request):
        return Response({"code": 201})
    def retrieve(self, request, pk=None):
        return Response({"code": 202})
    def update(self, request, pk=None):
        return Response({"code": 203})
    def destroy(self, request, pk=None):
        return Response({"code": 204})
# urls
urlpatterns = [
    path('generic/',UserViewSet.as_view({'get':'list', 'post':'create'}) ),
    path('generic/<int:pk>/',UserViewSet.as_view({'get':'retrieve', 'put':'update', 'delete':'destroy'}) ),
]
```

### 8.4 五大常见**Mixin 类**

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
  通过重写`get_serializer_class`可以为不同的方法指定不同的序列化类。

```python
def get_serializer_class(self):
    if self.action == 'list':
        return UserSerializer
    elif self.action == 'create':
        return UserSerializer1
    elif self.action == 'retrieve':
        return UserSerializer2
    elif self.action == 'update':
        return UserSerializer3
```

**多看源码，拓展思路，重写方法，实现特殊需求**

### 8.5**组合通用视图**

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

  ```python
  from rest_framework.generics import ListCreateAPIView
  from .models import Book
  from .serializers import BookSerializer

  class BookListCreateView(ListCreateAPIView):
      queryset = Book.objects.all()
      serializer_class = BookSerializer
  ```

### 8.6 `ViewSet`

- **`ModelViewSet`**
  提供完整的 CRUD 操作（`list`, `create`, `retrieve`, `update`, `destroy`），需指定`queryset`和`serializer_class`。
  ```python
  	class BooksView(ModelViewSet):
  	    queryset = BookInfo.objects.all()
  	    serializer_class = BookSerializer
  #urls
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
  	]
  ```
- **`ReadOnlyModelViewSet`**
  仅支持只读操作（`list`和`retrieve`），适用于数据展示场景。
- **`GenericViewSet`**
  基础类，不包含默认动作，需结合**混入类（Mixins）**（如`CreateModelMixin`）或自定义方法实现功能。
- **自定义动作**
  **`@action`装饰器**
  扩展非标准操作，例如添加`激活用户`：
  ```python
  	from rest_framework.decorators import action
  	class UserViewSet(ModelViewSet):
  	    @action(detail=True, methods=['post'])
  	    def activate(self, request, pk=None):
  	        # 自定义逻辑
  ```
  - 生成 URL：`/users/{id}/activate/`。
  - 参数：`detail`（是否针对单个对象）、`methods`（支持的 HTTP 方法）。

## 自关联查询

```python
class GoodsCategorySerializer3(serializers.ModelSerializer):
    class Meta:
        model = GoodsCategory
        fields = '__all__'

class GoodsCategorySerializer2(serializers.ModelSerializer):
	# sub_cat 该字段为 related_name="sub_cat"
    sub_cat = GoodsCategorySerializer3(many=True)
    class Meta:
        model = GoodsCategory
        fields = '__all__'

class GoodsCategorySerializer(serializers.ModelSerializer):
    sub_cat = GoodsCategorySerializer2(many=True)
    class Meta:
        model = GoodsCategory
        fields = '__all__'
```

[^1]:
