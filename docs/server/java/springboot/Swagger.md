## 集成Swagger

### 添加依赖

1. springboot2.0+

```xml
  <dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
    <version>1.8.0</version>
  </dependency>
```

2. springboot3.0+

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.6</version>  <!-- 或更新版本 -->
</dependency>
```

### 自定义文档信息

1. 方法一：用配置类（推荐）

```java
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Profile("!prod")   // 只在非 prod 环境生效
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("我的项目 API 文档")
                .version("1.0.0")
                .description("这是项目接口的详细说明")
                .contact(new Contact()
                    .name("开发者")
                    .email("dev@example.com")));
    }
}
```

2. 方法二：在application.yml中配置

```yml
springdoc:
  api-docs:
    path: /v3/api-docs # OpenAPI JSON 路径
    enabled: false # 生产环境禁用 OpenAPI
  swagger-ui:
    path: /swagger-ui.html # Swagger UI 路径
    tags-sorter: alpha # 标签排序
    operations-sorter: alpha # 接口排序
```

### 用注解给接口添加说明

```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/users")
@Tag(name = "用户管理", description = "用户的增删改查接口")  // 接口分组
public class UserController {

    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询用户", description = "返回用户详细信息")  // 接口说明
    @ApiResponse(responseCode = "200", description = "查询成功")
    @ApiResponse(responseCode = "404", description = "用户不存在")
    public User getUser(
        @Parameter(description = "用户ID", required = true, example = "1")
        @PathVariable Long id
    ) {
        return userService.getById(id);
    }

    @PostMapping
    @Operation(summary = "创建用户")
    public User createUser(@RequestBody @Valid UserDTO userDTO) {
        return userService.create(userDTO);
    }
}
```

```java
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "用户信息")
public class UserDTO {

    @Schema(description = "用户名", required = true, example = "张三")
    private String username;

    @Schema(description = "年龄", example = "25", minimum = "0", maximum = "150")
    private Integer age;

    @Schema(description = "邮箱", example = "test@example.com")
    private String email;
}
```

### 配置统一鉴权Token

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info().title("我的API").version("1.0"))
            .addSecurityItem(new SecurityRequirement()
                .addList("Bearer Token"))
            .components(new Components()
                .addSecuritySchemes("Bearer Token",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("输入JWT Token")));
    }
}
```

## 文档地址

| 页面         | 地址                                          |
| ------------ | --------------------------------------------- |
| Swagger UI   | `http://localhost:8080/swagger-ui/index.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs`           |
