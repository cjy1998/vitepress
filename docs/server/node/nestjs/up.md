# 编程思想

## FP（函数式编程）和 OOP（面向对象式编程）

### 函数式编程

1. 确定的数据输入、输出；没有副作用，相对独立。
2. 引用透明，对 IDE 友好，易于理解。
3. 如今主流的 Vue/React

### 面向对象编程

1. 抽象现实生活中的事物特性，对于理解友好。
2. 封装性、继承性、多态性。

### 函数式响应编程

1. 适合需要对事件流进行复杂组合应用的场景。
2. 响应式多用在异步的场景。
3. 典型案例：rxjs、广告推荐

## AOP（面向切面编程）

1. 拓展功能方便，不影响业务之间的逻辑。
2. 逻辑集中管理
3. 更有利于代码复用
4. AOP 能在不破坏封装功能的前提下额外增加功能。

## IOC（控制反转）和 DI（依赖注入）

IOC 是一种思想或设计模式，DI 是 IOC 的具体实现。

```typescript
import { Phone, DIStudent } from "./di";
class Iphone {
  playGame(name: string) {
    console.log(name + "play game");
  }
}
// Student => play => Iphone 强依赖关系
// Iphone依赖与Student解耦
class Student {
  constructor(private name: string) {}
  getName() {
    return this.name;
  }
  setName(name: string) {
    this.name = name;
  }

  play() {
    const iphone = new Iphone();
    iphone.playGame(this.name);
  }
}

class Android implements Phone {
  playGame(name: string) {
    console.log(name + "use android");
  }
}

const student1 = new DIStudent("tom", new Android());
student1.play();
```

```typescript
export interface Phone {
  playGame: (name: string) => void;
}

export class DIStudent {
  constructor(private name: string, private phone: Phone) {
    this.phone = phone;
    this.name = name;
  }
  getName() {
    return this.name;
  }
  setName(name: string) {
    this.name = name;
  }

  play() {
    this.phone.playGame(this.name);
  }
}
```

### 控制反转（Inversion of Control）

是一种面向对象编程中的一种设计原则，用来减低计算机代码之间的耦合度。其基本思想是：借助于第三方实现具有依赖关系的对象之间的解耦。

### 依赖注入（Dependency Injection）

是一种用于实现 IOC 的设计模式，它允许在类外创建依赖对象，并通过不同的方式将这些对象提供给类。

# Nestjs 用模块来组织代码

- 使用 Module 来组织应用程序
- @Module 装饰器来描述模块
- 模块中有 4 大属性：imports,providers,controllers,exports

![yuque_mind (1).jpeg](https://imgbed.cj.abrdns.com/file/1767058612199_yuque_mind__1_.jpeg)

# MVC

MVC 是一种软件架构模式。

![yuque_mind (1).jpeg](https://imgbed.cj.abrdns.com/file/1767058659826_yuque_mind__1_.jpeg)

# DTO 和 DAO

Data Transfer Object 数据传输对象

Data Access Object 数据访问对象，DAO 是一层逻辑：包含实体类、数据库操作（CURD）、数据校验、错误处理等。Nestjs 做了一层更高级的封装，通过 ORM 库与数据库对接，而这些 ORM 库就是 DAO 层。

## DTO VS DAO

请求 --> DTO <--> 逻辑 <--> DAO --> 数据库

              接受部分数据                对接数据库接口
          对数据进行筛选             不暴露数据库的内部信息
              不对应实体                    对应实体
              属性是小于等于实体

# ORM

## ORM 是什么?

ORM（Object Relational Mapping）对象关系映射，其主要作用是在编程中，把面向对象的概念跟数据库中的概念对应起来。

## ORM 特点

方便维护：数据模型定义在同一个地方，利于重构。

代码量少、对接多种库：代码逻辑更易懂。

工具多、自动化能力强：数据库删除关联数据、事务操作等。

## 常见的 ORM 库

knex,prisma,sequelize,typeorm

# Nestjs 核心概念

![yuque_mind (1).jpeg](https://imgbed.cj.abrdns.com/file/1767058707391_yuque_mind__1_.jpeg)

| Nest 概念           | 作用                       |
| ------------------- | -------------------------- |
| 控制器 Controllers  | 处理请求                   |
| 服务 Services       | 数据访问与核心逻辑         |
| 模块 Modules        | 组合所有的逻辑代码         |
| 管道 Pipes          | 核验请求的数据             |
| 过滤器 Filters      | 处理请求时的错误           |
| 守卫 Guards         | 鉴权与认证相关             |
| 拦截器 Interceptors | 给请求与响应加入额外的逻辑 |
| 存储库 Repositories | 处理在数据库中的数据       |

# 接口服务

![yuque_mind (1).jpeg](https://imgbed.cj.abrdns.com/file/1767058792505_yuque_mind__1_.jpeg)

# 生命周期

![yuque_mind (2).jpeg](https://imgbed.cj.abrdns.com/file/1767058833963_yuque_mind__2_.jpeg)

# 多环境配置

1. dotenv

[dotenv](https://www.npmjs.com/package/dotenv)

2. config

[config](https://www.npmjs.com/package/config)

# 日志

## 日志等级

- log:通用日志，按需进行记录（打印）
- Warning:警告日志，比如：尝试多次进行数据库操作
- Error：严重日志，比如：数据库异常
- Debug:调试日志，比如：加载数据日志
- Verbos：详细日志，所有的操作与详细信息（非必要不打印）

## 功能分类日志

- 错误日志：方便定位问题，给用户友好的提示。
- 调试日志：方便开发
- 请求日志：记录敏感行为

## 日志记录位置

- 控制台日志：方便监看（调试用）
- 文件日志：方便回溯与追踪（24 小时回滚）
- 数据库日志：敏感操作、敏感数据记录

|         | Log    | Error   | Warning     | Debug  | Verbose | API       |
| ------- | ------ | ------- | ----------- | ------ | ------- | --------- |
| Dev     | √      | √       | √           | √      | √       | ×         |
| Staging | √      | √       | √           | ×      | ×       | ×         |
| Prod    | √      | √       | ×           | ×      | ×       | √         |
| 位置    | 控制台 | 文件/DB | 控制台/文件 | 控制台 | 控制台  | 控制台/DB |

## 官方内置日志模块

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filters/http-exception.filtre";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, {
    // 关闭整个nestjs日志
    // logger: false
    // 显示的日志类型
    // logger: ['error', 'debug', 'log', 'warn']
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  const port = 3000;
  await app.listen(port);
  logger.warn(`App端口号：${port}`);
}
bootstrap();
```

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  Logger,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController {
  private logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {
    this.logger.log("UserController init");
  }
  @Get()
  findAll() {
    this.logger.log("请求失败");
  }
}
```

## 第三方日志模块

## pino

[Pino - Super fast, all natural JSON logger for Node.js](https://getpino.io/#/)

pino 和 nestjs 集成官方案例

[pino/docs/web.md at 1aacfd25646923902b556a73182c82e8aa68d7db · pinojs/pino](https://github.com/pinojs/pino/blob/HEAD/docs/web.md#nest)

## winston

[winston](https://www.npmjs.com/package/winston)

# 权限控制

## 前端权限控制

![image (4).png](https://imgbed.cj.abrdns.com/file/1767058886761_image__4_.png)

## 后端权限

![image (5).png](https://imgbed.cj.abrdns.com/file/1767058919226_image__5_.png)

![image (6).png](https://imgbed.cj.abrdns.com/file/1767058950304_image__6_.png)
