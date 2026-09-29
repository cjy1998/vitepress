# 会话技术（Cookie / Session / Token）

HTTP 协议本身是**无状态**的，每次请求之间相互独立，服务器无法直接知道"你是谁"。会话技术就是为了解决这个问题：让服务器能识别连续请求来自同一个客户端。

## 一、Cookie

- 由**服务器创建**（前端也可用 `document.cookie` 设置），通过 `Set-Cookie` 响应头发送给浏览器，浏览器自动存储，并在后续请求中通过 `Cookie` 请求头带回。
- 数据保存在**客户端**（浏览器），每次请求都会携带，所以**不能存放敏感信息**（可被篡改、窃取）。
- 大小限制：单个 Cookie 约 4KB，一个域名下数量有限。
- 分类：不设置过期时间 → **会话级 Cookie**（关浏览器即失效）；设置 `Max-Age`/`Expires` → **持久 Cookie**。
- 常用属性：`HttpOnly`（禁止 JS 读取，防 XSS 窃取）、`Secure`（仅 HTTPS 传输）、`SameSite`（防 CSRF）、`Domain`/`Path`（限制发送范围）。同父域下可通过设置 `Domain=.example.com` 实现子域共享。

```java
@GetMapping("/addCookie")
public Result addCookie(HttpServletResponse response) {
    response.addCookie(new Cookie("token", "123456"));
    return Result.success();
}

@GetMapping("/getCookie")
public Result getCookie(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("token")) {
                return Result.success(cookie);
            }
        }
    }
    return Result.error("未取到 token");
}
```

## 二、Session

- 数据保存在**服务器端**（内存），服务器为每个客户端分配一个唯一的 `JSESSIONID`，并通过 Cookie（或 URL 重写）带给浏览器。
- 客户端下次请求时带上 JSESSIONID，服务器据此找到对应的 Session 数据。
- 特点：比 Cookie 安全（数据在服务端）；但**占用服务器内存**，集群/多实例部署时需要做 Session 共享（如 Redis），否则请求落到其他服务器会丢失会话。
- 生命周期：默认 30 分钟无操作自动失效（Tomcat 默认值，可通过 `server.servlet.session.timeout` 配置），也可主动调用 `session.invalidate()` 销毁。

```java
@GetMapping("/setSession")
public Result setSession(HttpSession session) {
    session.setAttribute("token", "123456");
    return Result.success();
}

@GetMapping("/getSession")
public Result getSession(HttpSession session) {
    return Result.success(session.getAttribute("token"));
}
```

## 三、Token（JWT）

- 数据保存在**客户端**，服务器不存储任何会话信息（**无状态**），天然支持分布式/微服务。
- 流程：登录成功后服务器签发 token 返回给客户端 → 客户端存储并在后续请求中通过 `Authorization` 请求头携带 → 服务器校验签名后读取里面的信息。
- JWT 结构：`Header(头部).Payload(载荷).Signature(签名)` 三段 Base64 组成，签名用于防止篡改。
- 特点：**无状态、可跨服务验证**；token 一旦签发，过期前无法主动失效（除非维护黑名单）；载荷用 Base64 编码（**不是加密**），谁都能解码查看，**不能放敏感信息**；token 体积比 Cookie 大（三段 Base64），每次请求都携带，稍有网络开销。

```java
// 工具类：src/main/java/com/cjy/util/JwtUtil.java
public class JwtUtil {
    private static final String SECRET = "固定密钥字符串（>=32字节）";
    private static final long EXPIRE_TIME = 12 * 3600 * 1000L; // 12小时

    private static SecretKey getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    // 生成 token
    public static String generateToken(Map<String, Object> claims) {
        return Jwts.builder()
                .signWith(getKey())
                .claims(claims)
                .expiration(new Date(System.currentTimeMillis() + EXPIRE_TIME))
                .compact();
    }

    // 解析 token
    public static Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

## 四、登录后如何在业务中获取当前用户 ID（JWT + ThreadLocal）

### 1. 需求场景

业务中经常需要知道"当前操作的人是谁"，典型场景：

- 新增数据时自动填充**创建人 / 修改人**（如 `create_user`、`update_user` 字段）；
- 查询时只返回当前用户自己的数据（如"我的订单"、"我的地址"）。

注意：**用户 id 不能由前端作为参数传过来**（任何人传个 id 就能伪造他人身份），必须由服务端从凭证中自行解析。

### 2. 整体思路

JWT 本身是无状态的，token 里已经存了用户 id，服务端每次请求解析 token 就能拿到。难点在于：从 Controller 到 Service 层层传递 id 太啰嗦，于是常用**拦截器 + ThreadLocal** 方案：

```text
① 登录成功 → 把用户 id 作为自定义声明放进 JWT payload
② 后续请求 → 客户端在请求头携带 token
③ 拦截器 preHandle → 解析 token、取出 userId → 存入 ThreadLocal
④ 业务代码（任意层）→ BaseContext.getCurrentId() 取用
⑤ 请求结束 → afterCompletion 中 remove 清理
```

### 3. 代码实现

**(1) ThreadLocal 上下文工具类**

```java
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

