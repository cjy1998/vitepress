# Java 反射

## 什么是反射

Java 程序运行时，每个类（以及类里的方法、字段、构造器）本身也是一个对象，反射就是通过 **Class 对象** 在运行时读取类的结构、动态调用方法、动态读写字段。

一句话：**让程序在运行期"检查自己"和"操作自己"**。

## 获取 Class 对象的三种方式

```java
Class<?> c1 = Class.forName("java.lang.String"); // 按全类名(最常用, 用于运行时才知道类名的场景)
Class<?> c2 = "hello".getClass();                // 已有实例
Class<?> c3 = String.class;                      // 类字面量
```

三种方式拿到的是同一个 Class 对象（同一个类只有一个）。

## 常用 API

| 类别 | 方法 | 作用 |
|---|---|---|
| 类 | `getDeclaredMethods()` / `getDeclaredFields()` | 获取本类所有方法/字段（含私有、不含继承） |
| 类 | `getMethods()` / `getFields()` | 获取所有 public 方法/字段（含继承） |
| 类 | `getDeclaredMethod("方法名", 参数类型...)` | 获取某个指定方法 |
| 类 | `getDeclaredConstructor(参数类型...)` | 获取构造器，可用 `newInstance()` 创建对象 |
| 可访问性 | `setAccessible(true)` | 解除 private 访问限制 |
| 方法 | `method.invoke(对象, 参数...)` | 动态调用方法，返回 `Object` |
| 字段 | `field.get(对象)` / `field.set(对象, 值)` | 动态读写字段值 |

## 示例：反射调用私有方法

```java
Class<?> clazz = user.getClass();
Method add = clazz.getDeclaredMethod("add", int.class, int.class);
add.setAccessible(true);                    // 私有方法必须放开访问
Object result = add.invoke(user, 3, 5);     // 返回 Object, 需要强转
```

## 反射的应用场景

- **注解解析**：运行时通过 `isAnnotationPresent()` / `getAnnotation()` 读取注解 → 校验、日志、权限等功能
- **框架底层**：Spring 的 `@Component` / `@Autowired` 扫描与注入、MyBatis 的 Mapper 代理
- **动态代理**：JDK 动态代理就是反射 + 代理对象的结合，是 Spring AOP 的基础
- **通用工具**：对象转字符串、深拷贝、Bean 属性拷贝等

## 注意事项

1. **性能**：反射比直接调用慢，缓存 `Class` / `Method` / `Field` 对象可以显著优化
2. **破坏封装**：`setAccessible(true)` 能访问私有成员，会破坏封装性，慎用
3. **异常**：`invoke()` 会抛出 `InvocationTargetException`，真正的方法异常被包装在里面，需要 `getCause()` 获取
4. **安全隐患**：反射可以绕过访问控制，运行不可信代码时需注意

## 学习要点

反射是理解**自定义注解**和 **AOP 切面**的前提，属于纯 Java 知识，不依赖 Spring。
