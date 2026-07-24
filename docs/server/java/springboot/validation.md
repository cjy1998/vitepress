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

### 使用示例

1. 实体类中定义

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

2. Controller 中使用
   - @Valid—— 用于实体对象校验

   ```java
    @RestController
    @RequestMapping("/users")
    public class UserController {

        @PostMapping
        public Result createUser(@RequestBody @Valid UserDTO userDTO) {
            // 校验通过后执行业务逻辑
            return Result.ok();
        }
    }
   ```

   - @Validated——用于简单参数 / 分组校验

   ```java
   @RestController
   @RequestMapping("/users")
   @Validated  // 类级别添加
   public class UserController {

       @GetMapping("/{id}")
       public Result getUser(@PathVariable @Min(1) Long id) {
           return Result.ok();
       }

       @GetMapping("/search")
       public Result search(@RequestParam @NotBlank String keyword) {
           return Result.ok();
       }
   }
   ```

   | 特性           | `@Valid`     | `@Validated`         |
   | -------------- | ------------ | -------------------- |
   | 来源           | JSR-303 标准 | Spring 扩展          |
   | 分组校验       | ❌ 不支持    | ✅ 支持              |
   | 嵌套校验       | ✅ 支持      | ❌ 不支持            |
   | 用在方法参数上 | ✅           | ✅                   |
   | 用在类上       | ❌           | ✅（开启方法级校验） |

### 嵌套校验

对象中嵌套另一个对象时，使用 @Valid 进行级联校验：

```java
public class OrderDTO {

    @NotBlank(message = "订单号不能为空")
    private String orderNo;

    @NotNull(message = "收货地址不能为空")
    @Valid  // 👈 触发嵌套对象的校验
    private AddressDTO address;
}

public class AddressDTO {

    @NotBlank(message = "详细地址不能为空")
    private String detail;

    @NotBlank(message = "城市不能为空")
    private String city;
}
```

### 分组校验

同一个对象在不同场景（新增/更新）需要不同的校验规则：

1. 定义分组接口
   ```java
   public interface CreateGroup {}
   public interface UpdateGroup {}
   ```
2. 实体类指定分组

   ```java
   public class UserDTO {

       @Null(groups = CreateGroup.class, message = "创建时 ID 必须为空")
       @NotNull(groups = UpdateGroup.class, message = "更新时 ID 不能为空")
       private Long id;

       @NotBlank(message = "用户名不能为空")
       private String username;
   }
   ```

3. controller使用分组

   ```java
   @PostMapping
   public Result create(@RequestBody @Validated(CreateGroup.class) UserDTO dto) {
   return Result.ok();
   }

   @PutMapping
   public Result update(@RequestBody @Validated(UpdateGroup.class) UserDTO dto) {
   return Result.ok();
   }
   ```

   使用分组后，未指定 groups 的注解将不会生效。可以使用 Default.class 来包含默认分组：

```java
@NotBlank(groups = {CreateGroup.class, UpdateGroup.class, Default.class},
          message = "用户名不能为空")
private String username;
```

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
