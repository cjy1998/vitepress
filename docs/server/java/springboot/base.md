# SpringBoot

## 脚手架

    官方：https://start.spring.io/
    阿里巴巴: https://start.aliyun.com/

## 项目结构

SpringBoot 项目结构通常分为**单一模块**和**多模块**两种形式，根据项目规模和团队协作需求选择。

### 单一模块

适用于小型项目或个人项目，所有代码集中在一个模块中，结构简单、易于维护。

```text
demo/
├── pom.xml                                # 项目依赖及构建配置
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── example
    │   │           └── demo
    │   │               ├── controller/    # 控制器层：接收请求、返回响应
    │   │               ├── service/       # 业务逻辑层：核心业务处理
    │   │               ├── mapper/        # 数据访问层：数据库操作
    │   │               ├── entity/        # 实体类：数据库表映射
    │   │               ├── config/        # 配置类：Bean 定义、拦截器等
    │   │               └── DemoApplication.java  # 启动类
    │   └── resources
    │       ├── application.yml            # 应用配置
    │       ├── mapper/                    # MyBatis 映射文件（XML）
    │       └── log4j2.xml                 # 日志配置
    └── test
        └── java
            └── com
                └── example
                    └── demo
                        └── DemoApplicationTests.java
```

### 多模块

适用于中大型项目或团队协作场景，按职责将项目拆分为多个子模块，降低耦合度，便于并行开发和复用。

#### 目录结构

```text
my-project/
├── pom.xml                          # 父 POM (packaging: pom)
├── my-project-common/               # 通用工具模块
│   ├── pom.xml
│   └── src/main/java/com/example/common
├── my-project-domain/               # 实体/领域模块
│   ├── pom.xml
│   └── src/main/java/com/example/domain
├── my-project-service/              # 业务逻辑模块
│   ├── pom.xml
│   └── src/main/java/com/example/service
└── my-project-web/                  # Web 启动模块
    ├── pom.xml
    └── src
        ├── main
        │   ├── java/com/example/web
        │   │   ├── controller/
        │   │   └── WebApplication.java
        │   └── resources
        │       ├── application.yml
        │       └── log4j2.xml
        └── test
            └── java/com/example/web
```

#### 模块职责

| 模块      | 职责                                             | 依赖               |
| --------- | ------------------------------------------------ | ------------------ |
| `common`  | 通用工具类、常量、枚举、统一异常、统一返回结果等 | 无                 |
| `domain`  | 实体类（Entity）、DTO、VO、数据库映射对象        | `common`           |
| `service` | 业务逻辑实现、接口定义、外部服务调用             | `common`、`domain` |
| `web`     | 控制器（Controller）、配置类、启动类、静态资源   | `service`          |

#### 依赖关系

```text
web ──▶ service ──▶ domain ──▶ common
```

依赖方向自上而下，上层模块依赖下层模块，**禁止反向依赖和循环依赖**。

#### 父 POM 关键配置

父 POM 负责聚合子模块并统一管理依赖版本，`packaging` 必须为 `pom`：

```xml
<groupId>com.example</groupId>
<artifactId>my-project</artifactId>
<version>1.0.0</version>
<packaging>pom</packaging>

<!-- 聚合子模块 -->
<modules>
    <module>my-project-common</module>
    <module>my-project-domain</module>
    <module>my-project-service</module>
    <module>my-project-web</module>
</modules>

<!-- 统一版本管理，子模块引用时无需指定版本号 -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <!-- 内部模块版本统一管理 -->
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>my-project-common</artifactId>
            <version>${project.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

#### 子模块 POM 示例

以 `web` 模块为例，继承父 POM 并声明对 `service` 的依赖（版本由父 POM 管理，无需指定）：

```xml
<parent>
    <groupId>com.example</groupId>
    <artifactId>my-project</artifactId>
    <version>1.0.0</version>
</parent>

<artifactId>my-project-web</artifactId>

<dependencies>
    <!-- 依赖业务模块 -->
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>my-project-service</artifactId>
    </dependency>
    <!-- Web Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>

<build>
    <plugins>
        <!-- 打包为可执行 jar -->
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

## 一、核心注解

**@SpringBootApplication**

Spring Boot 的核心启动注解，是一个组合注解，等同于以下三个注解的叠加：

| 子注解                     | 作用                                               |
| -------------------------- | -------------------------------------------------- |
| `@SpringBootConfiguration` | 标记当前类为配置类（等同于 `@Configuration`）      |
| `@EnableAutoConfiguration` | 开启自动配置，根据 classpath 下的依赖自动配置 Bean |
| `@ComponentScan`           | 开启组件扫描，默认扫描当前包及子包                 |

