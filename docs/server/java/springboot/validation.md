## 集成校验

### 添加依赖

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### 常用注解

| 注解                           | 说明                             | 适用类型                            |
| ------------------------------ | -------------------------------- | ----------------------------------- |
| `@NotNull`                     | 不能为 null                      | 任何类型                            |
| `@Null`                        | 必须为 null                      | 任何类型                            |
| `@NotBlank`                    | 不能为 null 且去除空格后长度 > 0 | `String`                            |
| `@NotEmpty`                    | 不能为 null 且长度/大小 > 0      | `String`、`Collection`、`Map`、数组 |
| `@Size(min, max)`              | 长度/大小在指定范围内            | `String`、`Collection`、`Map`、数组 |
| `@Min(value)`                  | 最小值                           | 数值类型、`CharSequence`            |
| `@Max(value)`                  | 最大值                           | 数值类型、`CharSequence`            |
| `@DecimalMin(value)`           | 最小值（支持小数）               | 数值类型、`CharSequence`            |
| `@DecimalMax(value)`           | 最大值（支持小数）               | 数值类型、`CharSequence`            |
| `@Positive`                    | 正数                             | 数值类型                            |
| `@Negative`                    | 负数                             | 数值类型                            |
| `@PositiveOrZero`              | 正数或零                         | 数值类型                            |
| `@NegativeOrZero`              | 负数或零                         | 数值类型                            |
| `@Email`                       | 邮箱格式                         | `CharSequence`                      |
| `@Pattern(regexp)`             | 正则表达式匹配                   | `CharSequence`                      |
| `@Digits(integer, fraction)`   | 整数和小数位数限制               | 数值类型、`CharSequence`            |
| `@Past`                        | 过去的时间                       | 日期/时间类型                       |
| `@Future`                      | 将来的时间                       | 日期/时间类型                       |
| `@AssertTrue` / `@AssertFalse` | 布尔值校验                       | `boolean`                           |

### 整体链路（先记住这三步）

```text
① DTO / 参数上的约束注解  →  定义规则（@NotBlank、@Min …）
② Controller 上的触发注解  →  打开开关（@Valid / @Validated）
③ 全局异常处理            →  把异常收成统一 Result
```

**只写注解不触发 = 等于没校验。** 下面按场景说明「怎么触发」。

---

### 触发方式（重点）

#### 方式一：`@RequestBody` 对象（最常用）

DTO 上写规则，Controller 参数上加 `@Valid` 或 `@Validated`：

```java
public class StudentAddDTO {
    @NotBlank(message = "学生姓名不能为空")
    private String name;

    @NotNull(message = "年龄不能为空")
    @Min(value = 1, message = "年龄不能小于 1")
    private Integer age;
}
```

```java
@PostMapping
public Result add(@RequestBody @Validated StudentAddDTO dto) {
    // 或 @RequestBody @Valid StudentAddDTO dto
    return Result.success();
}
```

| 点 | 说明 |
| --- | --- |
| 触发条件 | 参数上必须有 `@Valid` 或 `@Validated` |
| 失败异常 | `MethodArgumentNotValidException` |
| `@Valid` / `@Validated` | 这种场景二选一即可，效果基本相同 |

---

#### 方式二：集合元素校验（`List` 批量新增）

只写 `@Validated List<StudentAddDTO>` **不会**校验列表里每一项。要对**元素**生效：

```java
// 推荐：参数上触发 + 类型参数上级联
@PostMapping("/batch")
public Result batchAdd(@RequestBody @Valid List<@Valid StudentAddDTO> list) {
    return Result.success();
}

// 也可以
@PostMapping("/batch")
public Result batchAdd(@RequestBody @Validated List<@Valid StudentAddDTO> list) {
    return Result.success();
}
```

| 写法 | 能否校验元素 |
| --- | --- |
| `@RequestBody List<StudentAddDTO>` | ❌ 不校验 |
| `@RequestBody @Validated List<StudentAddDTO>` | ❌ 通常不校验元素字段 |
| `@RequestBody @Valid List<@Valid StudentAddDTO>` | ✅ |
| `@RequestBody @Validated List<@Valid StudentAddDTO>` | ✅ |

也可用包装类（更清晰）：

```java
public class StudentBatchAddDTO {
    @NotEmpty(message = "列表不能为空")
    @Valid
    private List<StudentAddDTO> students;
}

@PostMapping("/batch")
public Result batchAdd(@RequestBody @Validated StudentBatchAddDTO dto) { ... }
```

---

#### 方式三：嵌套对象级联

嵌套字段上必须再标 `@Valid`，否则只校验外层、不进内层：

```java
public class OrderDTO {
    @NotBlank(message = "订单号不能为空")
    private String orderNo;

    @NotNull(message = "收货地址不能为空")
    @Valid  // 没有这行，AddressDTO 里的注解不生效
    private AddressDTO address;
}

public class AddressDTO {
    @NotBlank(message = "详细地址不能为空")
    private String detail;
}
```