**(2) 登录时把用户 id 放进 token**

```java
// 登录成功，签发 token 时携带用户 id
Map<String, Object> claims = new HashMap<>();
claims.put("userId", user.getId());
String token = JwtUtil.createJWT(secretKey, ttl, claims);
```

**(3) 拦截器：解析 token 存入 ThreadLocal，请求结束清理**

```java
@Component
public class JwtTokenInterceptor implements HandlerInterceptor {

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 非 Controller 方法（静态资源等）直接放行
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        // 1、从请求头获取令牌
        String token = request.getHeader("token");

        // 2、校验令牌
        try {
            Claims claims = JwtUtil.parseJWT(secretKey, token);
            Long userId = Long.valueOf(claims.get("userId").toString());
            BaseContext.setCurrentId(userId);   // 存入 ThreadLocal
            return true;                        // 3、校验通过，放行
        } catch (Exception ex) {
            response.setStatus(401);            // 4、校验失败，返回 401
            return false;
        }
    }

    /**
     * 请求处理完成后清理 ThreadLocal，防止内存泄漏和串号
     */
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        BaseContext.removeCurrentId();
    }
}
```

**(4) 注册拦截器（登录、注册接口必须放行）**

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtTokenInterceptor)
                .addPathPatterns("/**")                       // 拦截所有请求
                .excludePathPatterns("/login", "/register");  // 放行无需登录的接口
    }
}
```

**(5) 业务代码中获取当前用户 id**

```java
// 新增用户/数据时，自动记录创建人
User user = new User();
BeanUtils.copyProperties(dto, user);
user.setCreateTime(LocalDateTime.now());
user.setUpdateTime(LocalDateTime.now());
user.setCreateUser(BaseContext.getCurrentId());   // ← 获取当前登录用户 id
user.setUpdateUser(BaseContext.getCurrentId());
userMapper.insert(user);
```

### 4. 为什么用 ThreadLocal

| 方案 | 问题 |
| --- | --- |
| 方法参数层层传递 | 所有接口签名都要加参数，侵入性强 |
| 全局静态变量 | 多用户并发访问互相覆盖，线程不安全 |
| **ThreadLocal** | 每个线程一份独立副本，天然隔离并发，且无需改方法签名 |

Tomcat 中每个请求占用一个线程，`ThreadLocal` 正好把"当前请求的用户身份"绑定到该线程上，Service 层在任意深度的方法里都能取到。

### 5. 注意事项

- **登录/注册接口必须 excludePathPatterns**：这些接口还没有 token，被拦截会导致无法登录。
- **请求结束必须 remove**：Tomcat 线程池会复用线程，不清理会导致下一个请求读到上一个请求的用户 id（串号），且 ThreadLocal 持有引用会造成内存泄漏。
- **异步场景取不到**：`ThreadLocal` 只对当前线程生效，`@Async`、线程池、`CompletableFuture` 等子线程中取不到值，需显式传递或用 `TransmittableThreadLocal`。
- **JWT 载荷不是加密**：payload 只是 Base64 编码，不要放密码等敏感信息。
- **多端场景 key 区分**：管理端和用户端可分别使用不同 token 配置与声明 key（如 `empId` / `userId`），并各自注册独立拦截器。

## 五、三者对比

| | Cookie | Session | Token（JWT） |
|---|---|---|---|
| 数据存储位置 | 客户端 | 服务器 | 客户端 |
| 服务器是否有状态 | 无 | 有（内存/Redis） | 无 |
| 跨域支持 | 差（浏览器 SameSite 限制、第三方 Cookie 被拦截） | 差（依赖 Cookie） | 好（请求头携带，无跨域限制） |
| 分布式支持 | 好（数据在客户端，无需服务端共享） | 差（需共享） | 好 |
| 安全性 | 低（可篡改） | 较高 | 较高（签名防篡改） |
| 可存放敏感信息 | 否 | 是 | 否（载荷可被解码） |
| 典型场景 | 记住登录、小数据 | 传统单体项目 | 前后端分离、微服务 |

## 六、关键点总结

- Cookie 是基础：Session 靠 Cookie 传递 JSESSIONID，Token 靠请求头传递，两者都建立在"客户端每次请求带上凭证"之上。
- 跨域注意：浏览器对 Cookie 有 SameSite 同源限制、第三方 Cookie 默认被拦截，所以跨域场景（如前后端分离、不同域名间）Cookie/Session 会失效，JWT 放 `Authorization` 请求头则没有这个问题。
- 安全红线：Cookie 和 JWT 的 Payload 都是明文/可解码的，**都不要放密码等敏感信息**。
- 选择：单体项目传统方案用 Session；前后端分离、分布式项目用 JWT。
- JWT 密钥：生成和解析必须用同一个密钥，密钥字符串长度需 ≥ 32 字节（HS256 要求），生产环境放配置文件或环境变量。