```java
    @SpringBootApplication
    public class MyApp {
        public static void main(String[] args) {
            SpringApplication.run(MyApp.class, args);
        }
    }
```

如需排除某些自动配置：

```java
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})

```

## 二、Bean 相关注解（IoC 容器）

1. **组件注册**

| 注解              | 用途                                           | 层次          |
| ----------------- | ---------------------------------------------- | ------------- |
| `@Component`      | 通用组件，最基础的注解                         | 通用层        |
| `@Service`        | 标记业务逻辑层                                 | Service 层    |
| `@Repository`     | 标记数据访问层，可自动转换数据库异常           | DAO 层        |
| `@Controller`     | 标记 Web 控制层                                | Controller 层 |
| `@RestController` | `@Controller` + `@ResponseBody`，返回 JSON/XML | Controller 层 |
| `@Configuration`  | 标记配置类，类中的 `@Bean` 方法会被容器管理    | 配置层        |

2. **依赖注入**

| 注解                     | 说明                                           |
| ------------------------ | ---------------------------------------------- |
| `@Autowired`             | 按类型自动注入，可配合 `@Qualifier` 按名称注入 |
| `@Qualifier("beanName")` | 指定注入某个名称的 Bean                        |
| `@Primary`               | 多个实现时，标记为首选注入的 Bean              |
| `@Resource`              | JSR-250 注解，默认按名称注入（Java 标准）      |
| `@Inject`                | JSR-330 注解，按类型注入（需额外依赖）         |
| `@Value("${key}")`       | 注入配置文件中的值                             |
| `@Lazy`                  | 延迟加载，在首次使用时才创建 Bean              |

## 三、Web 层注解

1. **请求映射**

| 注解              | 说明                                      |
| ----------------- | ----------------------------------------- |
| `@RequestMapping` | 通用请求映射（支持所有 HTTP 方法）        |
| `@GetMapping`     | 等价于 `@RequestMapping(method = GET)`    |
| `@PostMapping`    | 等价于 `@RequestMapping(method = POST)`   |
| `@PutMapping`     | 等价于 `@RequestMapping(method = PUT)`    |
| `@DeleteMapping`  | 等价于 `@RequestMapping(method = DELETE)` |
| `@PatchMapping`   | 等价于 `@RequestMapping(method = PATCH)`  |

2. **参数绑定**

