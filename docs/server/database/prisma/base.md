Prisma 是一个现代化的数据库工具，通常用于与 JavaScript/TypeScript 项目集成。它能大幅简化数据库操作，特别是在构建全栈应用时。以下是 Prisma 的主要功能和优势：

1. **主要功能**

- **ORM**：提供类型安全的数据库查询，同时支持复杂的关系查询。
- **Schema 管理**：通过 Prisma Schema 定义数据库模型，可以自动生成数据库迁移。
- **代码生成**：自动生成类型化的数据库客户端，支持更快的开发和减少错误。
- **多数据库支持**：支持多种数据库，如 PostgreSQL、MySQL、SQLite、MongoDB 和 Microsoft SQL Server。

2. **核心组件**

- **Prisma Client**：用于在应用中执行数据库查询，类型安全且支持自动补全。
- **Prisma Migrate**：管理数据库模式的迁移工具。
- **Prisma Studio**：一个直观的 Web 界面，用于浏览和操作数据库数据。

3. **使用场景**

- 构建全栈应用（如使用 Next.js）。
- 替代传统 ORM 工具（如 Sequelize 或 TypeORM）。
- 在 TypeScript 项目中进行安全且高效的数据库操作。

## 创建项目

1. 创建一个空文件夹

```bash
npm init -y
npm install prisma typescript tsx @types/node --save-dev
```

2. 初始化TypeScript

   ```bash
   npx tsc --init npx tsc -- 初始化
   ```

   这条命令会完成两个操作：

   - 创建一个名为 `prisma` 的新目录，其中包含一个名为 `schema.prisma` 的文件，该文件包含 Prisma 架构以及数据库连接变量和架构模型
   - 在项目的根目录中创建 [`.env` 文件](https://www.prisma.io/docs/orm/more/development-environment/environment-variables/env-files)，该文件用于定义环境变量（例如数据库连接）

3. 初始化prisma

   ```bash
   npx prisma init
   ```

## 连接数据库

首先在`schema.prisma`文件中可以看到

```bash
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

`provider`根据数据库类型进行更改，例：`mysql`

`url`则是数据库连接地址，可以在.env中进行修改

![image-20241125163209658](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241125163209658.png)

其他参数：

![image-20241125164246802](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241125164246802.png)

测试是否可以连接成功

```bash
npx prisma db pull
```

该命令会尝试连接到数据库，并拉取现有数据库的结构。

如果数据库是空的会返回：

```bash
Error: 
P4001 The introspected database was empty:
```

不是空的则会返回：

```bash
✔ Your database schema was successfully fetched.
```

两种情况都能说明数据库连接成功。

## 创建数据库模型

```ts
//schema.prisma
model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String   @db.VarChar(255)
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  user   User    @relation(fields: [userId], references: [id])
  userId Int     @unique
}

model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  posts   Post[]
  profile Profile?
}
```

执行`prisma migrate` CLI 命令

```bash
npx prisma migrate dev --name init
```

此命令执行两项操作：

1. 它为此次迁移创建一个新的 SQL 迁移文件。
2. 它针对数据库运行 SQL 迁移文件。

![image-20241125170039014](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241125170039014.png)

![image-20241125170142736](https://cdn.jsdelivr.net/gh/cjy1998/imagesbed/img/image-20241125170142736.png)

## 增删改查操作

在根目录新建`index.ts`文件，在该目录实现增删改查操作。

### 新增

```ts
//index.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.user.create({
        data: {
            name: 'Alice',
            email: 'alice@prisma.io',
            posts: {
                create: { title: 'Hello World' },
            },
            profile: {
                create: { bio: 'I like turtles' },
            },
        },
    })

    const allUsers = await prisma.user.findMany({
        include: {
            posts: true,
            profile: true,
        },
    })
    console.dir(allUsers, { depth: null })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
```

使用`npx tsx index.ts`命令运行

### 修改

新增`edit`函数，结尾改为运行`edit()`函数，其它不做修改

```ts
//index.ts
//修改
async function edit() {
    const user = await prisma.user.update({ where: { id: 1 }, data: { name: '张三' } })
    console.log('====================================');
    console.log(user);
    console.log('====================================');
}
```

### 删除

执行删除操作前，在新增一条数据。

```ts
// 新增
async function add() {
    await prisma.user.create({
        data: {
            name: '李四',
            email: 'lisi@prisma.io',
            posts: {
                create: { title: 'Hello World' },
            },
            profile: {
                create: { bio: 'I like turtles' },
            },
        },
    })

    const allUsers = await prisma.user.findMany({
        //include 选项传递给 findMany，它告诉 Prisma Client 在返回的 User 对象上包含 posts 和 profile 关系
        include: {
            posts: true,
            profile: true,
        },
    })
    console.dir(allUsers, { depth: null })
}
```

在`schema.prisma`文件中设置`级联删除操作`

```ts
model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String   @db.VarChar(255)
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id],onDelete: Cascade)// 配置级联删除
  authorId  Int
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  user   User    @relation(fields: [userId], references: [id],onDelete: Cascade)// 配置级联删除
  userId Int     @unique
}
```

`onDelete: Cascade` 表示当用户被删除时，关联的所有 `Post、Profile` 记录也会被删除。

重新应用迁移

```bash
npx prisma migrate dev --name add_cascade_delete
```

除了 `onDelete: Cascade`，Prisma 支持以下几种行为：

| 选项              | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| `Cascade`         | 删除父记录时，自动删除所有相关子记录。                       |
| `SetNull`         | 删除父记录时，将子记录中的外键字段设置为 `NULL`。            |
| `Restrict` (默认) | 如果有子记录引用父记录，则禁止删除父记录，避免违反外键约束。 |
| `NoAction`        | 不做任何操作，由数据库决定行为（类似 `Restrict`，但更灵活）。 |

```ts
//index.ts
//删除
async function removeUserById(id: number) {
    await prisma.user.delete({ where: { id } })
}
removeUserById(2)
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
```

### 查询

查询一下是否已完成删除操作

```ts
// 查询
async function findAllUser() {
    const allUsers = await prisma.user.findMany({
        include: {
            profile: true,
            posts: true
        }
    })
    console.log(allUsers);
}
```

删除成功，输出结果如下:

```bash
[
  {
    id: 1,
    email: 'alice@prisma.io',
    name: '张三',
    profile: { id: 1, bio: 'I like turtles', userId: 1 },
    posts: [ [Object] ]
  }
]
```

