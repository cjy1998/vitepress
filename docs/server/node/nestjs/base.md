# 基础

## 初始化项目

### 全局安装

```plain
npm i -g @nestjs/cli
```

### 创建项目

```plain
 nest new project-name
```

### 运行应用

```plain
 npm run start
 npm run start:dev  //此命令将监视你的文件，自动重新编译并重新加载服务器。
```

### 格式化代码

```plain
npm run lint
npm run format
```

### 增删改查生成器

```plain
nest g res [name]
nest g res [name]  --no-spec  不生成测试文件，可以传递 --no-spec 标志
```

<!-- 这是一张图片，ocr 内容为：PS E:\NESTJS\DAY1> NEST G RES US S USERS -NO-SPEC ? WHAT TRANSPORT LAYER DO YOU USE? (USE ARROW KEYS) REST API GRAPHQL (CODE FIRST) GRAPHQL (SCHEMA FIRST)  MICROSERVICE (NON-HTTP) WEBSOCKETS -->

![](https://cdn.nlark.com/yuque/0/2023/png/29244275/1690794957200-3910d121-3838-4b7b-9fd3-e056750833cf.png)

通过该命令可以<font style="color:rgb(64, 64, 64);background-color:rgb(253, 253, 253);">生成所有 NestJS 构建块（模块、服务、控制器类），实体类、DTO 类以及测试 (</font><font style="color:rgb(40, 118, 210);background-color:rgb(240, 242, 243);">.spec</font><font style="color:rgb(64, 64, 64);background-color:rgb(253, 253, 253);">) 文件。并且会自动把生成的模块导入 app.module.ts 中。</font>

<!-- 这是一张图片，ocr 内容为：USERS DTO TS CREATE-USER.DTO.TS U TS UPDATE-USER.DTO.TS U ENTITIES TS USER.ENTITY.TS U USERS.CONTROLLER.TS U USERS.MODULE.TS USERS.SERVICE.TS -->

![](https://cdn.nlark.com/yuque/0/2023/png/29244275/1690794991503-e715128e-59df-4912-a491-c969470a2db4.png)

生成完毕，启动项目。访问[http://localhost:3000/user](http://localhost:3000/user)，可以看到页面上会出现“<font style="color:rgb(0, 0, 0);">This action returns all user</font>”，这时证明已经成功生成。默认情况下不绑定到任何特定的 ORM（或数据源），所有方法都将包含占位符，允许你使用特定于项目的数据源填充它。

根据生成的 users 模块可以看到主要分为控制器（controller）、提供者（service）、模块（module）、实体类、dto 文件。

## DTO

### 什么是 DTO？

DTO 是数据传输对象（Data Transfer Object）的缩写，是一种设计模式，常用于在不同层之间传输数据。它主要用于在应用程序的不同组件（如前端、后端、数据库等）之间传递数据，以解耦数据的传输过程，提高应用程序的性能和可维护性。

在现代软件开发中，通常应用程序由多个不同的模块组成，这些模块可能在不同的环境中运行，例如前端、后端和数据库服务器。这些模块可能需要在彼此之间传递数据，比如从前端发送用户输入到后端进行处理，或者从后端获取数据并传递给前端显示。

DTO 作为设计模式，其主要目的有以下几个方面：

1.  数据封装：DTO 封装了多个属性，以一种结构化的方式表示数据。这样可以方便地将多个属性打包传输，而不需要每次传递一个个独立的属性。
2.  数据传输：DTO 可以在不同的层之间传输数据。比如在前端和后端之间传递数据对象，或者在后端和数据库之间传递数据对象。
3.  减少通信次数：由于 DTO 可以携带多个属性，这样就可以减少不必要的通信次数。传递一个 DTO 对象，相当于一次性传递了多个属性的值。
4.  数据过滤：有时候不需要传递实体对象的所有属性，DTO 可以用来过滤只传递需要的属性，减少数据的传输量。
5.  安全性：DTO 可以用来屏蔽敏感信息。在数据传输中，可以使用 DTO 仅传递对外公开的非敏感属性，而将敏感属性留在服务端不传递出去，增加数据安全性。

总的来说，DTO 模式可以帮助组织和管理数据的传输，提高应用程序的性能和安全性。然而，过度使用 DTO 也可能导致代码冗余和维护困难，因此在使用时需要权衡利弊。

> chatGPT 3.5

### 在 TS 中怎么使用 DTO？

当在 TypeScript 中使用 DTO（数据传输对象）模式时，通常会定义一个 DTO 类或接口，用于封装需要在不同层之间传输的数据。这样可以使数据的传输更明确和类型安全。

下面是一个在 TypeScript 中定义 DTO 的简单示例：

假设我们有一个应用程序，其中涉及到用户对象。在前端和后端之间传输用户信息时，我们可以创建一个名为`UserDTO`的数据传输对象，来表示用户的一部分信息。

```typescript
// UserDTO.ts
// 创建一个UserDTO接口，用于表示在前端和后端之间传输的用户信息
export interface UserDTO {
  id: number; // 用户ID
  username: string; // 用户名
  email: string; // 邮箱
  age: number; // 年龄
  // 可以添加其他你希望传输的用户属性
}
```

在这个例子中，`UserDTO`是一个简单的 TypeScript 接口，它定义了在前端和后端之间传输的用户信息的结构。这样，当数据从前端传递给后端或者从后端传递给前端时，我们可以使用`UserDTO`来确保数据的正确传输。

示例用法：

在前端，当我们从用户输入或 API 响应中获取用户信息时，可以将其转换为`UserDTO`对象：

```typescript
// frontend.ts

import { UserDTO } from "./UserDTO";

// 从用户输入或API响应中获取用户信息
const userDataFromInput = {
  id: 1,
  username: "john_doe",
  email: "john@example.com",
  age: 30,
};

// 将用户信息转换为UserDTO对象
const userDTO: UserDTO = userDataFromInput;
```

在后端，当我们接收到前端传来的用户信息时，也可以使用`UserDTO`来解析数据并进行处理：

```typescript
// backend.ts

import { UserDTO } from "./UserDTO";

// 模拟后端处理逻辑
function processUserData(userDTO: UserDTO) {
  // 处理用户信息...
  console.log(
    `Received user data - ID: ${userDTO.id}, Username: ${userDTO.username}, Email: ${userDTO.email}, Age: ${userDTO.age}`
  );
}

// 假设从前端接收到用户信息
const receivedUserData = {
  id: 2,
  username: "jane_smith",
  email: "jane@example.com",
  age: 25,
};

// 使用UserDTO解析用户信息并进行处理
processUserData(receivedUserData);
```

使用 DTO 模式，我们可以在不同层之间传输数据，并确保数据的结构一致性和类型安全性。这样可以有效地组织数据，并简化数据传输过程。

> chatGPT 3.5

### 主要用途

主要用途就是<font style="color:rgb(55, 65, 81);background-color:rgb(247, 247, 248);">用来过滤参数。结合 class-validator 和 class-transformer 实现过滤参数和参数类型校验。</font>

```typescript
npm i --save class-validator class-transformer
```

<font style="color:rgb(55, 65, 81);background-color:rgb(247, 247, 248);">参数类型校验</font>

```typescript
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string; // 用户名
  @IsString()
  email: string; // 邮箱
  @IsNumber()
  age: number; // 年龄
}
```

<!-- 这是一张图片，ocr 内容为：发送 POST LYUSERS 设置 后置操作 前置操作 COOKIES HEADERS BODY PARAMS AUTH GRAPHQL FORM-DATA BINARY JSON X-WWW-FORM-URLENCODED XML MSGPAO NONE RAW "USERNAME":"张三", "AGE":"12", "EMAIL":"123456@GG.COM", "PHONE":"245" 控制台 COOKIE BODY 实际请求 HEADER 14MS 115B 400 Q RAWPREVIEWVISUALIZE PRETTY JSON UTF8 1234 "MESSAGE":[ "AGE MUST BE A NUMBER CONFORMING TO THE SPECIFIED CONSTRAINTS" ], "ERROR": "BAD REQUEST", "STATUSCODE":400 9 了 -->

![](https://cdn.nlark.com/yuque/0/2023/png/29244275/1690798418817-c5e941b2-600e-4a46-a7ee-97fb7ce26842.png)

参数过滤

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
}
bootstrap();
```

<!-- 这是一张图片，ocr 内容为：LUSERS 发送 POST 后置操作 前置操作 设置 BODY AUTH COOKIES HEADERS PARAMS X-WWW-FORM-URLENCODED GRAPHQL FORM-DATA BINARY MSGPA JSON XML RAW NONE 1 2 "USERNAME":"张三", 3 'AGE":12, 4 "EMAIL":"123456@QQ.COM", 56 "PHONE":"24545" 实际请求 控制台 COOKIE HEADER 7 BODY 201 10MS 54B RAWPREVIEWVISUALIZE JSON PRETTY UTF8 "USERNAME":"张三", 2 "AGE":12, 3 4 "EMAIL": "123456@GQ.COM" 5 了 -->

![](https://cdn.nlark.com/yuque/0/2023/png/29244275/1690798456184-6a402e4c-96f1-4818-b717-ab6a3a7cfb9d.png)

## 控制器（controller）

控制器主要负责处理前端传入的参数 request 并将 responses 返回给客户端。一个控制器通常对应多个路由，拿 users.controller.ts 来举例。这也是增删改查生成器自动生成的控制器：

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
// 指定路径前缀为users 方便管理路由
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}
```

@Get()、@Post()、@Delete()、@Patch、@All()是 HTTP 请求方法装饰器，是用来配置路由的请求方法。在 HTTP 请求方法装饰器中可以指定路由路径，完整的路由路径是控制器声明的前缀和方法装饰器中指定的路径来确定的。例如将获取全部用户的路由改为如下：

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
// 指定路径前缀为users 方便管理路由
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get("all")
  findAll() {
    return this.usersService.findAll();
  }
}
```

这时获取全部用户的接口就从"/users"变为了"/users/all"，更改后文件编译完毕，在控制台也可以看到当前程序的所有接口。

<!-- 这是一张图片，ocr 内容为：[NESTFACTORY] STARTING NEST 2023/07/31 19:18:31 [NEST] LOG 3836 APPLICATION. [INSTANCELOADER] [NEST] E DEPENDENCIES INITIALIZED +25MS LOG APPMODULE 2023/07/31 19:18:31 3836 2023/07/31 19:18:31 USERSMODULE DE LE DEPENDENCIES INITIALIZED +1MS [NEST] 3836 [INSTANCELOADER] LOG APPCONTROLLER {/}: +42MS - 2023/07/31 19:18:31 [ROUTESRESOLVER] [NEST]3836 LOG [ROUTEREXPLORER] MAPPED {/, GET} ROUTE +7MS [NEST] 3836 - 2023/07/31 19:18:31 LOG USERSCONTROLLER {/USERS}: +1MS 3836  - 2023/07/31 19:18:31 [NEST] LOG ROUTESRESOLVER MAPPED {/USERS, POST} ROUTE +1MS LOG [NEST] [ROUTEREXPLORER 3836 2023/07/31 19:18:31 MAPPED {/USERS/ALL, GET} ROUTE +LMS 3836 2023/07/31 19:18:31 [NEST] LOG [ROUTEREXPLORER [NEST] 3836 - 2023/07/31 19:18:31 LOG MAPPEA 1/USERS/:LA, GEL; ROUTE +2MS [ROUTEREXPLORER] {/USERS/:ID, PATCH} ROUTE +1MS 2023/07/31 19:18:31 NEST] 3836 [ROUTEREXPLORER] LOG MAPPED {/USERS/:ID, DELETE] ROUTE +2MS 19:18:31 MAPPED [NEST] LOG [ROUTEREXPLORER] 3836 - 2023/07/31 1 2023/07/31 19:18:31 NEST APPLICATION SUCCESSFULLY STARTED +6MS ICATION [NEST] LOG 3836 NESTAPP -->

![](https://cdn.nlark.com/yuque/0/2023/png/29244275/1690802496165-024af668-0a81-4191-bfac-9caf306f3f6d.png)

使用浏览器访问[http://localhost:3000/users/all](http://localhost:3000/users/all)，可以看到接口调用成功。

<!-- 这是一张图片，ocr 内容为：LOCALHOST:3000/USERS/ALL [HALO主题]SAK... 公司 在云端意逍遥 在线翻译有道 THIS ACTION ON RETURNS ALL USERS -->

![](https://cdn.nlark.com/yuque/0/2023/png/29244275/1690802558551-dcbcef17-5a07-4325-9ef5-9562f1738c5e.png)

### 获取请求对象

可以通过下列装饰器获取请求参数

|       装饰器列表        | <font style="color:rgb(64, 64, 64);background-color:rgb(253, 253, 253);">普通平台（express）特定对象</font> |
| :---------------------: | ----------------------------------------------------------------------------------------------------------- |
|   @Request(), @Req()    | req                                                                                                         |
|  @Response(), @Res()\*  | res                                                                                                         |
|         @Next()         | next                                                                                                        |
|       @Session()        | req.session                                                                                                 |
|  @Param(key?: string)   | req.params / req.params[key]                                                                                |
|   @Body(key?: string)   | req.body / req.body[key]                                                                                    |
|  @Query(key?: string)   | req.query / req.query[key]                                                                                  |
| @Headers(name?: string) | req.headers / req.headers[name]                                                                             |
|          @Ip()          | req.ip                                                                                                      |
|      @HostParam()       | req.hosts                                                                                                   |

:::info
注：当使用@Response(), @Res()装饰器时，需要导入底层库（例如 @types/express）的类型，因为两者都直接暴露底层原生平台 response 对象接口。并且当使用这两个装饰器时，Nest 会进入库特定模式，需要负责处理接口的响应（例如，res.json(...) 或 res.send(...)）来触发某种响应，否则 HTTP 服务器将挂起。

:::

### 更改状态码

可以使用@HttpCode(204)装饰器来修改状态码，状态码默认是 200。

### 修改响应头

可以使用@Header()装饰器来修改响应头。

```typescript
import { Controller, Get, HttpCode, Header } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @HttpCode(200)
  @Header("Cache-Control", "none")
  findAll() {
    return this.usersService.findAll();
  }
}
```

<!-- 这是一张图片，ocr 内容为：名称 预览 X 标头 启动器 响应 时间 COOKIE USERS 常规 141.327CE5C7JS 请求网址:HTTP://LOCALHOST:3000/USERS 请求方法:GET 状态代码: 200  OK 远程地址:[::11:3000 引荐来源网址政策:STRICT-ORIGIN-WHEN-CROSS-ORIGIN 查看源代码 响应标头 CACHE-CONTROL: NONE CONNECTION:KEEP-ALIVE CONTENT-LENGTH:29 CONTENT-TYPE: TEXT/HTML; CHARSET-UTF-8 DATE: MON, 31 JUL 2023 12:01:45 GMT ETAG:W/"1D-10F75C9A9LKZ14HQ8VKQUJBYZH8" KEEP-ALIVE:TIMEOUT5 X-POWERED-BY: EXPRESS -->

![](https://cdn.nlark.com/yuque/0/2023/png/29244275/1690804932991-80101ce3-d84a-4091-934b-a802d842b272.png)

### 重定向

#### 静态重定向

可以使用@Redirect()装饰器进行重定向，该装饰器有两个可选参数（url 和 statusCode)，statusCode 的默认值是 302。

```typescript
 @Get()
  @Redirect('https://baidu.com', 301)
  findAll() {
    return this.usersService.findAll();
  }
```

<!-- 这是一张图片，ocr 内容为：标头 启动器 时间 预览 响应 名称 目 USERS 常规 目 BAIDU.COM 请求网址:HTTP://LOCALHOST:3000/USERS 目 WWW.BAIDU.COM 请求方法:GET NEWFANYI-DAOCEA8F7E.PNG 状态代码: 301 MOVED PERMANENTLY NEWXUESHUICON-A5314D5C83.PNG 远程地址:[::1]:3000 INIT-C52228535A.CSS 引荐来源网址政策:STRICT-ORIGIN-WHEN-CRD JQUERY-1-EDB203C114.10.2.JS -->

![](https://cdn.nlark.com/yuque/0/2023/png/29244275/1690805267648-787085af-efde-4e80-9319-4a04192f60c6.png)

#### 动态重定向

动态重定向可以通过路由返回一个包括 url 的对象来处理，返回的这个对象会覆盖@Redirect()装饰器的参数。

```typescript
@Get()
  @Redirect('https://nest.nodejs.cn', 301)
  findAll(@Query('name') name) {
    if (name === 'baidu') {
      return {
        url: 'https://baidu.com',
      };
    } else if (name === 'sohu') {
      return {
        url: 'https://sohu.com',
      };
    }
  }
```

<!-- 这是一张图片，ocr 内容为：类型 名称 状态 启动器 目USERS?NAMEBAIDU 其他 DOCUMENT/重定向 301 目 BAIDU.COM DOCUMENT/重定向 LOCALHOST:3000/USERS?NAME... 302 目 BAIDU.COM/ DOCUMENT 200 WWW.BAICLU.COM -->

![](https://cdn.nlark.com/yuque/0/2023/png/29244275/1690805995007-d342ca2a-b027-4023-b92f-c05b3ab23c0c.png)

### 路由参数

```typescript
@Get(':id')
@Bind(Param())
findOne(params) {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
```

```typescript

@Get(':id')
findOne(@Param('id') id: string): string {
  return `This action returns a #${id} cat`;
}


```

### 作用域

在 Nest.js 中，作用域是指在应用程序中处理请求时，每个请求具有独立的上下文和生命周期。这意味着每个请求都有自己的一组实例化的服务，它们在该请求的处理期间是唯一的，并且不会与其他请求共享状态。这为开发者提供了一种在请求级别控制数据共享和生命周期的机制。

举例来说，考虑一个简单的 Nest.js 应用，其中包含一个服务和一个控制器：

```typescript
// 示例服务
@Injectable()
export class ExampleService {
  private counter = 0;

  incrementCounter() {
    this.counter++;
  }

  getCounter() {
    return this.counter;
  }
}

// 示例控制器
@Controller()
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get("/increment")
  increment() {
    this.exampleService.incrementCounter();
    return `Counter incremented! Current value: ${this.exampleService.getCounter()}`;
  }

  @Get("/counter")
  getCounter() {
    return `Current value of counter: ${this.exampleService.getCounter()}`;
  }
}
```

在这个例子中，ExampleService 是一个简单的服务，有一个 counter 变量和两个方法，用于递增 counter 值和获取 counter 值。

如果 Nest.js 应用没有启用作用域功能，那么对于所有的请求，ExampleService 的实例都是同一个，并且 counter 是全局共享的。这意味着当一个请求调用 /increment 路径时，会影响到其他请求的结果。

但是，如果启用了作用域功能，那么每个请求都会获得自己的 ExampleService 实例，它们之间的状态是独立的。这样，在一个请求调用 /increment 路径后，counter 值只会在该请求的上下文中递增，不会影响其他请求的结果。

在 GraphQL 应用中，作用域功能尤其有用。因为每个 GraphQL 请求都可以被视为一个独立的请求，启用作用域功能可以确保每个请求都有自己的服务实例和状态，从而实现更高级的请求缓存、请求跟踪或多租户等需求。

> chatGPT 3.5

### 异步

```typescript
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```

### 请求负载

就是使用@Body()装饰器，结合 DTO 获取前端传递来的参数。

```typescript
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }

