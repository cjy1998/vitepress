# 集成日志

## 日志技术 Logback

- JUL（java.util.logging)

  Oracle官方日志框架，配置简单但灵活性差、性能一般，现代项目中极少使用。

- Log4j

  流行日志框架，支持多种输出目标（控制台、文件、数据库）及灵活配置；曾广泛使用，但因性能瓶颈被更优方案替代。

- Logback

  Log4j作者基于其内核重写升级的框架，性能显著优于Log4j、内存占用更低，是当前项目开发推荐使用的日志实现。

- SLF4J（Simple Logging Facade for Java）

  定位：日志门面（Facade），提供统一API接口（如Logger、LoggerFactory）及抽象类，不实现具体日志逻辑；协作机制：Logback与Log4j均为SLF4J规范的具体实现；应用程序面向SLF4J接口编程，底层由Logback等实现类完成实际日志输出；优势：解耦日志API与实现，便于切换底层框架而不修改业务代码。

## 集成SLF4J

1. 引入 logback的依赖（springboot已传递下来）、配置 logback.xml

   ```
   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>

   <!-- 控制台输出 -->
   <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
       <encoder>
           <!--格式化输出 %d 表示日期，%thread 表示线程名  %-5level表示级别从左显示5个字符宽度  %logger显示日志记录器的名称 -->
           <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
           <charset>UTF-8</charset>
       </encoder>
   </appender>

   <!-- 滚动日志文件 -->
   <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
       <file>logs/jy-study.log</file>
       <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
           <fileNamePattern>logs/jy-study-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
           <maxFileSize>10MB</maxFileSize>
           <maxHistory>30</maxHistory>
           <totalSizeCap>1GB</totalSizeCap>
       </rollingPolicy>
       <encoder>
           <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
           <charset>UTF-8</charset>
       </encoder>
   </appender>

   <!-- 日志级别 -->
   <root level="DEBUG">
       <appender-ref ref="CONSOLE"/>
       <appender-ref ref="FILE"/>
   </root>

   <!-- 项目包日志级别 -->
   <logger name="com.cjy" level="DEBUG"/>

   </configuration>

   ```

2. 定义日志记录对象 Logger,调用方法（debug/info/...）记录日志

### 日志级别

五种日志级别（由低到高）：

| 级别  | 调用方法      | 说明                                                                 | 使用频率 |
| ----- | ------------- | -------------------------------------------------------------------- | -------- |
| TRACE | `log.trace()` | 追踪级别日志，记录程序运行轨迹                                       | 较少     |
| DEBUG | `log.debug()` | 调试级别日志，记录程序调试过程中的信息；项目开发中常作为最低有效级别 | 较多     |
| INFO  | `log.info()`  | 记录一般信息，描述程序过程中的关键事件（如网络连接、磁盘IO等）       | 非常多   |
| WARN  | `log.warn()`  | 警告级别日志，记录程序运行中潜在有害或风险情况                       | 相对较多 |
| ERROR | `log.error()` | 错误级别日志，记录程序运行中出现的异常及错误信息                     | 非常多   |

### 日志级别输出控制机制

通过 `<root>` 标签的 `level` 属性控制输出日志的最低级别阈值。

**阈值比较规则**：仅当日志级别 ≥ 配置级别时才会输出。

**配置示例**：

| 配置级别 | 输出的日志级别                          |
| -------- | --------------------------------------- |
| `DEBUG`  | DEBUG、INFO、WARN、ERROR（四级）        |
| `INFO`   | INFO、WARN、ERROR                       |
| `WARN`   | WARN、ERROR                             |
| `ERROR`  | ERROR                                   |
| `TRACE`  | TRACE、DEBUG、INFO、WARN、ERROR（全部） |

**特殊配置值**：

| 值    | 说明         |
| ----- | ------------ |
| `all` | 输出所有日志 |
| `off` | 关闭所有日志 |

### 项目中日志记录器集成实践

#### 传统手动声明方式

在类中手动声明 Logger 对象：

```java
private static final Logger log = LoggerFactory.getLogger(当前类.class);
```

#### @Slf4j 注解自动化方案（推荐）

使用 Lombok 提供的 `@Slf4j` 注解，编译时自动生成上述声明语句，无需手动编写。

```java
@Slf4j
@RestController
public class DeptController {
    // 直接使用 log 变量即可
}
```

#### 占位符日志格式化

使用 `{}` 作为参数占位符，避免字符串拼接，调用重载的 `log.info()` 方法：

```java
// 单参数
log.info("查询部门ID: {}", id);

// 多参数（占位符数量需与后续参数数量严格一致）
log.info("新增部门: {}", dept);
```