```java
@PostMapping("/orders")
public Result create(@RequestBody @Validated OrderDTO dto) { ... }
```

> 级联靠的是**字段上的 `@Valid`**；参数上用 `@Valid` 还是 `@Validated` 都能触发外层校验。

---

#### 方式四：简单参数（`@PathVariable` / `@RequestParam`）

注解直接标在 `Long`、`String` 等简单类型上时，必须在**类上**加 `@Validated`，才会走方法级校验：

```java
@RestController
@RequestMapping("/users")
@Validated  // 必须：开启方法参数校验
public class UserController {

    @GetMapping("/{id}")
    public Result get(@PathVariable @Min(1) Long id) {
        return Result.success();
    }

    @GetMapping("/search")
    public Result search(@RequestParam @NotBlank String keyword) {
        return Result.success();
    }
}
```

| 点 | 说明 |
| --- | --- |
| 触发条件 | **类上** `@Validated` + 参数上约束注解 |
| 失败异常 | `ConstraintViolationException` |
| 注意 | 只在方法参数上写 `@Min`、类上没 `@Validated` → **不生效** |

---

#### 方式五：分组校验（同一 DTO，新增/更新不同规则）

只有 `@Validated(分组.class)` 支持分组；`@Valid` 不支持。

1. 定义分组

```java
public interface CreateGroup {}
public interface UpdateGroup {}
```

2. DTO 指定 groups

```java
public class UserDTO {
    @Null(groups = CreateGroup.class, message = "创建时 ID 必须为空")
    @NotNull(groups = UpdateGroup.class, message = "更新时 ID 不能为空")
    private Long id;

    // 未写 groups 的注解只属于 Default 组
    // 使用 @Validated(CreateGroup.class) 时，默认组不会自动生效
    @NotBlank(groups = {CreateGroup.class, UpdateGroup.class}, message = "用户名不能为空")
    private String username;
}
```

3. Controller 触发对应组

```java
@PostMapping
public Result create(@RequestBody @Validated(CreateGroup.class) UserDTO dto) {
    return Result.success();
}

@PutMapping
public Result update(@RequestBody @Validated(UpdateGroup.class) UserDTO dto) {
    return Result.success();
}
```

需要同时带上默认组时：

```java
@Validated({CreateGroup.class, Default.class})
```

---

### `@Valid` vs `@Validated` 怎么选

| 特性 | `@Valid`（JSR） | `@Validated`（Spring） |
| --- | --- | --- |
| 来源 | Jakarta Bean Validation | Spring 扩展 |
| `@RequestBody` 对象 | ✅ | ✅ |
| 嵌套级联（字段再标 `@Valid`） | ✅ | ✅（外层触发后同样级联） |
| 集合元素 `List<@Valid T>` | ✅ | ✅ |
| 分组校验 | ❌ | ✅ |
| 标在类上做方法级简单参数校验 | ❌ | ✅ |

**实战建议：**

- 普通 Body 对象：`@Valid` / `@Validated` 都行  
- 要分组 → 必须 `@Validated(Group.class)`  
- Path/Query 简单参数 → 类上 `@Validated`  
- 嵌套 / List 元素 → 字段或类型参数上再加 `@Valid`

---

### DTO 定义示例（完整一点）

```java
public class UserDTO {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度必须在 2-20 之间")
    private String username;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "年龄不能为空")
    @Min(value = 0, message = "年龄不能小于 0")
    @Max(value = 150, message = "年龄不能大于 150")
    private Integer age;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
}
```

**易错点：**

| 错误 | 原因 |
| --- | --- |
| `@NotBlank` 标在 `Integer` 上 | `@NotBlank` 只适用于 `String`，数字用 `@NotNull` |
| 只写 DTO 注解，Controller 不加 `@Valid`/`@Validated` | 不会触发 |
| `@Validated List<DTO>` 期望校验每一项 | 要对元素写 `List<@Valid DTO>`，且参数上要有触发注解 |
| 嵌套对象字段没加 `@Valid` | 只校验外层 |
| 简单参数只加 `@Min`，类上无 `@Validated` | 不生效 |

### 全局异常处理

```java
package com.cjy;

import com.cjy.pojo.Result;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理 @RequestBody 参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return Result.fail( message);
    }

    /**
     * 处理 @ModelAttribute / @RequestParam 参数校验异常
     */
    @ExceptionHandler(BindException.class)
    public Result handleBindException(BindException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return Result.fail( message);
    }

    /**
     * 处理单个参数校验异常（@Validated 用在类上时）
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public Result handleConstraintViolationException(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining("; "));
        return Result.fail(message);
    }
}
```
