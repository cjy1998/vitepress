# 注解

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
