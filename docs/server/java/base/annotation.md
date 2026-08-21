# 自定义注解

## 什么是注解

注解是**贴在代码上的标签**，可以携带一些数据（属性）。注解本身**不含任何逻辑**，只是声明，必须由解析者（反射、AOP 切面、编译期处理器）去读取它才会生效。

> 一句话：**注解是"死的"，要靠"反射"或"切面"来唤醒**。

## 定义语法

```java
import java.lang.annotation.*;

@Target(ElementType.METHOD)          // 元注解1: 这个注解能贴在哪
@Retention(RetentionPolicy.RUNTIME)  // 元注解2: 存活到哪个阶段
public @interface MyLog {
    String level() default "INFO";   // 属性 + 默认值
    boolean required() default false;
    int[] scopes() default {};       // 属性类型只能是基本类型/String/Class/枚举/注解/以上类型的数组
}
```

## 元注解

| 元注解        | 作用                             | 关键取值                                                                                                          |
| ------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `@Target`     | 注解能贴在哪                     | `TYPE`(类)、`FIELD`(字段)、`METHOD`(方法)、`PARAMETER`(参数)、`CONSTRUCTOR`、`ANNOTATION_TYPE`，可写多个 `{A, B}` |
| `@Retention`  | 注解存活到哪个阶段               | **`RUNTIME`(运行时，反射可读)**、`CLASS`(编译后留在 class 文件，运行时读不到)、`SOURCE`(仅源码阶段)               |
| `@Inherited`  | 贴在类上的注解是否被子类继承     | 默认不继承，加上才继承                                                                                            |
| `@Documented` | 是否写入 Javadoc                 | 按需使用                                                                                                          |
| `@Repeatable` | 是否允许同一位置重复贴同一个注解 | 按需使用                                                                                                          |

### @Retention 是最大的坑

**只要想用反射读取注解，必须写成 `RUNTIME`**。写成 `SOURCE` 或 `CLASS` 的话，运行时用 `getAnnotation()` 会得到 `null`（编译后就被丢弃）。

## 使用语法

```java
public class User {
    @FieldCheck(required = true, message = "用户名必填")
    private String name;

    @MyLog(level = "WARN")
    public void doSomething() { }
}
```

## 运行时解析（反射方式）

```java
Field f = obj.getClass().getDeclaredField("name");
if (f.isAnnotationPresent(FieldCheck.class)) {   // 判断是否贴了注解
    FieldCheck check = f.getAnnotation(FieldCheck.class); // 拿到注解对象读属性
    System.out.println(check.required() + " / " + check.message());
}
```

解析注解的三个关键 API：`isAnnotationPresent()` / `getAnnotation()` / `getAnnotations()`。

## 编译时处理（APT，进阶选学）

Lombok 的 `@Getter` / `@Slf4j` 就是编译期注解处理器实现的：通过 `AnnotationProcessor` 在编译阶段读取注解并生成代码，运行期完全无反射开销。

## 应用场景

- **校验**：`@FieldCheck(required=true)` + 反射校验器（如框架的 `@Valid` / `@NotNull`）
- **日志**：`@MyLog` + AOP 切面自动打印入参出参
- **鉴权**：`@RequireLogin` / `@Permission` + 切面或拦截器校验
- **限流**：`@RateLimit` + 切面实现接口限流
- **配置映射**：`@ConfigurationProperties`、MyBatis 的 `@Mapper`、Spring 的 `@Component` 系列

## 学习链路

```
反射(Class/Method/Field) -> 注解语法(元注解) -> 反射解析注解(校验器)
    -> 动态代理(JDK Proxy) -> Spring AOP 切面 -> 自定义注解 + 切面(实战)
```