| 注解              | 说明                      | 示例                                              |
| ----------------- | ------------------------- | ------------------------------------------------- |
| `@PathVariable`   | 获取路径变量              | `/users/{id}` → `@PathVariable("id") Long id`     |
| `@RequestParam`   | 获取查询参数/表单参数     | `?name=Tom` → `@RequestParam("name") String name` |
| `@RequestBody`    | 获取请求体（JSON → 对象） | `@RequestBody UserDTO user`                       |
| `@RequestHeader`  | 获取请求头                | `@RequestHeader("Authorization") String token`    |
| `@CookieValue`    | 获取 Cookie 值            | `@CookieValue("sessionId") String sid`            |
| `@ModelAttribute` | 绑定模型属性到方法参数    | `@ModelAttribute("user") User user`               |
| `@RequestPart`    | 用于 multipart 请求       | 文件上传场景                                      |

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) { ... }

    @PostMapping
    public User createUser(@RequestBody @Valid UserDTO userDTO) { ... }

    @GetMapping("/search")
    public List<User> search(@RequestParam String keyword,
                             @RequestParam(defaultValue = "1") int page) { ... }
}
```

3. **响应处理**

| 注解              | 说明                                     |
| ----------------- | ---------------------------------------- |
| `@ResponseBody`   | 将返回值直接写入 HTTP 响应体（JSON/XML） |
| `@ResponseStatus` | 设置 HTTP 响应状态码                     |

## 四、配置相关

| 注解                             | 说明                                   |
| -------------------------------- | -------------------------------------- |
| `@Configuration`                 | 标记为配置类                           |
| `@Bean`                          | 在配置类中声明 Bean                    |
| `@PropertySource`                | 加载指定的 properties 文件             |
| `@PropertySources`               | 加载多个 properties 文件               |
| `@ConfigurationProperties`       | 将配置文件中的属性绑定到对象           |
| `@EnableConfigurationProperties` | 启用 `@ConfigurationProperties` 的支持 |
| `@Profile`                       | 指定 Bean 在哪个环境下生效             |
| `@ConditionalOnProperty`         | 根据配置属性条件化创建 Bean            |
| `@Import`                        | 导入其他配置类                         |
| `@ImportResource`                | 导入 XML 配置文件                      |

## 五、条件化注解

| 注解                              | 触发条件                   |
| --------------------------------- | -------------------------- |
| `@ConditionalOnBean`              | 容器中存在某个 Bean 时     |
| `@ConditionalOnMissingBean`       | 容器中不存在某个 Bean 时   |
| `@ConditionalOnClass`             | classpath 下存在某个类时   |
| `@ConditionalOnMissingClass`      | classpath 下不存在某个类时 |
| `@ConditionalOnProperty`          | 某个配置属性满足条件时     |
| `@ConditionalOnWebApplication`    | 当前是 Web 应用时          |
| `@ConditionalOnNotWebApplication` | 当前不是 Web 应用时        |
| `@ConditionalOnExpression`        | SpEL 表达式为 true 时      |

```java
@Configuration
@ConditionalOnClass(DataSource.class)
@ConditionalOnProperty(prefix = "spring.datasource", name = "url")
public class DataSourceConfig { ... }
```

## 六、AOP相关注解

| 注解                      | 说明                                    |
| ------------------------- | --------------------------------------- |
| `@Aspect`                 | 声明切面类                              |
| `@Pointcut`               | 定义切点表达式                          |
| `@Before`                 | 前置通知                                |
| `@After`                  | 后置通知（无论是否异常都执行）          |
| `@AfterReturning`         | 返回后通知                              |
| `@AfterThrowing`          | 异常后通知                              |
| `@Around`                 | 环绕通知（最强大）                      |
| `@EnableAspectJAutoProxy` | 开启 AOP 支持（Spring Boot 默认已开启） |

## 七、事务管理

| 注解                           | 说明                                   |
| ------------------------------ | -------------------------------------- |
| `@Transactional`               | 声明式事务管理                         |
| `@EnableTransactionManagement` | 开启事务管理（Spring Boot 默认已开启） |

```java
@Service
public class OrderService {

    @Transactional(
        propagation = Propagation.REQUIRED,
        isolation = Isolation.READ_COMMITTED,
        timeout = 30,
        readOnly = false,
        rollbackFor = Exception.class
    )
    public void createOrder(Order order) { ... }
}
```

常用属性：

- propagation：传播行为（REQUIRED / REQUIRES_NEW / NESTED 等）
- isolation：隔离级别
- rollbackFor：指定回滚的异常类型
- noRollbackFor：指定不回滚的异常类型
- readOnly：只读事务（优化性能）
- timeout：超时时间（秒）

## 八、数据访问层

1. **JPA / Hibernate**

| 注解                        | 说明         |
| --------------------------- | ------------ |
| `@Entity`                   | 标记实体类   |
| `@Table`                    | 指定表名     |
| `@Id`                       | 主键         |
| `@GeneratedValue`           | 主键生成策略 |
| `@Column`                   | 列映射       |
| `@OneToMany` / `@ManyToOne` | 关联关系     |

2. **MyBatis**

| 注解                                          | 说明                   |
| --------------------------------------------- | ---------------------- |
| `@Mapper`                                     | 标记 Mapper 接口       |
| `@MapperScan`                                 | 批量扫描 Mapper 包路径 |
| `@Select` / `@Insert` / `@Update` / `@Delete` | SQL 语句               |
| `@Param`                                      | 参数命名               |
| `@Results` / `@Result`                        | 结果映射               |

```java
@Mapper
public interface UserMapper {
    @Select("SELECT * FROM user WHERE id = #{id}")
    User findById(@Param("id") Long id);
}
```

## 九、缓存注解

| 注解             | 说明                       |
| ---------------- | -------------------------- |
| `@EnableCaching` | 开启缓存支持               |
| `@Cacheable`     | 查询缓存，有缓存则直接返回 |
| `@CachePut`      | 更新缓存                   |
| `@CacheEvict`    | 清除缓存                   |
| `@Caching`       | 组合多个缓存操作           |
| `@CacheConfig`   | 类级别的缓存配置           |

```java
@Service
@CacheConfig(cacheNames = "users")
public class UserService {

    @Cacheable(key = "#id")
    public User findById(Long id) { ... }

    @CachePut(key = "#user.id")
    public User update(User user) { ... }