```

## 提供(服务)者（service）

主要用于处理应用程序的业务逻辑和数据操作，是一个普通的 TypeScript 类，并且使用 @Injectable() 装饰器来标记它们可以被依赖注入。

示例：

```typescript
import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  private readonly users: CreateUserDto[] = [];
  create(createUserDto: CreateUserDto) {
    this.users.push(createUserDto);
    return "创建成功";
  }

  findAll(): CreateUserDto[] {
    return this.users;
  }
}
```

```typescript
import { Controller, Get, Post, Body } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController {
  // 依赖注入
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

<!-- 这是一张图片，ocr 内容为：发送 保存 POST LISERS 前置操作 设置 后置操作 PARAMS BODY COOKIES HEADERS 个个 AUTH GRAPHQL BINARY X-WWW-FORM-URLENCODED ISON FORM-DATA XML MSGPACK NONE RAW 台格式化 123 "USERNAME":"李四", "EMAIL":"15465465879", 4 "AGE":43534 5 实际请求 COOKIE 控制台 BODY HEADER 201 42MS 12B 团 Q RAWPREVIEW VISUALIZE HTML PRETTY UTF8 1 创建成功 -->

![](https://cdn.nlark.com/yuque/0/2023/png/29244275/1690855153366-c0e8b6c3-044e-43d4-89a4-3651fcb4ee4d.png)

<!-- 这是一张图片，ocr 内容为：TO/USERS 发送 GET 设置 后置操作 前置操作 BODY COOKIES HEADERS PARAMS AUTH QUERY参数 参数名 参数值 添加参数 控制台 实际请求 HEADER 7 BODY COOKIE 113 B 200 17 MS A RAWPREVIEWVISUALIZE PRETTY JSON UTF8 123 "李四", "USERNAME"" 4 "EMAIL":"15465465879", 5 "AGE":43534 6 7 "张三", 8 "USERNAME "EMAIL": "15465465879", 9 10 "AGE":43534 11 12 -->

![](https://cdn.nlark.com/yuque/0/2023/png/29244275/1690855194008-7bf8dd2d-ab3e-4d26-b953-155931043a35.png)

### 作用域

默认情况下，Nest.js 中的服务是单例的，这意味着它们在整个应用程序中只有一个实例，并在不同的模块和组件之间共享状态。但是，可以使用 @Scope() 装饰器来设置服务的作用域，从而控制服务的生命周期和状态共享范围。

官网解释作用域在特定情况下有用：

:::info
在某些边缘情况下，基于请求的生命周期可能是所需的行为，例如 GraphQL 应用中的每个请求缓存、请求跟踪和多租户。 注入作用域提供了一种机制来获得所需的提供者生命周期行为。

:::

<details class="lake-collapse"><summary id="ub1e32d87"><span class="ne-text">GraphQL 应用</span></summary><p id="u5b538d88" class="ne-p"><span class="ne-text">GraphQL 应用是指使用 GraphQL 这种查询语言和运行时系统来构建和提供 API 的应用程序。GraphQL 是一种由 Facebook 开发的查询语言，它允许客户端精确地指定需要获取的数据，从而减少了过度获取或不足的数据，提高了 API 的效率和性能。</span></p><p id="uef7ba698" class="ne-p"><span class="ne-text">在传统的 RESTful API 中，每个端点通常有一个固定的数据结构，客户端只能获取预定义的数据。但在 GraphQL 中，客户端可以根据其需要自定义查询，只请求所需的数据字段。这种灵活性使得客户端能够精确地获取所需数据，而不会浪费带宽和处理资源。</span></p><p id="u35f946d4" class="ne-p"><span class="ne-text">GraphQL 应用由以下组件组成：</span></p><p id="u5d11dd2e" class="ne-p"><span class="ne-text">1. Schema（模式）：** GraphQL 应用首先定义一个数据模型的 Schema，其中包含了所有可以查询的类型、字段以及查询、变量和订阅等操作。Schema 定义了 API 的可用功能和数据结构。</span></p><p id="u2b01cd31" class="ne-p"><span class="ne-text">2. Resolver（解析器）：** Resolver 是实际处理 GraphQL 查询的代码块。每个字段在 Schema 中都有一个对应的解析器，当该字段被查询时，相应的解析器将会被调用来获取数据。Resolver 通常会从数据库、外部 API 或其他数据源中获取数据并返回给客户端。</span></p><p id="u808efb49" class="ne-p"><span class="ne-text">3. Query（查询）：** 客户端使用查询来请求数据。查询由字段和参数组成，它们指定了客户端所需的数据以及数据过滤、排序和其他操作。</span></p><p id="u7c1c4f70" class="ne-p"><span class="ne-text">4. Mutation（变更）：** Mutation 允许客户端执行写入操作，如添加、更新或删除数据。它类似于传统 RESTful API 中的 POST、PUT、DELETE 等请求。</span></p><p id="ub6227ec1" class="ne-p"><span class="ne-text">5. Subscription（订阅）：** Subscription 允许客户端订阅特定事件的实时推送。例如，客户端可以订阅某个数据的更新，一旦数据发生变化，服务器会立即推送更新给客户端。</span></p><p id="u37c2f6e1" class="ne-p"><span class="ne-text">GraphQL 应用的主要优点包括：</span></p><p id="u2aa92f0a" class="ne-p"><span class="ne-text">- 灵活性：客户端可以精确控制所需数据，避免了过度获取数据和多次请求的问题。</span></p><p id="u825ac567" class="ne-p"><span class="ne-text">- 性能优化：通过单一请求获取多个资源，减少了网络请求次数，提高了性能。</span></p><p id="uf53a9a64" class="ne-p"><span class="ne-text">- 版本控制：由于客户端决定所需数据，不需要为每个版本维护不同的 API。</span></p><p id="u43010285" class="ne-p"><span class="ne-text">- 强大工具生态：GraphQL 有丰富的工具和库支持，使开发和调试变得更加简单。</span></p><p id="ud8f18847" class="ne-p"><span class="ne-text">总体而言，GraphQL 应用为开发者和客户端提供了更高效和灵活的数据交互方式，使得构建现代化、高性能的 API 更加容易。</span></p><div class="ne-quote"><p id="u8607d6fa" class="ne-p"><span class="ne-text">chatGPT	3.5</span></p></div></details>
<details class="lake-collapse"><summary id="u7e8c3282"><span class="ne-text" style="color: rgb(52, 53, 65); font-size: 16px"> GraphQL 查询语言</span></summary><p id="u911bed21" class="ne-p"><span class="ne-text">GraphQL 查询语言是一种由 Facebook 开发的用于获取数据的声明式查询语言。它被设计用于客户端向服务器发送数据查询请求，并且具有以下特点：</span></p><p id="u6fe72489" class="ne-p"><span class="ne-text">1. **声明式：** GraphQL 查询语言是声明式的，这意味着客户端可以准确地描述所需的数据结构，而无需指定如何获取数据。客户端只需要描述数据的形式，服务器会根据查询语句返回相应的数据。</span></p><p id="u1dbc08dd" class="ne-p"><span class="ne-text">2. **强类型：** GraphQL 查询语言是强类型的，这意味着每个查询字段和参数都必须在 GraphQL Schema 中定义。这样可以确保客户端只请求有效的数据，并在编译时就能发现错误。</span></p><p id="u2e08cc52" class="ne-p"><span class="ne-text">3. **嵌套字段：** GraphQL 查询语言允许嵌套字段，这样可以在一次查询中获取多个层次的相关数据，减少了网络请求次数。</span></p><p id="ua54ac386" class="ne-p"><span class="ne-text">4. **查询别名：** GraphQL 允许为查询字段和嵌套字段定义别名，这样可以解决字段名冲突的问题，增加了灵活性。</span></p><p id="ueb8945f2" class="ne-p"><span class="ne-text">5. **参数化查询：** GraphQL 查询语言支持参数化查询，客户端可以在查询中传递参数，从而实现动态查询和过滤。</span></p><p id="u9c2e23dd" class="ne-p"><span class="ne-text">6. **Fragments（片段）：** Fragments 是一种重用查询字段的机制，它允许将一组字段定义为片段，并在查询中引用它们，从而提高了查询的可维护性。</span></p><p id="u10f0bc4b" class="ne-p"><span class="ne-text">下面是一个简单的 GraphQL 查询语言示例：</span></p><pre data-language="typescript" id="TGxxW" class="ne-codeblock language-typescript"><code>query {
  user(id: 123) {
    name
    age
    posts {
      title
      content
    }
  }
}</code></pre><p id="u777f8442" class="ne-p"><span class="ne-text">在上面的查询中，客户端请求从服务器获取一个用户的姓名、年龄和他发布的帖子的标题和内容。这个查询中的字段和参数必须在服务器端的 GraphQL Schema 中进行定义，以便服务器知道如何处理查询并返回相应的数据。</span></p><p id="ue3cc8c46" class="ne-p"><span class="ne-text">GraphQL 查询语言的灵活性和强大功能使得客户端可以精确地获取所需的数据，避免了过度获取数据和多次请求的问题，从而提高了应用程序的性能和效率。</span></p><div class="ne-quote"><p id="u200e4f1a" class="ne-p"><span class="ne-text">chatGPT 3.5</span></p></div></details>
<font style="color:#DF2A3F;">先不做了解，后边和控制器作用域一起。</font>

### 自定义提供者

![yuque_mind.jpeg](https://imgbed.cj.abrdns.com/file/1766995316150_yuque_mind.jpeg)

- Module 里声明了 Service 和 Controller 的提供者，告诉 IOC 容器如何实例化它们。
- Service 是处理业务逻辑和数据操作的类。这些类被标记为 @Injectable()，表示它们可以被 IOC 容器管理。
- Controller 通过构造函数注入 Service 实例，它需要的依赖会由 IOC 容器自动解析和注入。箭头表示依赖的流向，即 Controller 依赖于 Service。
- IOC 容器负责管理所有的 Service 实例以及它们之间的依赖关系。当应用启动时，IOC 容器会根据 Module 的定义，自动创建 Service 的实例，并将它们注入到对应的 Controller 中。

#### 值提供者：useValue

useValue 语法可以注入常量值、引入外部库或者用模拟对象替换真实对象。

```typescript
import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
const mockUsersService = {
  create() {
    return "创建成功模拟对象";
  },
};
@Module({
  controllers: [UsersController],
  providers: [{ provide: UsersService, useValue: mockUsersService }],
})
export class UsersModule {}
```

![image (1).png](https://imgbed.cj.abrdns.com/file/1766995442908_image__1_.png)

在 mudules 文件中创建一个模拟 service,并使用 useValue 进行绑定。这是 userService 会解析为 mockUsersService。

这时使用 get 请求调用 findAll 方法，会报错。这可以证明 mockUsersService 已经完全替换了原来 UsersService。

![image (2).png](https://imgbed.cj.abrdns.com/file/1766995543224_image__2_.png)

![image (3).png](https://imgbed.cj.abrdns.com/file/1766995576804_image__3_.png)

#### <font style="color:rgb(21, 21, 21);background-color:rgb(253, 253, 253);">非基于类的提供者令牌</font>

看文档没明白，暂时放一放

---
