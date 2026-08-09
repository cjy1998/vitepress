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

### 常用注解速查表

| 使用位置 | springfox（knife4j 3.x） | springdoc（knife4j 4.x / Boot 3） | 常用属性 | 说明 |
| --- | --- | --- | --- | --- |
| 类 | `@Api(tags = "员工管理")` | `@Tag(name = "员工管理", description = "...")` | `tags` / `name`、`description` | 接口分组标签 |
| 方法 | `@ApiOperation("员工登录")` | `@Operation(summary = "员工登录", description = "...")` | `value` / `summary`、`description` | 接口说明 |
| 方法参数 | `@ApiParam("员工id")` | `@Parameter(description = "...", required = true, example = "1")` | `name`、`required`、`example` | 单个参数说明 |
| 响应状态 | `@ApiResponse(code = 200, message = "成功")` | `@ApiResponse(responseCode = "200", description = "成功")` | `code` / `responseCode`、`message` / `description` | 状态码说明（可多个） |
| 实体类 | `@ApiModel("员工登录返回的数据格式")` | `@Schema(description = "...")` | `value` / `description` | 实体类说明 |
| 实体字段 | `@ApiModelProperty("用户名")` | `@Schema(description = "...", example = "...")` | `value` / `description`、`required`、`example` | 字段说明 |
| 隐藏接口 | `@ApiIgnore` | `@Hidden` | - | 不显示该接口 |
| 全局参数配置 | 见下方 Docket `globalRequestParameters` | `@Parameter(in = ParameterIn.HEADER)` | - | 公共请求头（如 token） |

常用技巧：

- `@ApiModelProperty(hidden = true)` 隐藏敏感字段（如密码不回显）
- `@ApiOperation` 是方法必备，没有注解的接口在文档里显示原始方法名，很难看
- `@ApiIgnore` 用于放行不希望暴露给前端的接口（如内部调用接口）

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

---

## 集成Knife4j（推荐）

Knife4j 是基于 Swagger 的增强工具，文档展示、调试体验更好，是国内主流选择。

### 添加依赖

1. SpringBoot 2.x（knife4j 3.x 基于 springfox 3.0，注解用 `springfox` 包）

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-spring-boot-starter</artifactId>
    <version>3.0.2</version>
</dependency>
```

2. SpringBoot 3.x（knife4j 4.x 基于 springdoc，注解用 `io.swagger.v3` 包，与上文的 springdoc 注解通用）

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
    <version>4.4.0</version>
</dependency>
```

### 配置（SpringBoot 2.x 需要 Docket，3.x 不需要）

```java
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableSwagger2
public class Knife4jConfig {

    @Bean
    public Docket docket() {
        return new Docket(DocumentationType.SWAGGER_2)
            .apiInfo(apiInfo())
            .groupName("admin端")
            .select()
            .apis(RequestHandlerSelectors.basePackage("com.example.admin.controller"))
            .paths(PathSelectors.any())
            .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
            .title("苍穹外卖项目接口文档")
            .version("1.0")
            .description("对外暴露的接口说明")
            .build();
    }
}
```

application.yml 开启：

```yml
knife4j:
  enable: true  # 生产环境可关掉
  setting:
    language: zh_cn
```

### 注解使用

knife4j 3.x 用 `springfox` 注解，4.x 用 `io.swagger.v3` 注解，写法几乎一样：

| 位置       | 注解                                  | 说明                     |
| ---------- | ------------------------------------- | ------------------------ |
| Controller | `@Api(tags = "员工管理")` / `@Tag(name = "员工管理")` | 接口分组               |
| 方法       | `@ApiOperation("员工登录")` / `@Operation(summary = "...")` | 接口说明             |
| 实体类     | `@ApiModel(description = "员工登录返回的数据格式")` | 实体说明                 |
| 实体字段   | `@ApiModelProperty("用户名")` / `@Schema(description = "...")` | 字段说明           |

```java
@RestController
@Api(tags = "员工管理")
public class EmployeeController {

    @PostMapping("/login")
    @ApiOperation("员工登录")
    public Result<EmployeeLoginVO> login(@RequestBody EmployeeLoginDTO dto) {
        return employeeService.login(dto);
    }
}

@Data
@Builder
@ApiModel(description = "员工登录返回的数据格式")
public class EmployeeLoginVO {

    @ApiModelProperty("主键值")
    private Long id;

    @ApiModelProperty("jwt令牌")
    private String token;
}
```

### 文档地址

| 页面       | 地址                          |
| ---------- | ----------------------------- |
| Knife4j UI | `http://localhost:8080/doc.html` |

### 常见问题

1. 默认不需要手动资源映射（knife4j 3.0.0+ / 4.x 自带自动配置，前提是用 `WebMvcConfigurer`）。**注意：继承 `WebMvcConfigurationSupport` 会禁用 Spring Boot 的自动配置，任何版本都必须手动加资源映射**，建议用 `implements WebMvcConfigurer`。若访问 404 或用了旧版 knife4j 2.x：

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("doc.html")
                .addResourceLocations("classpath:/META-INF/resources/");
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
    }
}
```

2. springfox 3.0（knife4j 3.x）+ Spring Boot 2.6+ 启动报 `Failed to start bean 'documentationPluginsBootstrapper'`：

```yml
spring:
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher
```

### 与 Swagger UI 对比

| 对比项       | Swagger UI                    | Knife4j                                    |
| ------------ | ----------------------------- | ------------------------------------------ |
| 界面         | 黑底蓝字，较简陋              | 高亮界面，支持暗色主题、分组折叠            |
| 调试         | 支持，参数不记忆              | 支持，参数刷新不丢失                        |
| 离线文档     | 不支持                        | 导出 Markdown / Word / HTML                |
| 全局参数     | 需逐个接口配置                | 一键加公共请求头（如 token）               |
| 接口排序     | 按默认顺序                    | 可自定义排序、按条件过滤显示               |
| 中文支持     | 一般                          | 中文友好                                    |