    @CacheEvict(key = "#id")
    public void delete(Long id) { ... }
}
```

## 十、异步与定时任务

1. **异步方法**

| 注解           | 说明               |
| -------------- | ------------------ |
| `@EnableAsync` | 开启异步支持       |
| `@Async`       | 标记方法为异步执行 |

```java
@Service
public class NotifyService {
    @Async("taskExecutor")
    public CompletableFuture<String> sendEmail(String to) {
        // 异步发送邮件
        return CompletableFuture.completedFuture("OK");
    }
}
```

2. **定时任务**

| 注解                | 说明               |
| ------------------- | ------------------ |
| `@EnableScheduling` | 开启定时任务支持   |
| `@Scheduled`        | 标记方法为定时任务 |

```java
@Component
public class ScheduledTasks {
    @Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点
    public void cleanExpiredData() { ... }

    @Scheduled(fixedRate = 5000)       // 每5秒执行
    public void heartbeat() { ... }
}
```

## 十一、校验注解（Validation）

<ArticleCard to="/server/java/springboot/validation" category="Spring Boot" desc="集成校验：Bean Validation（Hibernate Validator）常用注解与全局异常处理详解。" :tags="['@Valid', '@Validated', 'Hibernate Validator']">
  <template #title>集成校验详解</template>
</ArticleCard>

## 十二、安全相关注解

| 注解                    | 说明                          |
| ----------------------- | ----------------------------- |
| `@EnableWebSecurity`    | 开启 Web 安全                 |
| `@EnableMethodSecurity` | 开启方法级安全                |
| `@Secured`              | 角色控制（Spring 原生）       |
| `@PreAuthorize`         | 方法执行前鉴权（SpEL 表达式） |
| `@PostAuthorize`        | 方法执行后鉴权                |
| `@PreFilter`            | 方法执行前过滤参数            |
| `@PostFilter`           | 方法执行后过滤返回值          |

```java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public void deleteUser(@PathVariable Long id) { ... }

@PreAuthorize("#id == authentication.principal.id")
public User getMyInfo(Long id) { ... }
```

## 十三、测试注解

| 注解                    | 说明                               |
| ----------------------- | ---------------------------------- |
| `@SpringBootTest`       | 启动完整 Spring 上下文进行集成测试 |
| `@WebMvcTest`           | 仅测试 Controller 层（MockMvc）    |
| `@DataJpaTest`          | 仅测试 JPA 数据访问层              |
| `@MybatisTest`          | 仅测试 MyBatis                     |
| `@MockBean`             | 创建 Mock 对象并注入容器           |
| `@SpyBean`              | 创建 Spy 对象（部分 Mock）         |
| `@AutoConfigureMockMvc` | 自动配置 MockMvc                   |
| `@TestPropertySource`   | 指定测试用的配置文件               |

```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void testGetUser() throws Exception {
        when(userService.findById(1L)).thenReturn(new User("Tom"));
        mockMvc.perform(get("/api/users/1"))
               .andExpect(status().isOk());
    }
}
```

## 十四、全局异常注解

| 注解                    | 说明                                  |
| ----------------------- | ------------------------------------- |
| `@ControllerAdvice`     | 全局异常处理类（增强型 Controller）   |
| `@RestControllerAdvice` | `@ControllerAdvice` + `@ResponseBody` |
| `@ExceptionHandler`     | 处理特定异常                          |

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return Result.fail(400, msg);
    }

    @ExceptionHandler(Exception.class)
    public Result handleException(Exception e) {
        return Result.fail(500, "服务器内部错误");
    }
}
```

<ArticleCard to="/server/java/springboot/validation/###全局异常处理" category="Spring Boot" desc="集成校验：Bean Validation（Hibernate Validator）常用注解与全局异常处理详解。" :tags="['@Valid', '@Validated', 'Hibernate Validator']">
  <template #title>集成校验详解</template>
</ArticleCard>

## 十五、Swagger/OpenAPI 注解

<ArticleCard to="/server/java/springboot/Swagger" category="Spring Boot" desc="集成Swagger：常用注解与集成" :tags="['Swagger', 'OpenAPI']">
  <template #title>集成Swagger</template>
</ArticleCard>

## 十六、过滤器 Filter

### 基础概念与作用

过滤器（Filter）是传统 Java Web 开发三大组件之一，其余两个为 **Servlet** 和 **Listener**。Servlet 与 Listener 在现代企业项目中基本已弃用，仅 Filter 仍被广泛使用。

