---
outline: deep
---

# Spring Boot 集成 Redis

Spring Boot 官方推荐用 **Spring Data Redis** 来操作 Redis，它已经帮我们把连接管理、序列化、命令 API 都封装好了。整篇按「依赖 → 配置 → 序列化 → 常用操作 → 缓存 → 分布式锁 → Session 共享 → 踩坑」的顺序展开，照着做一遍就能跑通。

## 一、技术选型

先理清各层的分工，后面配置才不会乱：

| 层次 | 选择 | 说明 |
| ---- | ---- | ---- |
| 封装层 | **Spring Data Redis** | 官方方案，提供 `RedisTemplate` 等 API |
| 通信客户端 | **Lettuce**（默认）/ Jedis | 底层真正和 Redis 通信的驱动 |
| 分布式锁 | **Redisson** | 锁、限流、布隆过滤器的增强库 |
| 声明式缓存 | **Spring Cache** | 注解式缓存，少写样板代码 |
| 会话共享 | **Spring Session Data Redis** | 集群下统一存 Session |

### Lettuce 和 Jedis 怎么选

- **Lettuce**：基于 Netty，支持异步 / 响应式，**线程安全**，多个线程共享一条连接，Spring Boot 2.x 之后是默认选项。
- **Jedis**：同步阻塞、需要连接池、API 简单直观，老项目见得多；多线程下必须依赖连接池，否则线程不安全。

没有特殊理由就用默认的 Lettuce 即可。

## 二、添加依赖

```xml
<!-- Spring Data Redis（自带 Lettuce） -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- 想让 lettuce.pool 连接池配置生效，必须加这个 -->
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
</dependency>
```

如果确实要用 Jedis，把默认的 Lettuce 排除掉再引入 Jedis：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
    <exclusions>
        <exclusion>
            <groupId>io.lettuce</groupId>
            <artifactId>lettuce-core</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
</dependency>
```

## 三、application.yaml 配置

> ⚠️ Spring Boot 2.4 之后配置前缀从 `spring.redis` 变成了 **`spring.data.redis`**，沿用旧前缀会不生效。下面按 Spring Boot 3.x 写，旧版本请把 `data` 去掉。

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      password: ""          # 没有密码就留空
      database: 0           # 默认 16 个库，按项目分配
      timeout: 3000ms       # 命令超时时间
      lettuce:
        pool:
          max-active: 8     # 最大连接数，-1 表示不限制
          max-idle: 8       # 最大空闲连接
          min-idle: 2       # 最小空闲连接（保证连接可用）
          max-wait: 1000ms  # 连接耗尽时的最大阻塞等待时间
```

### 集群 / 哨兵模式

```yaml
# 哨兵（Sentinel）：主从自动故障转移
spring:
  data:
    redis:
      password: 123456
      sentinel:
        master: mymaster
        nodes: 192.168.1.10:26379,192.168.1.11:26379

# 集群（Cluster）：数据分片
spring:
  data:
    redis:
      password: 123456
      cluster:
        nodes: 192.168.1.10:6379,192.168.1.11:6379,192.168.1.12:6379
        max-redirects: 3   # 重定向次数
```

## 四、序列化配置（关键）

`RedisTemplate` 默认使用 **JDK 序列化**，写进去的 key 会变成 `\xac\xed\x00\x05t\x00\x04user` 这样的二进制串，`redis-cli` 里根本没法看，跨语言也读不了。所以项目里几乎都会自定义序列化器。

```java
package com.cjy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        // key / hashKey 用字符串，保证 redis-cli 里可读
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        // value / hashValue 用 JSON，便于跨语言和人工排查
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();

        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }
}
```

逐点讲解：

