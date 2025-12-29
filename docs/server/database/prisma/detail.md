---
lastUpdated: 2025-08-04 17:19
outline: deep
---

# Prisma 详细使用

![image.png](https://imgbed.cj.abrdns.com/file/1766991400178_image.png)

### 基本使用

```tsx
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User?   @relation(fields: [authorId], references: [id])
  authorId  Int?
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}
```

- **datasource db**：数据源，指定数据库连接（通过环境变量）
- **generator client**：生成器，表示要生成 Prisma Client
- **model**：数据模型定义，定义应用程序模型（每个数据源的数据形状）及其关系。

`prisma generate`：从 Prisma 模式中读取*上述所有*信息以生成正确的数据源客户端代码（例如 Prisma 客户端）。

### **Generators(生成器)**

prisma 模式可以有一个或多个生成器，示例

```tsx
generator client {
provider = "prisma-client-js"
output   = "./generated/prisma-client-js"
}
```

prisma client 有两个生成器:

1. prisma-client-js：将 prisma client 生成到 node_modules 中。

   `prisma-client-js`  是 Prisma ORM 6.X 版本及更早版本的默认生成器。它需要  `@prisma/client` npm 包，并将 Prisma 客户端生成到  `node_modules`。

2. prisma-client（新）：更新、更灵活的  `prisma-client-js`  版本，支持 ESM;它输出纯 TypeScript 代码， *并需要*自定义`输出`路径。

   新的  `prisma-client`  生成器在不同的 JavaScript 环境（例如 ESM、Bun、Deno 等）中使用 Prisma ORM 时提供了更大的控制和灵活性。
   它将 Prisma Client 生成到应用程序代码库中的自定义目录中，该目录通过`生成器`块上的`输出`字段指定。这使您可以完全了解和控制生成的代码。它还将生成的 Prisma 客户端库[拆分为](https://www.prisma.io/docs/orm/prisma-schema/overview/generators#output-splitting-and-importing-types)多个文件。

   ```tsx
   generator client {
   // Required
   provider = "prisma-client"
   output   = "../src/generated/prisma"

   // Optional
   runtime                = "nodejs"
   moduleFormat           = "esm"
   generatedFileExtension = "ts"
   importFileExtension    = "ts"
   }
   ```

   | option                 | default    | Description                                                                                                                                           |
   | ---------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
   | \*output               |            | 生成 Prisma Client 的目录，例如  `../src/generated/prisma`  中。                                                                                      |
   | runtime                | nodejs     | 运行时环境，支持`nodejs` (alias `node`), `deno`, `bun`, `deno-deploy`, `workerd` (alias `cloudflare`), `edge-light` (alias `vercel`), `react-native`. |
   | moduleFormat           | 从环境推断 | 模块格式（`esm`  或  `cjs`）。确定是使用  `import.meta.url`  还是  `__dirname`。                                                                      |
   | generatedFileExtension | ts         | 生成的 TypeScript 文件（`ts`、`mts`、`cts`）的文件扩展名。                                                                                            |
   | importFileExtension    | 从环境推断 | **import 语句**中使用的文件扩展名。可以是  `ts`、`mts`、`cts`、`js`、`mjs`、`cjs`  或空（对于裸导入）                                                 |

### Data Model

1. 定义模型

   ```tsx
   model User {
     id      Int      @id @default(autoincrement())
     email   String   @unique
     name    String?
     role    Role     @default(USER)
     posts   Post[]
     profile Profile?
   }

   model Profile {
     id     Int    @id @default(autoincrement())
     bio    String
     user   User   @relation(fields: [userId], references: [id])
     userId Int    @unique
   }

   model Post {
     id         Int        @id @default(autoincrement())
     createdAt  DateTime   @default(now())
     updatedAt  DateTime   @updatedAt
     title      String
     published  Boolean    @default(false)
     author     User       @relation(fields: [authorId], references: [id])
     authorId   Int
     categories Category[]
   }

   model Category {
     id    Int    @id @default(autoincrement())
     name  String
     posts Post[]
   }

   enum Role {
     USER
     ADMIN
   }
   ```

   ![image 1.png](https://imgbed.cj.abrdns.com/file/1766991445144_image_1.png)

   ```tsx
   model Comment {
     // Fields

     @@map("comments")
     myField @map("my_field")
   }
   ```

   将 Prisma 模式模型名称映射到具有不同名称的表（关系数据库）或集合 （MongoDB），或将枚举名称映射到数据库中的不同底层枚举。如果不使用  `@@map`，则模型名称与表（关系数据库）或集合（MongoDB）名称完全匹配。

   `@map`  和  `@@map`  允许通过将模型和字段名称与底层数据库中的表和列名称对应。

   [字段类型与数据库字段类型对照表](https://www.prisma.io/docs/orm/reference/prisma-schema-reference#model-fields)

   @id 、@default、@unique、@@unique、@@id、@@index

   ```tsx
   model User {
     id        Int     @id @default(autoincrement())
     firstName String
     lastName  String
     email     String  @unique //唯一
     isAdmin   Boolean @default(false)

   	// firstName+lastName是唯一的
     @@unique([firstName, lastName])
     // 定义多列索引
      @@index([firstName , lastName])
   }
   ```

   ```tsx
   model User {
     firstName String
     lastName  String
     email     String  @unique
     isAdmin   Boolean @default(false)
   	//用户 ID 由 firstName 和 lastName 字段的组合表示
     @@id([firstName, lastName])
   //  @@id(name: "fullName", fields: [firstName, lastName])
   }
   ```

2. 定义关系

   在 Prisma 架构中，外键/主键关系由  `author`  字段上的  `@relation`  属性表示：

   ```tsx
   author     User        @relation(fields: [authorId], references: [id])
   ```

   1. 一对一

      ```tsx
      model User {
        id      Int      @id @default(autoincrement())
        profile Profile?
      }

      model Profile {
        id     Int  @id @default(autoincrement())
        user   User @relation(fields: [userId], references: [id])
        userId Int  @unique // relation scalar field (used in the `@relation` attribute above)
      }
      ```

   2. 一对多
   3. 多对多

### Prisma Client

初始化项目

```bash
bun init -y
bun add prisma
bunx prisma
bunx prisma init --datasource-provider mysql --output ../generated/prisma
bun add @prisma/client
```

初始化模型

```tsx

//schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
  runtime  = "bun"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model UserTest {
  id       String @id @default(uuid())
  name     String @map("user_name")
  email    String @unique
  password String @default("123456")

  @@map("user_test")
}

model User {
  id           String           @id @default(uuid())
  name         String?
  email        String           @unique
  profileViews Int              @default(0)
  role         Role             @default(USER)
  profile      ExtendedProfile?
  posts        Post[]
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  deletedAt    DateTime?
}

model ExtendedProfile {
  id        String    @id @default(uuid())
  biography String?
  user      User      @relation(fields: [userId], references: [id])
  userId    String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
}

model Post {
  id         String     @id @default(uuid())
  title      String
  published  Boolean    @default(true)
  comments   Json?
  views      Int        @default(0)
  likes      Int        @default(0)
  categories Category[]
  author     User       @relation(fields: [authorId], references: [id])
  authorId   String     @unique
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  deletedAt  DateTime?
}

model Category {
  id    String @id @default(uuid())
  name  String
  posts Post[]
}

enum Role {
  USER
  ADMIN
}
```

生成函数并生成迁移文件、同步数据库

```tsx
bunx prisma generate
bunx prisma migrate dev "init"
```

初始化 PrismaClient

```tsx
// /lib/initPrisma.ts
import { PrismaClient, Prisma } from "../generated/prisma/client.ts";

const prisma = new PrismaClient({
  log: ["query"],
});

export { Prisma, prisma };
```

1.  新增

    - 新增一条记录

      ```tsx
      import prisma from "./lib/initPrisma.ts";

      const createUser = async () => {
        const res = await prisma.user.create({
          data: {
            email: "123456@qq.com",
            name: "张三",
          },
        });
        console.log(res);
      };

      createUser();
      ```

      嵌套插入（使用 create），并返回指定字段

      ```tsx
      const create = async () => {
        const res = await prisma.user.create({
          data: {
            name: "王二",
            email: "784545@123.com",
            profile: {
              create: {
                biography: "我是王二,大王的王,一二的二",
              },
            },
            posts: {
              create: [
                {
                  title: "唐诗三百首",
                  categories: {
                    create: {
                      name: "文学",
                    },
                  },
                },
                {
                  title: "史记",
                  categories: {
                    create: {
                      name: "历史",
                    },
                  },
                },
              ],
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                biography: true,
              },
            },
            posts: {
              select: {
                id: true,
                title: true,
                categories: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });
        console.log(res);
      };
      ```

      嵌套插入（使用 createMany）

      ```tsx
      const createMany = async () => {
        const res = await prisma.user.create({
          data: {
            name: "李白",
            email: "123456@libai.com",
            posts: {
              createMany: {
                data: [
                  {
                    title: "将进酒",
                  },
                  {
                    title: "蜀道难",
                  },
                  {
                    title: "行路难",
                  },
                ],
              },
            },
          },
          include: {
            posts: true,
          },
        });
        console.log(res);
      };
      ```

      | **特点**         | **`create`** | **`createMany`** | **说明**                                                                                                                     |
      | ---------------- | ------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
      | 支持嵌套附加关系 | ✔            | ✘ \*             | 例如，可以在一个查询中为每个帖子创建一个用户、多个帖子和多个评论。可以在 has-one 关系中手动设置外键 - 例如：`{ authorId: 9}` |
      | 支持 1-n 关系    | ✔            | ✔                | 例如，可以创建一个用户和多个帖子（一个用户拥有多个帖子）                                                                     |
      | 支持 m-n 关系    | ✔            | ✘                | 例如，可以创建一个帖子和多个类别（一个帖子可以有多个类别，一个类别可以有多个帖子）                                           |
      | 支持跳过重复记录 | ✘            | ✔                | 使用 skipDuplicates 查询选项。                                                                                               |

    - 新增时连接多个或单个记录
      ```tsx
      const createuser = async () => {
        const res = await prisma.user.create({
          data: {
            name: "杜甫",
            email: "12345@dufu.com",
            posts: {
              connect: [
                { id: "09110329-b0f6-4213-adb1-9817dced8265" },
                { id: "6b993eea-2b70-4c1d-815c-ef2169c4d151" },
              ],
            },
            // 连接多个记录
            // posts: {
            //  connect: {
            //   id: 11,
            // },
          },
          include: {
            posts: true,
          },
        });
      };
      ```
    - 连接或创建记录
      当要关联的记录不存在时，创建该记录
      ```tsx
      const createOrConnect = async () => {
        const res = await prisma.post.create({
          data: {
            title: "格林童话",
            author: {
              connectOrCreate: {
                where: {
                  email: "gelin@123.com",
                },
                create: {
                  name: "gelin",
                  email: "gelin@123.com",
                },
              },
            },
            categories: {
              connectOrCreate: {
                where: {
                  name: "文学",
                },
                create: {
                  name: "文学",
                },
              },
            },
          },
          include: {
            author: true,
            categories: true,
          },
        });
        console.log(res);
      };
      ```
    - 新增多条记录，并跳过唯一字段重复数据
        <aside>
        💡
        
         MongoDB、SQLServer 或 SQLite 不支持 skipDuplicates。
        
        </aside>
        
        ```tsx
        /**
         * 创建多条
         */
        
        const createManyUser = async (data: Array<Prisma.UserCreateInput>) => {
          const res = await prisma.user.createMany({
            data,
            skipDuplicates: true,
          });
          console.log(res);
        };
        
        createManyUser([
          { name: "Bob", email: "bob@prisma.io" },
          { name: "Bobo", email: "bob@prisma.io" },
          { name: "Yewande", email: "yewande@prisma.io" },
          { name: "Angelique", email: "angelique@prisma.io" },
        ]);
        ```

    - 创建并返回多条
        <aside>
        💡
        
        Prisma ORM 5.14.0 及更高版本可为 PostgreSQL、CockroachDB 和 SQLite 提供此功能。
        
        </aside>
        
        ```tsx
        const users = await prisma.user.createManyAndReturn({
          data: [
            { name: 'Alice', email: 'alice@prisma.io' },
            { name: 'Bob', email: 'bob@prisma.io' },
          ],
        })
        ```

2.  删除

    - 删除单条
      ```tsx
      const deleteUser = await prisma.user.delete({
        where: {
          email: "bert@prisma.io",
        },
      });
      ```
    - 删除多条
      ```tsx
      const deleteUsers = await prisma.user.deleteMany({
        where: {
          email: {
            contains: "prisma.io",
          },
        },
      });
      ```
    - 删除所有
      ```tsx
      const deleteUsers = await prisma.user.deleteMany({});
      ```
    - 级联删除
        <aside>
        💡
        
        - 使关系可选：
            
            ```tsx
            model Post {
              id       Int   @id @default(autoincrement())
              author   User? @relation(fields: [authorId], references: [id])
              authorId Int?
              author   User  @relation(fields: [authorId], references: [id])
              authorId Int
            }
            ```
            
        - 在删除用户之前，将帖子的作者更改为另一个用户。
        - 使用事务中的两个单独的查询删除用户及其所有帖子（所有查询都必须成功）
        </aside>
        
        ```tsx
        // 删除文章
        const delPost = prisma.post.deleteMany({
          where: {
            authorId: id,
          },
        });
        // 删除用户
        const delUser = prisma.user.delete({
          where: {
            id,
          },
        });
        // 级联删除
        const deleteCascadingUser = async () => {
          await prisma.$transaction([delPost, delUser]);
        };
        ```
        
        `$transaction`对每个模型表执行级联删除，因此必须按顺序调用它们。

    - 删除所有相记录（物理删除）
      ```tsx
      // 删除所有相关记录
      const deleteManyRelated = async () => {
        const res = await prisma.user.update({
          where: {
            email: "gelin1@123.com",
          },
          data: {
            posts: {
              deleteMany: {},
            },
          },
          include: {
            posts: true,
          },
        });
        console.log(res);
      };
      ```
    - 删除特定记录
      ```tsx
      // 删除特定相关记录
      const deleteRelated = async () => {
        const res = await prisma.user.update({
          where: {
            email: "gelin@123.com",
          },
          data: {
            posts: {
              deleteMany: {
                title: "格林童话",
              },
            },
          },
          include: {
            posts: true,
          },
        });
        console.log(res);
      };
      ```

3.  修改

    - 修改单条
        <aside>
        💡
        
        后续可以使用中间件进行判断用户是否存在
        
        </aside>
        
        ```tsx
        // 更新单条数据
        const updateUser = async (id: string) => {
          const user = await prisma.user.findUnique({
            where: {
              id,
            },
          });
          if (!user) {
            throw new Error("用户不存在");
          }
          const res = await prisma.user.update({
            where: {
              id,
            },
            data: {
              name: "李四",
            },
          });
          console.log(res);
        };
        ```

    - 修改多条
      ```tsx
      // 更新多条数据
      const updateManyUser = async () => {
        const res = await prisma.post.updateMany({
          where: {
            published: true,
          },
          data: {
            published: false,
          },
        });
        console.log(res);
      };
      ```
    - 更新并返回多条
        <aside>
        💡
        
        此功能在 Prisma ORM 版本 6.2.0 及更高版本中适用于 PostgreSQL、CockroachDB 和 SQLite。
        
        </aside>
        
        ```tsx
        const users = await prisma.user.updateManyAndReturn({
          where: {
            email: {
              contains: 'prisma.io',
            }
          },
          data: {
            role: 'ADMIN'
          }
        })
        ```

    - 更新或创建
        <aside>
        💡
        
        - 如果记录不存在则创建该记录，存在则修改。
        - Prisma 客户端没有`findOrCreate()`查询。您可以使用`upsert()`它来解决这个问题。要使其`upsert()`行为像`findOrCreate()`方法一样，请为 提供一个空`update`参数`upsert()`。
        - `upsert()`相对于`findOrCreate()`局限性在于，`upsert()`仅接受条件中唯一的模型字段。
        </aside>
        
        ```tsx
        // 更新或创建
        const updateOrCreateUser = async () => {
          const res = await prisma.user.upsert({
            where: {
              email: "18839362310@163.com",
            },
            update: {
              name: "王五",
            },
            create: {
              email: "18839362310@163.com",
              name: "王五",
            },
          });
          console.log(res);
        };
        ```

    - 更新数字
      ```tsx
      // 更新数字
      const updateNumber = async (authorId: string) => {
        const res = await prisma.post.updateMany({
          // where: {
          //   authorId,
          // },
          data: {
            likes: {
              // +1
              // increment: 1,
              // -1
              decrement: 1,
            },
            views: {
              // *2
              // multiply: 2,
              // /2
              divide: 2,
            },
          },
        });
        console.log(res);
      };
      ```
    - 更新所有相关记录
      ```tsx
      const updateRelated = async () => {
        const res = await prisma.user.update({
          where: {
            email: "gelin1@123.com",
          },
          data: {
            posts: {
              updateMany: {
                where: {
                  published: true,
                },
                data: {
                  likes: {
                    increment: 10,
                  },
                },
              },
            },
          },
          include: {
            posts: true,
          },
        });
      };
      ```
    - 更新特定相关记录
      ```tsx
      // 更新特定相关记录
      const updateRelatedPost = async () => {
        const res = await prisma.user.update({
          where: {
            email: "gelin@123.com",
          },
          data: {
            posts: {
              update: {
                where: {
                  id: "6aacf388-22ea-4c25-83cb-68f8620d12f7",
                },
                data: {
                  views: {
                    increment: 100,
                  },
                },
              },
            },
          },
        });
        console.log(res);
      };
      ```
    - 将新的相关记录添加到现有记录
      ```tsx
      const addRelatedPost = async () => {
        const res = await prisma.user.update({
          where: {
            email: "gelin@123.com",
          },
          data: {
            posts: {
              createMany: {
                data: [
                  {
                    title: "寓言故事",
                  },
                  {
                    title: "一千零一夜",
                  },
                ],
              },
            },
          },
          include: {
            posts: true,
          },
        });
        console.log(res);
      };
      ```

4.  查询

        - 通过 id 或唯一标识获取记录

          ```tsx
          const queryUserByEmailOrId = async (id: Prisma.UserWhereUniqueInput) => {
            const res = await prisma.user.findUnique({
              where: id,
              include: {
                posts: true,
              },
            });
            console.log(res);
          };

          // queryUserByEmailOrId({
          //   email: "elsa@prisma.io",
          // });
          queryUserByEmailOrId({
            id: "5e312e2b-9306-44f0-8b92-7b540422c7cd",
          });
          ```

        - 查询所有记录

          ```tsx
          /**
           * 获取所有记录
           */

          const queryAllUser = async () => {
            const res = await prisma.user.findMany();
            console.log(res.length);
          };

          queryAllUser();
          ```

        - 偏移分页
          下面的查询会跳过前 3 条记录，并返回第 4 - 7 条记录：

          ```tsx
          const results = await prisma.post.findMany({
            skip: 3,
            take: 4,
          });
          ```

          ![image 2.png](https://imgbed.cj.abrdns.com/file/1766991585584_image_2.png)

          ```tsx
          /**
           * 获取所有记录
           */
          type pageInfo = {
            pageSize?: number;
            pageNumber: number;
          };
          const queryAllUser = async ({
            pageSize = 10,
            pageNumber = 1,
          }: pageInfo) => {
            const res = await prisma.user.findMany({
              skip: (pageNumber - 1) * pageSize,
              take: pageSize,
              orderBy: {
                // 降序
                createdAt: "desc",
              },
            });
            console.log(res);
          };

          queryAllUser({
            pageSize: 2,
            pageNumber: 3,
          });
          ```

        - 符合条件的第一条记录
          ```tsx
          /**
           * 按降序返回至少有一篇帖子获得超过 100 个赞的第一个用户
           */
          const queryFirstUser = async () => {
            const res = await prisma.user.findFirst({
              where: {
                posts: {
                  some: {
                    likes: {
                      gt: 100,
                    },
                  },
                },
              },
              include: {
                posts: true,
              },
              //按 ID 降序排列用户（最大者优先）--最大的 ID 是最近的 ID
              orderBy: {
                id: "desc",
              },
            });
            console.log(res);
          };
          queryFirstUser();
          ```
        - 过滤和排序
          以 [prisma.io](http://prisma.io/) 结尾的电子邮件地址，以及至少一个已发布的文章（关系查询），返回符合条件的所有用户包括该用户已发布的文章。
          ```tsx
          /**
           * 筛选
           */
          const queryFilter = async () => {
            const res = await prisma.user.findMany({
              where: {
                email: {
                  endsWith: "@prisma.io",
                },
                posts: {
                  some: {
                    published: true,
                  },
                },
              },
              include: {
                posts: {
                  where: {
                    published: true,
                  },
                },
              },
            });
            console.log(res);
          };
          queryFilter();
          ```
          [筛选条件和操作符总结](Prisma/%E7%AD%9B%E9%80%89%E6%9D%A1%E4%BB%B6%E5%92%8C%E6%93%8D%E4%BD%9C%E7%AC%A6%E6%80%BB%E7%BB%93%2024d1efd275db805db2b2ebf41bff049e.md)
        - 选择字段

          1.  select
              返回特定字段
              `tsx

    const selectPost = async () => {
    const res = await prisma.post.findMany({
    where: {
    published: false,
    },
    select: {
    id: true,
    title: true,
    author: {
    select: {
    name: true,
    id: true,
    },
    },
    published: true,
    },
    });
    console.log(res);
    };
    ` 2. omit

              从结果中排除特定字段

              ```tsx
              const selectPost = async () => {
                const res = await prisma.post.findMany({
                  where: {
                    published: false,
                  },
                  select: {
                    id: true,
                    title: true,
                    author: {
                      omit: {
                        deletedAt: true,
                        createdAt: true,
                        updatedAt: true,
                      },
                    },
                    published: true,
                  },
                });
                console.log(res);
              };
              ```

          3.  include

              包括关系

              ```tsx
              const selectPost = async () => {
                const res = await prisma.post.findMany({
                  where: {
                    published: false,
                  },
                  include: {
                    author: true,
                  },
                });
                console.log(res);
              };
              ```

          4.  \_count 统计

              ```tsx
              const countPost = async () => {
                const res = await prisma.user.findMany({
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    _count: {
                      select: {
                        posts: true,
                      },
                    },
                  },
                });
                console.log(res);
              };
              ```

5.  聚合、分组、汇总
    - 平均值 `aggregate`
      ```tsx
      const avg = async () => {
        const res = await prisma.post.aggregate({
          _avg: {
            likes: true,
          },
        });
        console.log(res);
      };
      ```
      ```tsx
      const avgTest = async () => {
        const res = await prisma.post.aggregate({
          _avg: {
            likes: true,
          },
          // 统计符合条件的数量
          _count: {
            likes: true,
          },
          where: {
            author: {
              email: "gelin1@123.com",
            },
          },
          orderBy: {
            likes: "desc",
          },
        });
        console.log(res);
      };
      ```
    - 分组`groupBy`
      ```tsx
      const groupByTest = async () => {
        const groupData = await prisma.post.groupBy({
          by: ["authorId"],
          _sum: {
            likes: true,
          },
          // 按聚合值筛选整个组，返回likes大于10的组
          having: {
            likes: {
              _sum: {
                gt: 10,
              },
            },
          },
        });
        const ids = groupData.map((item) => item.authorId) as string[];
        const userData = await prisma.user.findMany({
          where: {
            id: {
              in: ids,
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });
        const res = groupData.map((item) => {
          const user = userData.find((user) => user.id === item.authorId);
          return {
            ...item,
            user,
          };
        });
        console.log(res);
      };
      ```

### 软删除

```tsx
import { PrismaClient } from "./generated";

export * from "./generated";
export { PrismaClient } from "./generated";

// 防止 dev 环境多实例
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const prisma = new PrismaClient();
  return prisma.$extends({
    name: "soft-delete",
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          console.log(`[Prisma Query] ${model}.${operation}`, args);

          // -------------------------------
          // 查询类操作
          // -------------------------------
          type WithWhere<T> = T extends { where?: any } ? T : never;

          const queryOps = [
            "findUnique",
            "findFirst",
            "findMany",
            "count",
            "aggregate",
          ] as const;

          if (queryOps.includes(operation as any)) {
            const safeArgs = args as WithWhere<typeof args>;
            safeArgs.where = {
              ...safeArgs.where,
              deleteTime: null,
            };
            return query(safeArgs);
          }

          // delete → 转 update
          if (operation === "delete") {
            return (prisma as any)[model].update({
              ...(args as any),
              data: { deleteTime: new Date() },
            });
          }

          // deleteMany → 转 updateMany
          if (operation === "deleteMany") {
            return (prisma as any)[model].updateMany({
              ...(args as any),
              data: { deleteTime: new Date() },
            });
          }

          // 其他操作原样执行
          return query(args);
        },
      },
    },
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

### Migrate

#### **`prisma migrate dev`**

- **用途**：将  **Prisma Schema 的变更应用到数据库**（Schema-first 工作流）。
- **工作流方向**：**`Prisma Schema`** → **`数据库`**（代码优先）。
- **典型场景**：
  - 修改了 Prisma Schema（如新增模型、字段）。
  - 需要生成迁移文件并同步到数据库。
- **关键行为**：
  1. 根据 Schema 变更生成新的迁移文件（SQL）。
  2. 执行迁移文件，更新数据库结构。
  3. 触发  **`prisma generate`**  重新生成客户端代码。
- **适用场景**：从零构建项目或主动管理数据库结构变更（推荐新项目使用）。

---

#### **`prisma db pull`**

- **用途**：**从现有数据库反向生成 Prisma Schema**（Database-first 工作流）。
- **工作流方向**：**`数据库`** → **`Prisma Schema`**（数据库优先）。
- **典型场景**：
  - 数据库已存在（如旧项目接入 Prisma）。
  - 数据库结构被其他工具（如 SQL 客户端）修改后，需同步到 Prisma Schema。
- **关键行为**：
  1. 读取数据库当前结构（表、列、关系等）。
  2. 覆盖更新本地的  **`schema.prisma`**  文件。
  3. **不会**自动生成迁移文件或修改数据库。
- **适用场景**：基于已有数据库启动项目，或同步外部数据库变更。

---

**对比总结**

| **特性**               | **`prisma migrate dev`** | **`prisma db pull`**         |
| ---------------------- | ------------------------ | ---------------------------- |
| **方向**               | Prisma Schema → 数据库   | 数据库 → Prisma Schema       |
| **修改数据库**         | ✓（执行迁移）            | ✗（只读）                    |
| **修改 Prisma Schema** | ✗（需手动编辑 Schema）   | ✓（覆盖更新 Schema）         |
| **生成迁移文件**       | ✓                        | ✗                            |
| **适用工作流**         | Schema-first（代码优先） | Database-first（数据库优先） |
| **典型场景**           | 主动管理数据库变更       | 接入已有数据库               |

---

**使用建议**

- **新项目**：优先使用  **`prisma migrate dev`**  主动管理数据库变更。
- **已有数据库**：先用  **`prisma db pull`**  生成初始 Schema，后续变更可通过  **`migrate dev`**  或继续用  **`db pull`**  同步。
- **注意**：两者混用时需谨慎，避免 Schema 与数据库不同步（可通过  **`prisma migrate status`**  检查一致性）。

在生产环境中管理 Prisma 数据库模型变更时，**必须使用  `prisma migrate deploy`  命令**，而不是开发环境用的  **`prisma migrate dev`**  或  **`prisma db pull`**。以下是关键说明：

---

#### **生产环境正确命令：`prisma migrate deploy`**

bash

```
npx prisma migrate deploy
```

**作用：**

1. **应用所有未执行的迁移文件**（位于  **`prisma/migrations`**  目录中的 SQL 文件）。
2. 严格按迁移文件的顺序更新生产数据库结构。
3. **不生成新迁移文件**（开发阶段已完成）。
4. **不重置数据库**（安全无破坏性）。

---

**对比：`migrate dev` 与 `deploy`**

| **命令**                   | **生产环境风险**                                                 |
| -------------------------- | ---------------------------------------------------------------- |
| **`prisma migrate dev`**   | 可能重置数据库、生成新迁移文件，导致数据丢失或结构冲突。         |
| **`prisma db pull`**       | 会覆盖 Prisma Schema，但**不执行迁移**，导致数据库与代码不同步。 |
| **`prisma migrate reset`** | 清空数据库（仅限开发环境使用）。                                 |

---

#### **生产环境迁移流程（安全实践）**

1. **开发阶段**（本地）：

   bash

   ```
   npx prisma migrate dev# 生成迁移文件并测试
   ```

2. **代码审查**：
   - 将生成的 SQL 迁移文件（在  **`prisma/migrations/`**  目录）提交到 Git。
   - 通过 CI/CD 流程验证迁移。
3. **生产部署**：

   bash

   ```
   npx prisma migrate deploy#  安全应用迁移
   npx prisma generate# 更新客户端代码（如需）
   ```

---

#### **关键检查命令**

- **查看待执行的迁移**：
  bash
  ```
  npx prisma migrate status
  ```
- **生产环境迁移记录**：
  sql
  ```
  SELECT * FROM _prisma_migrations;# Prisma 创建的迁移元数据表
  ```

> 总结：
>
> **生产环境只用  `migrate deploy`**，它是专为安全、可追溯的数据库变更设计的命令。任何直接修改生产数据库 Schema 的操作（如手动执行 SQL 或使用  **`db pull`**）都会破坏 Prisma 迁移的版本一致性。

在 Prisma 工作流中，关于客户端代码生成的行为如下：

**1. `prisma migrate dev`：会自动生成客户端代码**

- 执行迁移后**自动触发** **`prisma generate`**
- 原因：开发环境中模型变更后需要立即更新客户端代码
- 使用场景：本地开发修改 schema 后，一条命令完成迁移 + 客户端更新

**2. `prisma migrate deploy`：不会自动生成客户端代码**

- 仅应用数据库迁移，**不会执行** **`prisma generate`**
- 原因：生产环境需分离数据库变更和应用部署
- 必须手动执行：**`npx prisma generate`**

---

#### **何时需要更新客户端代码？**

必须运行  **`prisma generate`**  的情况：

| **场景**                        | **必要性** | **示例**                         |
| ------------------------------- | ---------- | -------------------------------- |
| **Prisma Schema 发生变更**      | ✅ 必须    | 增删改模型/字段/关系             |
| **迁移应用到生产数据库后**      | ✅ 必须    | 执行完  **`migrate deploy`**  后 |
| **客户端依赖更新**              | ✅ 建议    | 升级  **`@prisma/client`**  版本 |
| **生成类型变更**                | ✅ 必须    | 修改  **`generator`**  配置      |
| **仅数据库变更（Schema 未改）** | ❌ 不需要  | 通过其他工具修改表结构           |

> 生产环境迁移后忘记  prisma generate  会导致应用使用过期的数据模型定义，引发运行时错误（如查询不存在的字段）。建议将生成命令加入部署脚本。