**核心作用**：拦截对资源的所有请求，在访问目标资源前执行通用操作，如**登录校验**、**统一编码处理**、**敏感字符过滤**等。

> 若无 Filter，需在每个功能接口前重复编写登录校验逻辑（if 判断），导致代码冗余、维护困难；Filter 可将该通用逻辑集中统一处理。

### 生命周期方法详解

| 方法        | 调用时机                               | 执行次数 | 用途                     |
| ----------- | -------------------------------------- | -------- | ------------------------ |
| `init()`    | Web 服务器启动、Filter 实例化完毕后    | 仅一次   | 资源准备与环境初始化     |
| `doFilter()`| 每次请求被拦截时                       | 多次     | 请求处理逻辑及放行操作   |
| `destroy()` | Web 服务器关闭时                       | 仅一次   | 资源释放与环境清理       |

> `init()` 和 `destroy()` 各执行一次；`doFilter()` 执行频次等于被拦截请求次数。

### 开发步骤

#### 第一步：定义 Filter 类

创建一个 Java 类，并实现标准 `javax.servlet.Filter` 接口（注意导入包，非 Spring 或第三方 Filter）。

必须重写三个核心方法：

- `init(FilterConfig filterConfig)`
- `doFilter(ServletRequest request, ServletResponse response, FilterChain chain)`
- `destroy()`

> `init()` 与 `destroy()` 在 Filter 接口中已提供空实现，实际开发中可选择性重写；`doFilter()` 无默认实现，**必须重写**。

#### 第二步：配置 Filter

**配置方式一：`@WebFilter` 注解**：在 Filter 类上添加 `@WebFilter` 注解，并通过 `urlPatterns` 属性指定拦截路径。

- `urlPatterns`：声明该 Filter 拦截的请求 URL 模式；入门示例中配置为 `"/*"`，表示拦截所有请求。

**配置方式二：`@ServletComponentScan` 注解**：在 Spring Boot 启动类（引导类）上添加 `@ServletComponentScan` 注解，开启对 Servlet 规范组件（包括 Filter）的支持。

> Spring Boot 默认不扫描 Servlet 组件，必须显式启用 `@ServletComponentScan` 才能使 `@WebFilter` 生效。

### 放行操作（关键！）

`doFilter()` 方法内**必须**调用 `chain.doFilter(request, response)` 实现放行；否则请求被拦截后无法访问后端资源，导致无响应数据返回。`chain.doFilter()` 需传入当前 `ServletRequest` 与 `ServletResponse` 对象，即方法形参 `request` 和 `response`。

### request / response 可获取的信息

`doFilter()` 中的 `request`、`response` 形参类型为 `ServletRequest`、`ServletResponse`，实际是 Tomcat 封装的 `HttpServletRequest`、`HttpServletResponse` 对象，可向下转型后使用。

> `ServletRequest` 基接口中只有 `getParameter()`、`getInputStream()` 等基础方法，**没有** `getHeader()`、`getCookies()`、`getSession()`、`getMethod()` 等 HTTP 相关方法；这些方法定义在 `HttpServletRequest` 中，必须先向下转型才能调用。

**向下转型**：父类引用指向子类对象，强转回子类类型即可：

```java
HttpServletRequest httpRequest = (HttpServletRequest) request;
HttpServletResponse httpResponse = (HttpServletResponse) response;
```

向下转型后可调用子类特有方法：

```java
String method = httpRequest.getMethod();              // GET / POST ...
String token = httpRequest.getHeader("Authorization"); // 请求头
String ip = httpRequest.getRemoteAddr();               // 客户端 IP
httpResponse.setStatus(401);                           // 响应状态码
```

> 实际运行时 request 就是 `HttpServletRequest` 的实现类（Tomcat 的 `RequestFacade`），所以强转不会报错，也无需判断 `instanceof`。

#### request 常用信息（HttpServletRequest）