- **key 用 `StringRedisSerializer`**：key 本来就是字符串，用 `RedisTemplate<String, Object>` 泛型约束后读写不再需要强转，也方便运维查看。
- **value 用 `GenericJackson2JsonRedisSerializer`**：自动在 JSON 中写入 `@class` 字段记录类型，反序列化时能还原成原对象，取出时**不需要手动转 JSON**。
- **`afterPropertiesSet()`**：让 `RedisTemplate` 完成初始化、校验序列化器是否配置齐全，漏配时能尽早报错。
- **如果对象里有 `LocalDateTime`**：默认 ObjectMapper 不认识 Java 8 时间类型会报错，需要自己传入注册了 `JavaTimeModule` 的 ObjectMapper：

  ```java
  ObjectMapper mapper = new ObjectMapper();
  mapper.registerModule(new JavaTimeModule());
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // 时间输出成字符串
  GenericJackson2JsonRedisSerializer jsonSerializer =
          new GenericJackson2JsonRedisSerializer(mapper);
  ```

- **另一种更稳妥的写法**：只用 `StringRedisTemplate`，value 自己用 Jackson 转成 JSON 字符串。缺点是每次都要手动转，优点是**不依赖 `@class` 元数据**——避免类名变更、跨语言（Python/Go 读写同一份缓存）时反序列化失败。缓存数据要长期演进或跨语言共享时，推荐这种。

## 五、常用操作 API

`RedisTemplate` 通过 `opsForXxx()` 按数据类型分门别类，和原生命令基本一一对应：

| 数据类型 | 入口方法 | 常用 API |
| ---- | ---- | ---- |
| String | `opsForValue()` | `set` `get` `setIfAbsent` `increment` `multiSet` |
| Hash | `opsForHash()` | `put` `get` `entries` `increment` `delete` |
| List | `opsForList()` | `leftPush` `rightPop` `range` `size` |
| Set | `opsForSet()` | `add` `members` `intersect` `isMember` |
| ZSet | `opsForZSet()` | `add` `rangeByScore` `incrementScore` `rank` |
| 通用 | —— | `expire` `hasKey` `delete` `type` |

```java
import org.springframework.data.redis.core.script.DefaultRedisScript;

@Autowired
private StringRedisTemplate redis;

// ---------- String：缓存、计数器 ----------
redis.opsForValue().set("user:1:name", "tom", Duration.ofMinutes(30)); // 带过期时间
String name = redis.opsForValue().get("user:1:name");
Boolean first = redis.opsForValue().setIfAbsent("lock:order", "1", Duration.ofSeconds(10)); // 不存在才设置
Long views = redis.opsForValue().increment("article:1:views"); // 原子自增

// ---------- Hash：对象、按字段更新 ----------
redis.opsForHash().put("user:1", "name", "tom");
redis.opsForHash().put("user:1", "age", "18");
Map<Object, Object> user = redis.opsForHash().entries("user:1");
redis.opsForHash().increment("user:1", "age", 1);

// ---------- List：队列、最新列表 ----------
redis.opsForList().rightPush("queue:order", "1001");   // 入队
String order = redis.opsForList().leftPop("queue:order"); // 出队，非阻塞
String task = redis.opsForList().leftPop("queue:order", Duration.ofSeconds(5)); // 阻塞式，超时返回 null
List<String> latest = redis.opsForList().range("news:latest", 0, 9);

// ---------- Set：去重、共同好友 ----------
redis.opsForSet().add("article:1:likes", "1001", "1002");
Boolean liked = redis.opsForSet().isMember("article:1:likes", "1001");
Set<String> common = redis.opsForSet().intersect("user:1:follow", "user:2:follow");

// ---------- ZSet：排行榜 ----------
redis.opsForZSet().add("rank:week", "tom", 90);
redis.opsForZSet().incrementScore("rank:week", "tom", 5);
Set<String> top10 = redis.opsForZSet().reverseRange("rank:week", 0, 9);
Long rank = redis.opsForZSet().reverseRank("rank:week", "tom");

// ---------- 通用 ----------
redis.expire("user:1:name", Duration.ofMinutes(10));
Boolean exists = redis.hasKey("user:1:name");
redis.delete("user:1:name");

// ---------- 批量操作（减少网络往返）----------
redis.opsForValue().multiSet(Map.of("k1", "v1", "k2", "v2"));
List<String> values = redis.opsForValue().multiGet(List.of("k1", "k2"));
```

