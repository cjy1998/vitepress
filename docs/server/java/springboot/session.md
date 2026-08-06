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

## 三者对比

| | Cookie | Session | Token（JWT） |
|---|---|---|---|
| 数据存储位置 | 客户端 | 服务器 | 客户端 |
| 服务器是否有状态 | 无 | 有（内存/Redis） | 无 |
| 跨域支持 | 差（浏览器 SameSite 限制、第三方 Cookie 被拦截） | 差（依赖 Cookie） | 好（请求头携带，无跨域限制） |
| 分布式支持 | 好（数据在客户端，无需服务端共享） | 差（需共享） | 好 |
| 安全性 | 低（可篡改） | 较高 | 较高（签名防篡改） |
| 可存放敏感信息 | 否 | 是 | 否（载荷可被解码） |
| 典型场景 | 记住登录、小数据 | 传统单体项目 | 前后端分离、微服务 |

## 关键点总结

- Cookie 是基础：Session 靠 Cookie 传递 JSESSIONID，Token 靠请求头传递，两者都建立在"客户端每次请求带上凭证"之上。
- 跨域注意：浏览器对 Cookie 有 SameSite 同源限制、第三方 Cookie 默认被拦截，所以跨域场景（如前后端分离、不同域名间）Cookie/Session 会失效，JWT 放 `Authorization` 请求头则没有这个问题。
- 安全红线：Cookie 和 JWT 的 Payload 都是明文/可解码的，**都不要放密码等敏感信息**。
- 选择：单体项目传统方案用 Session；前后端分离、分布式项目用 JWT。
- JWT 密钥：生成和解析必须用同一个密钥，密钥字符串长度需 ≥ 32 字节（HS256 要求），生产环境放配置文件或环境变量。