| 类别       | 方法                       | 说明                             |
| ---------- | -------------------------- | -------------------------------- |
| 请求方式   | `getMethod()`              | GET / POST / PUT / DELETE 等     |
| 请求路径   | `getRequestURI()`          | 如 `/api/user/login`（不含域名） |
| 请求参数   | `getParameter(name)`       | 获取单个参数（GET / POST 均可）  |
| 请求参数   | `getParameterMap()`        | 获取全部参数（Map 形式）         |
| 请求头     | `getHeader(name)`          | 如 `User-Agent`、`Referer` 等    |
| 请求头     | `getHeaderNames()`         | 获取所有请求头名称               |
| 请求头     | `getContentType()`         | 请求体类型，如 `application/json`|
| 请求体     | `getInputStream()`         | 读取请求体字节流（JSON 等）      |
| 协议信息   | `getProtocol()`            | HTTP/1.1 等协议版本              |
| 客户端信息 | `getRemoteAddr()`          | 客户端 IP 地址                   |
| 会话信息   | `getSession()`             | 获取 HttpSession 会话对象        |
| Cookie     | `getCookies()`             | 获取所有 Cookie                  |
| 字符编码   | `getCharacterEncoding()`   | 获取请求字符编码                 |

```java
HttpServletRequest httpRequest = (HttpServletRequest) request;
String method = httpRequest.getMethod();                 // GET
String uri = httpRequest.getRequestURI();                // /api/user/login
String name = httpRequest.getParameter("username");      // 请求参数
String token = httpRequest.getHeader("Authorization");   // 请求头（常用于登录校验）
String ip = httpRequest.getRemoteAddr();                 // 客户端 IP
```

#### response 常用信息（HttpServletResponse）

| 类别     | 方法                     | 说明                               |
| -------- | ------------------------ | ---------------------------------- |
| 响应状态 | `setStatus(int)`         | 设置状态码，如 401、403、500       |
| 响应头   | `setHeader(name, value)` | 设置响应头，如 `Content-Type`      |
| 响应编码 | `setCharacterEncoding()` | 设置响应字符编码                   |
| 响应体   | `getWriter()`            | 获取字符输出流（写 JSON 字符串）   |
| 响应体   | `getOutputStream()`      | 获取字节输出流（写文件、图片等）   |
| 重定向   | `sendRedirect(url)`      | 重定向到指定地址（302）            |
| 会话信息 | `addCookie(cookie)`      | 向客户端添加 Cookie                |

```java
HttpServletResponse httpResponse = (HttpServletResponse) response;

// 未登录时直接响应，不继续放行
httpResponse.setStatus(401);
httpResponse.setCharacterEncoding("UTF-8");
httpResponse.setContentType("application/json;charset=UTF-8");
httpResponse.getWriter().write("{\"code\":401,\"msg\":\"未登录\"}");
return;
```

### 过滤器执行流程

过滤器拦截前端发起的所有请求，在 `doFilter` 方法中执行通用操作，其中关键步骤是调用 `FilterChain.doFilter()` 方法实现**放行**。

```text
拦截请求 → 执行放行前逻辑 → 调用 chain.doFilter() 放行至资源
         → 资源处理完毕 → 返回过滤器 → 执行放行后逻辑 → 响应前端数据
```

#### 放行前逻辑

在调用 `FilterChain.doFilter()` **之前**执行的代码属于放行前逻辑，常用于登录校验、统一编码处理等。

#### 放行后逻辑

在 `FilterChain.doFilter()` 调用**之后**执行的代码属于放行后逻辑；资源访问完毕后请求会返回过滤器，继续执行该部分逻辑，常用于响应日志记录等。

> 资源访问完毕后会**再次回到过滤器**，但返回后**仅执行放行后的逻辑**（非从头重新执行整个 doFilter）。

```java
@Override
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
    log.info("放行前逻辑：请求 {}", ((HttpServletRequest) request).getRequestURI());

    chain.doFilter(request, response);  // 放行：交给资源处理

    log.info("放行后逻辑：资源处理完毕，返回过滤器");
}
```

### 拦截路径配置

`@WebFilter` 的 `urlPatterns` 属性支持三种配置方式：

| 配置方式   | 示例        | 说明                                   |
| ---------- | ----------- | -------------------------------------- |
| 精确路径   | `/login`    | 只拦截 `/login` 请求，其余路径不拦截   |
| 目录前缀   | `/emps/*`   | 拦截所有以 `/emps/` 开头的路径，后续路径可有可无（如 `/emps`、`/emps/1`、`/emps/list`） |
| 全局拦截   | `/*`        | 拦截所有请求路径                       |

#### `/*` 与 `/**` 的区别

| 模式 | 含义                                       | 可配置位置                                   | 示例                               |
| ---- | ------------------------------------------ | -------------------------------------------- | ---------------------------------- |
| `/*` | 只匹配**当前目录下的一级路径**，不匹配多级 | 过滤器的 `urlPatterns`、拦截器的 `addPathPatterns()` | `/emps/1` 匹配，`/emps/1/2` 不匹配 |
| `/**`| 匹配**所有层级的路径**，任意深度           | 拦截器的 `addPathPatterns()`（**过滤器不支持 `/**`**） | `/emps/1/2/3` 也能匹配             |