**`StringRedisTemplate` 与 `RedisTemplate` 的区别**：

| | `StringRedisTemplate` | `RedisTemplate<String, Object>` |
| --- | --- | --- |
| key/value 类型 | 都是 String | 任意对象 |
| 序列化 | `StringRedisSerializer` | 需自行配置 |
| 适用 | 手动 JSON、计数、锁 | 存对象、图省事 |

`StringRedisTemplate` 其实就是 `RedisTemplate<String, String>` 的预设版本，注入时直接用它最省心。

## 六、Spring Cache 注解式缓存

如果只是给查询结果加缓存，用 Spring Cache 比手写 `opsForValue()` 清爽得多。

**第一步**：开启缓存（加在启动类或配置类上）。

```java
@EnableCaching
@SpringBootApplication
public class Application { }
```

**第二步**：配置 `RedisCacheManager`，控制 TTL 和序列化方式。

```java
package com.cjy.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        // 默认策略：30 分钟过期 + 可读的 key + JSON 序列化的 value
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))
                .computePrefixWith(name -> "cache:" + name + ":")
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()));

        // 不同业务可以配不同的过期时间，避免同一时刻集体失效
        Map<String, RedisCacheConfiguration> configs = Map.of(
                "user", defaultConfig.entryTtl(Duration.ofMinutes(10)),
                "dict", defaultConfig.entryTtl(Duration.ofHours(2))
        );

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(configs)
                .build();
    }
}
```

**第三步**：在业务方法上加注解。

```java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    // 第一次调用查库并写缓存，之后命中缓存直接返回
    @Cacheable(value = "user", key = "#id")
    public User getById(Long id) {
        return userMapper.selectById(id);
    }

    // 总是执行方法，并把返回值覆盖进缓存
    @CachePut(value = "user", key = "#user.id")
    public User update(User user) {
        userMapper.update(user);
        return user;
    }

    // 删除缓存
    @CacheEvict(value = "user", key = "#id")
    public void delete(Long id) {
        userMapper.deleteById(id);
    }

    // 清空整个缓存区域
    @CacheEvict(value = "user", allEntries = true)
    public void clear() { }
}
```

| 注解 | 作用 | 典型位置 |
| ---- | ---- | ---- |
| `@Cacheable` | 先查缓存，命中则不执行方法 | 查询 |
| `@CachePut` | 一定执行方法，结果写入缓存 | 更新 |
| `@CacheEvict` | 删除缓存（可 `allEntries` 清空） | 删除 |
| `@Caching` | 组合多个注解 | 复杂场景 |

## 七、分布式锁

### 方案一：手写（`SET NX PX` + Lua 释放）

```java
@Autowired
private StringRedisTemplate redis;

private static final String UNLOCK_LUA =
        "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";

public void doBusiness(Long orderId) {
    String key = "lock:order:" + orderId;
    String value = UUID.randomUUID().toString();   // 标识锁的持有者
    // 加锁与设置过期时间必须是一条原子命令，避免"设完锁来不及过期，服务就宕机"
    Boolean locked = redis.opsForValue().setIfAbsent(key, value, Duration.ofSeconds(30));
    if (!Boolean.TRUE.equals(locked)) {
        throw new BizException("操作过于频繁，请稍后重试"); // BizException 为项目自定义业务异常
    }
    try {
        // 业务逻辑
    } finally {
        // 释放时必须校验 value，防止误删别人的锁；判断 + 删除要用 Lua 保证原子
        redis.execute(new DefaultRedisScript<>(UNLOCK_LUA, Long.class), List.of(key), value);
    }
}
```

要点：

1. 加锁必须用 `SET key value NX PX`，**不要**拆成 `setnx` + `expire` 两条命令。
2. value 存 UUID，解锁时比对，防止删掉其他线程刚加的锁。
3. 解锁的「比对 + 删除」必须用 Lua 保证原子性。
4. 业务执行时间可能超过锁过期时间，需要**看门狗自动续期**，手写方案很难做完善。

