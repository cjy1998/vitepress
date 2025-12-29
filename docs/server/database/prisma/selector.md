---
outline: deep
---

# 筛选条件和操作符总结

### 1. 等于**`equals`**

```tsx
/**
 * 等于
 */
// const queryEqual = async () => {
//   const res = await prisma.user.findFirst({
//     where: {
//       name: {
//         equals: "张三",
//       },
//     },
//   });
//   console.log(res);
// };
const queryEqual = async () => {
  const res = await prisma.user.findFirst({
    where: {
      name: "张三",
    },
  });
  console.log(res);
};
```

查找将 favoriteColors 字段设置为 ['blue', 'green'] 的用户，使用等号时，元素的顺序很重要。也就是说，['蓝'、'绿'] 不等于 ['绿'、'蓝']。

```tsx
const favoriteColorFriends = await prisma.user.findMany({
  where: {
    favoriteColors: {
      equals: ["blue", "green"],
    },
  },
});
```

### 2. 不等于**`not`**

```tsx
const queryNot = async () => {
  const res = await prisma.user.findMany({
    where: {
      name: {
        not: "张三",
      },
    },
  });
  console.log(res);
};
```

<aside>
💡

not 将返回所有与给定值不匹配的项目。但是，如果列是可空的，则不会返回 NULL 值。如果需要返回空值，请使用 OR 操作符包含 NULL 值。

</aside>

```tsx
const queryNot = async () => {
  const res = await prisma.user.findMany({
    where: {
      OR: [{ name: { not: "Bob" } }, { name: null }],
    },
  });
  console.log(res);
};
```

### **3. 包含 `in`**

<aside>
💡

不会返回空值

</aside>

查询姓名为"张三", "Bob”

```tsx
const queryIn = async () => {
  const res = await prisma.user.findMany({
    where: {
      name: {
        in: ["张三", "Bob"],
      },
    },
  });
  console.log(res);
};
```

NOT 和 in 结合

```tsx
const queryNotIn = async () => {
  const res = await prisma.user.findMany({
    where: {
      NOT: {
        name: {
          in: ["张三", "Bob"],
        },
      },
    },
  });
  console.log(res);
};
```

### **4. 不包含`notIn`**

```tsx
const querynotin = async () => {
  const res = await prisma.user.findMany({
    where: {
      name: {
        notIn: ["张三", "Bob"],
      },
    },
  });
  console.log(res);
};
```

### 5. 小于**`lt`**

```tsx
const queryLt = async () => {
  const res = await prisma.user.findMany({
    where: {
      AND: [
        {
          posts: {
            every: {
              likes: {
                lt: 102,
              },
            },
          },
        },
        {
          posts: {
            some: {}, // 确保用户至少有一个 post
          },
        },
      ],
    },
    include: {
      posts: true,
    },
  });
  console.log(res);
};
```

### **6. 小于等于 `lte`**

### **7. 大于 `gt`**

### 8. 大于等于 **`gte`**

### 9. 包含**`contains`**

```tsx
const queryContains = async () => {
  const res = await prisma.user.findMany({
    where: {
      name: {
        contains: "Prisma",
      },
    },
  });
  console.log(res);
};
```

```tsx
const queryNotContains = async () => {
  const res = await prisma.user.findMany({
    where: {
      NOT: {
        name: {
          contains: "Prisma",
        },
      },
    },
  });
  console.log(res);
};
```

### 10. 开始于 **`startsWith`**

```tsx
const queryStartsWith = async () => {
  const res = await prisma.user.findMany({
    where: {
      name: {
        startsWith: "张",
      },
    },
  });
  console.log(res);
};
```

### 11. 结束于**`endsWith`**

```tsx
const queryEndsWith = async () => {
  const res = await prisma.user.findMany({
    where: {
      name: {
        endsWith: "三",
      },
    },
  });
  console.log(res);
};
```

### 12.**`AND`**

```tsx
const result = await prisma.post.findMany({
  where: {
    AND: [
      {
        content: {
          contains: "Prisma",
        },
      },
      {
        published: {
          equals: false,
        },
      },
    ],
  },
});
```

### 13.**`OR`**

```tsx
const result = await prisma.post.findMany({
  where: {
    OR: [
      {
        title: {
          contains: "Prisma",
        },
      },
      {
        title: {
          contains: "databases",
        },
      },
    ],
  },
});
```

### 14.**`NOT`**

```tsx
const result = await prisma.post.findMany({
  where: {
    NOT: {
      title: {
        contains: "SQL",
      },
    },
  },
});
```

### 15.**`some`**

返回**一个或多个**（“一些”）*相关*记录符合过滤条件的所有记录。

```tsx
const result = await prisma.user.findMany({
  where: {
    post: {
      some: {
        content: {
          contains: "Prisma"
        }
      }
    }
  }
}
```

### 16. **`every`**

**返回所有**（“每个”）*相关*记录符合过滤条件的所有记录。

```tsx
const result = await prisma.user.findMany({
  where: {
    post: {
      every: {
        published: true
      },
    }
  }
}
```

### 17.**`none`**

返回所有符合过滤条件**且无** *相关*记录的记录。

```tsx
const result = await prisma.user.findMany({
  where: {
    post: {
        none: {} // User has no posts
    }
  }
}
```

### 18.**`is`**

返回相关记录符合过滤条件的所有记录（例如，用户的名字`is`Bob）

```tsx
const result = await prisma.post.findMany({
  where: {
    user: {
        is: {
          name: "Bob"
        },
    }
  }
}
```

### 19.**`isNot`**

返回相关记录不符合过滤条件的所有记录（例如，用户的名字`isNot`Bob）。

```tsx
const result = await prisma.post.findMany({
  where: {
    user: {
        is: {
          name: "Bob"
        },
    }
  }
}
```