> 过滤器（Servlet 规范）的 `urlPatterns` 只支持 `/*`，**不支持 `/**`**（`/**` 按字面处理）；拦截器（Spring MVC）中 `/*`、`/**` 均支持。

### 过滤器链（Filter Chain）机制

#### 过滤器链定义

当项目中配置**多个过滤器**时，它们按声明顺序构成一个**过滤器链**。

#### 请求正向传递流程

请求依次经过每个过滤器：第一个过滤器放行 → 进入第二个过滤器 → 第二个过滤器放行 → 若存在第三个则进入，否则放行至目标资源。

```text
请求 → FilterA → FilterB → FilterC → 目标资源
```

#### 响应反向回调流程

资源响应完成后，沿过滤器链**逆序返回**：先执行最后一个过滤器的放行后逻辑，再执行倒数第二个过滤器的放行后逻辑……最终执行第一个过滤器的放行后逻辑，再响应浏览器。

```text
请求:  FilterA → FilterB → FilterC → 资源
响应:  FilterA ← FilterB ← FilterC ← 资源
```

#### FilterChain 参数本质

`doFilter()` 的第三个参数 `FilterChain` 即为**当前过滤器链对象**；调用其 `doFilter()` 方法即触发**向下一个过滤器或目标资源的流转**。

#### 过滤器执行顺序控制

在注解配置方式下，过滤器执行顺序**默认由类名的自然字母序决定**：

- 类名字典序**靠前**者（如 `ABCFilter`）先执行放行前逻辑
- 类名字典序**靠后**者（如 `XYZFilter`）后执行放行前逻辑
- 放行后阶段执行顺序**相反**：`XYZFilter` 先于 `ABCFilter` 执行放行后逻辑

### 拦截器（Interceptor）

拦截器是 Spring MVC 提供的组件，运行在 **DispatcherServlet 内、Controller 之外**，用于在请求到达目标资源（Controller 方法）前后执行通用逻辑，如登录校验、权限校验、日志记录等。

#### 核心方法

实现 `HandlerInterceptor` 接口，可重写三个方法：

| 方法               | 调用时机                       | 返回值作用                     |
| ------------------ | ------------------------------ | ------------------------------ |
| `preHandle()`      | 目标资源（Controller）**运行之前** | 返回 `true` 放行；返回 `false` 拦截（不再执行后续方法） |
| `postHandle()`     | 目标资源**运行之后**           | 无                             |
| `afterCompletion()`| **视图渲染完毕之后**           | 无（无论是否异常都会执行）     |

```java
@Slf4j
@Component
public class DemoInterceptor implements HandlerInterceptor {

    // 在目标资源运行之前运行：true 放行，false 拦截
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String token = request.getHeader("Authorization");
        // 1. token 不存在或为空 -> 未登录
        if (token == null || token.isEmpty()) {
            writeUnauthorized(response, "未登录，请先登录");
            return false;
        }
        // 2. token 无效（过期/被篡改/格式错误）-> 登录失效
        String pureToken = token.replace("Bearer ", "");
        if (!JwtUtil.validateToken(pureToken)) {
            writeUnauthorized(response, "用户登录已失效，请重新登录");
            return false;
        }
        // 3. 校验通过 -> 放行
        return true;
    }

    // 在目标资源运行之后运行
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        log.info("postHandle....");
    }

    // 视图渲染完毕之后运行
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        log.info("afterCompletion....");
    }

    private void writeUnauthorized(HttpServletResponse response, String msg) throws IOException {
        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(OBJECT_MAPPER.writeValueAsString(Result.error(msg)));
    }
}
```

#### 拦截器链机制

多个拦截器同样构成**拦截器链**，执行顺序与过滤器链类似：

```text
请求:  InterceptorA.preHandle → InterceptorB.preHandle → Controller
后置:  Controller → InterceptorB.postHandle → InterceptorA.postHandle
完成:  InterceptorB.afterCompletion → InterceptorA.afterCompletion（逆序）
```

> 若某个拦截器的 `preHandle` 返回 `false`，后续拦截器与 Controller 均不再执行，但已放行的拦截器的 `afterCompletion` 仍会执行。

#### 注册与配置