### 方案二：Redisson（推荐）

Redisson 封装了可重入锁、看门狗续期、红锁等完整语义，生产环境优先用它：

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.27.2</version>
</dependency>
```

```java
@Autowired
private RedissonClient redissonClient;

public void doBusiness(Long orderId) {
    RLock lock = redissonClient.getLock("lock:order:" + orderId);
    // 不传 leaseTime 时启用看门狗，默认每 10 秒自动续期，业务没结束锁就不会过期
    lock.lock();
    try {
        // 业务逻辑
    } finally {
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();  // 只有加锁线程能解锁
        }
    }
}
```

> 注意：引入 `redisson-spring-boot-starter` 后，Redisson 会接管连接配置；如果用的是 `spring.data.redis` 前缀之外的自定义配置，需要额外写 `RedissonConfig`，或改用 `redisson.yaml` 单独配置。

## 八、Session 共享

集群部署时，Session 默认存在各自服务器的内存里，请求落到别的机器就丢了。用 Spring Session 把 Session 统一存进 Redis 即可：

```xml
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

```yaml
spring:
  session:
    store-type: redis      # 存储类型
    timeout: 30m           # 会话过期时间
    redis:
      namespace: spring:session  # 存储的 key 前缀
      flush-mode: on_save        # 请求结束时统一写入，性能更好
```

引入依赖并配置后**无需改任何业务代码**，原来的 `HttpSession` API 照常用，数据会自动落到 Redis。

## 九、常见坑

| 问题 | 原因 | 解决办法 |
| ---- | ---- | ---- |
| 存的 key 是乱码 / 带前缀 | `RedisTemplate` 默认 JDK 序列化 | 自定义序列化器，或直接用 `StringRedisTemplate` |
| 反序列化报 `ClassNotFoundException` | `@class` 里写死了旧类名，类被改名或包路径调整 | 缓存用 DTO 而非实体类；跨语言时改用手动 JSON |
| `LocalDateTime` 反序列化失败 | ObjectMapper 未注册 `JavaTimeModule` | 注册 `JavaTimeModule` 并关闭时间戳输出 |
| 连接池配置不生效 | 缺少 `commons-pool2` 依赖 | 显式引入 `commons-pool2` |
| `@Cacheable` 不生效 | 同类内部方法互相调用，不走代理 | 拆到另一个 Bean 中调用，或注入自身代理 |
| `@Cacheable` 拿到 null 也缓存 | 默认允许缓存空值 | 按需设置 `cacheNullValues`，并防止缓存穿透 |
| 缓存与数据库不一致 | 双写顺序不对 | 采用「先更新数据库，再删除缓存」；不一致要求高时用延迟双删或订阅 binlog |
| 大量 key 同时过期 | 过期时间集中，数据库被打垮 | 过期时间加随机值；热 key 逻辑过期或永不过期 |
| `KEYS *` 阻塞 | 单线程执行，全量扫描会卡住整个实例 | 生产环境用 `SCAN` 代替 |
| 大 key / 热 key | 单个 key 数据量大或访问集中 | 拆分 key、控制集合元素数量、本地缓存兜底 |

## 十、小结

1. 依赖：`spring-boot-starter-data-redis`（默认 Lettuce），需要连接池再加 `commons-pool2`。
2. 配置：Spring Boot 3.x 用 `spring.data.redis` 前缀，注意别写成旧的 `spring.redis`。
3. 序列化：一定要改掉默认的 JDK 序列化，key 用 `StringRedisSerializer`，value 用 JSON。
4. 日常操作：`StringRedisTemplate` + `opsForXxx()` 覆盖五大基本类型。
5. 缓存：`@EnableCaching` + `RedisCacheManager`，用 `@Cacheable` / `@CachePut` / `@CacheEvict` 注解化。
6. 分布式锁：手写 `SET NX PX` + Lua 能应付简单场景，生产建议 Redisson。
7. 集群会话：加 `spring-session-data-redis`，`store-type: redis` 即完成 Session 共享。