拦截器需实现 `WebMvcConfigurer` 注册，否则不生效：

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private DemoInterceptor demoInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(demoInterceptor)
                .addPathPatterns("/**")                 // 拦截所有请求
                .excludePathPatterns("/login");         // 放行登录接口
    }
}
```

| 方法                  | 说明                                   |
| --------------------- | -------------------------------------- |
| `addInterceptor()`    | 注册拦截器                             |
| `addPathPatterns()`   | 设置拦截路径（支持 `/**`、`/emps/*` 等）|
| `excludePathPatterns()`| 设置放行路径（不拦截的请求）           |

### 过滤器 vs 拦截器对比

| 对比项       | 过滤器（Filter）                          | 拦截器（Interceptor）                    |
| ------------ | ----------------------------------------- | ---------------------------------------- |
| 所属体系     | Servlet 规范（Web 容器层面）              | Spring MVC 框架（Spring 层面）           |
| 执行时机     | 在 `DispatcherServlet` **之前**执行       | 在 `DispatcherServlet` 之内、Controller **前后**执行 |
| 依赖容器     | 不依赖 Spring，纯 Servlet 组件            | 依赖 Spring（由 Spring 容器管理，可 `@Autowired`） |
| 配置方式     | `@WebFilter` + `@ServletComponentScan`    | 实现 `WebMvcConfigurer` 注册              |
| 核心方法     | `init()` / `doFilter()` / `destroy()`     | `preHandle()` / `postHandle()` / `afterCompletion()` |
| 拦截范围     | 拦截**所有请求**（静态资源、JSP 等）     | 只拦截 **Controller 请求**（静态资源默认不拦截） |
| 放行方式     | 调用 `chain.doFilter(request, response)`  | `preHandle()` 返回 `true`                |
| 拦截后响应   | 自行写 JSON（异常全局处理器捕获不到）    | 同上（同样在 Spring MVC 拦截链之外，`@RestControllerAdvice` 捕获不到） |
| 执行顺序     | 先于拦截器执行                           | 后于过滤器执行                           |

```text
请求 → Filter.doFilter → DispatcherServlet → Interceptor.preHandle
     → Controller → Interceptor.postHandle → Interceptor.afterCompletion
     → Filter 放行后逻辑 → 响应浏览器
```

## 十七、ThreadLocal 与 BaseContext（上下文）

### 解决什么问题

登录成功后，很多业务操作需要知道"当前是哪个用户"（如新增员工时记录 `create_user`）。总不能每个 Controller 方法都手动传用户 id，于是把"当前登录用户 id"放到一个全局可访问的地方——**BaseContext**。

### 核心代码（`context/BaseContext`）

```java
package com.sky.context;

public class BaseContext {

    public static ThreadLocal<Long> threadLocal = new ThreadLocal<>();

    public static void setCurrentId(Long id) {
        threadLocal.set(id);
    }

    public static Long getCurrentId() {
        return threadLocal.get();
    }

    public static void removeCurrentId() {
        threadLocal.remove();
    }
}
```

### 原理：ThreadLocal

`ThreadLocal` 是每个线程独立存储的变量：**同一条请求链路（Tomcat 线程）内任何地方都能拿到，线程之间互不可见**。典型请求周期：

```text
JWT拦截器 preHandle：解析 token → BaseContext.setCurrentId(empId)   ← 存
Controller / Service：BaseContext.getCurrentId()                    ← 取
请求处理完：响应返回浏览器
```

### 为什么用静态方法

Tomcat 每个请求由一个线程从头到尾处理，`static` 保证所有类通过 `BaseContext.getCurrentId()` 直接取，不用注入对象；`ThreadLocal` 保证不同请求（不同线程）的 id 不会串。

### 使用链路（新增员工为例）

1. 拦截器解析 JWT：`BaseContext.setCurrentId(empId)`（`JwtTokenAdminInterceptor.java:50`）
2. Service 层设置审计字段：

```java
employee.setCreateUser(BaseContext.getCurrentId());
employee.setUpdateUser(BaseContext.getCurrentId());
```

### 注意：内存泄漏

- ThreadLocal 底层是 Thread 的 Map，key 是弱引用。**如果请求结束不 remove，长生命周期线程（如 Tomcat 线程池复用）会一直持有旧值**，下次请求可能拿到别人的 id 或内存泄漏
- 规范做法：请求结束调用 `BaseContext.removeCurrentId()`（如拦截器 `afterCompletion` 中清理）
- 上面的 BaseContext 提供了 `removeCurrentId()` 就是为此准备的


