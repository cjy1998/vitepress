# HttpClient 使用总结

HttpClient 是 Apache 组织提供的 HTTP 客户端工具包，用来在 Java 代码中主动向外发送 HTTP 请求（替代 JDK 自带的 `HttpURLConnection`）。以下基于 Apache HttpClient **4.x**（sky-take-out 项目所用版本）。

## 一、添加依赖

```xml
<dependency>
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpclient</artifactId>
    <version>4.5.13</version>
</dependency>
```

> ⚠️ 注意版本：4.x 的包名是 `org.apache.http.*`，5.x 的包名改成了 `org.apache.hc.client5.*`，两者 API 同风格但不兼容。sky-take-out 里没有直接引入 httpclient，而是通过微信支付的 `wechatpay-apache-httpclient` 传递依赖进来的，版本跟 4.x。

## 二、为什么用 HttpClient 而不是 HttpURLConnection

- 实现了全部 HTTP 方法（GET / POST / PUT / DELETE...）
- 自动处理连接管理、超时控制，支持连接池
- API 面向对象（请求对象、响应对象、实体对象），比流式操作的 `HttpURLConnection` 好用得多
- HTTPS、代理、重定向都开箱即用

## 三、核心类速查

| 类 | 作用 |
| -- | ---- |
| `CloseableHttpClient` | HTTP 客户端对象，负责发请求（`HttpClients.createDefault()` 创建） |
| `HttpGet` / `HttpPost` | 请求对象，构造时传入 URL |
| `CloseableHttpResponse` | 响应对象，可拿状态码、响应头、响应体 |
| `HttpEntity` | 请求/响应的"实体"（即 body 内容） |
| `EntityUtils` | 工具类，`toString()` 把实体转字符串、`consume()` 释放资源 |
| `URIBuilder` | 构建带查询参数的 URL |
| `RequestConfig` | 超时等请求配置 |

## 四、GET 请求（五步套路）

```java
// 1. 创建 httpclient 对象
CloseableHttpClient httpClient = HttpClients.createDefault();

// 2. 创建请求对象（无参数直接 new HttpGet(url)）
HttpGet httpGet = new HttpGet("http://localhost:8080/user/shop/status");

// 3. 发送请求，接收响应结果
CloseableHttpResponse response = httpClient.execute(httpGet);

// 4. 解析响应
int statusCode = response.getStatusLine().getStatusCode();
HttpEntity entity = response.getEntity();
String content = EntityUtils.toString(entity);

// 5. 关闭资源
response.close();
httpClient.close();
```

逐点讲解：

- **状态码**从 `response.getStatusLine().getStatusCode()` 拿，200 表示成功。
- **响应体**封装在 `HttpEntity` 里，用 `EntityUtils.toString(entity, "UTF-8")` 转成字符串（记得指定编码，防止中文乱码）。
- **带参数的 GET** 不要手动拼 URL，用 `URIBuilder`：

```java
URIBuilder builder = new URIBuilder(url);
if (paramMap != null) {
    for (String key : paramMap.keySet()) {
        builder.addParameter(key, paramMap.get(key));
    }
}
HttpGet httpGet = new HttpGet(builder.build());
// http://localhost:8080/user?name=tom → 自动拼成 ?name=tom
```

## 五、POST 请求

POST 的区别就一个：要往请求里塞 body，即 `httpPost.setEntity(...)`。两种常见形式：

### 1. 表单形式（application/x-www-form-urlencoded）

```java
HttpPost httpPost = new HttpPost(url);

List<NameValuePair> paramList = new ArrayList<>();
for (Map.Entry<String, String> param : paramMap.entrySet()) {
    paramList.add(new BasicNameValuePair(param.getKey(), param.getValue()));
}
// 相当于表单提交 key=value&key2=value2
httpPost.setEntity(new UrlEncodedFormEntity(paramList));
```

### 2. JSON 形式（application/json）

```java
HttpPost httpPost = new HttpPost(url);

JSONObject jsonObject = new JSONObject();
jsonObject.put("code", "xxx");
StringEntity entity = new StringEntity(jsonObject.toString(), "utf-8");
entity.setContentEncoding("utf-8");
entity.setContentType("application/json");
httpPost.setEntity(entity);
```

> 调微信支付这类第三方接口基本都是 JSON 形式，ContentType 必须设置成 `application/json`，否则服务端解析不了。

## 六、超时配置

```java
static final int TIMEOUT_MSEC = 5 * 1000;

private static RequestConfig builderRequestConfig() {
    return RequestConfig.custom()
            .setConnectTimeout(TIMEOUT_MSEC)          // 建立连接超时
            .setConnectionRequestTimeout(TIMEOUT_MSEC) // 从连接池获取连接超时
            .setSocketTimeout(TIMEOUT_MSEC)           // 数据传输（读响应）超时
            .build();
}

httpPost.setConfig(builderRequestConfig());
```

三个超时的区别（面试常问）：

| 配置项 | 含义 |
| ------ | ---- |
| `connectTimeout` | 三次握手建立 TCP 连接的最长等待时间 |
| `connectionRequestTimeout` | 从连接池借出连接的等待时间（没用池时无感） |
| `socketTimeout` | 连接建立后，等对方返回数据的最长时间（最容易被网络波动触发） |

> ⚠️ 不配超时是生产事故的常见来源：下游服务卡死时，你的线程会无限阻塞。所有对外请求务必配超时。

## 七、封装成工具类

项目里把上面的套路封装在 `sky-common` 的 `HttpClientUtil` 中，对外暴露三个静态方法，调用方只需传 url + 参数 Map：

| 方法 | 说明 |
| ---- | ---- |
| `doGet(url, paramMap)` | GET，参数走 `URIBuilder` 拼接 |
| `doPost(url, paramMap)` | POST 表单形式 |
| `doPost4Json(url, paramMap)` | POST JSON 形式（调微信接口用） |

内部统一处理了 URIBuilder、RequestConfig、UTF-8 编码和 try-finally 关闭资源。

## 八、踩过的坑

1. **测试类的包路径**：`@SpringBootTest` 会从测试类所在包**向上**查找 `@SpringBootApplication` 主类。测试类若在默认包（没写 package）或不在主类（如 `com.sky.SkyApplication`）的子包下，会报 `Unable to find a @SpringBootConfiguration`。把测试类放到 `com.sky.test` 这类子包即可。纯发 HTTP 请求的测试其实不依赖 Spring 容器，删掉 `@SpringBootTest` 也能跑。
2. **测试前先启动服务**：测试代码是真实发请求到 `localhost:8080`，服务端没启动会 `Connection refused`。
3. **资源必须关闭**：`response` 和 `httpClient` 都要 close，放进 finally 或 try-with-resources。
4. **`HttpClients.createDefault()` 每次都新建客户端**，频繁调用开销大。生产环境建议用 `PoolingHttpClientConnectionManager` 连接池 + 单例复用 client（Spring 里可注册成 Bean）。

## 九、实际项目一般用什么

裸写 HttpClient 主要是理解底层，生产中一般用高层封装（底层依然是 HttpClient 这一套）：

| 场景 | 用什么 |
| ---- | ---- |
| 调第三方 HTTP 接口 | **RestClient**（Spring Boot 3.2+），老项目用 RestTemplate |
| 微服务之间互调 | **OpenFeign**（最主流） |
| 响应式 / 高并发 | WebClient |

### RestClient：一行顶五步

```java
// GET
String result = RestClient.create()
        .get()
        .uri("http://localhost:8080/user/shop/status")
        .retrieve()
        .body(String.class);

// POST JSON
String result = RestClient.create()
        .post()
        .uri("http://localhost:8080/login")
        .contentType(MediaType.APPLICATION_JSON)
        .body(Map.of("username", "admin"))
        .retrieve()
        .body(String.class);
```

超时、连接池等配置也支持，但默认配置就够日常用。

### OpenFeign：像调本地方法一样调远程接口

微服务场景只需声明接口，不写任何实现：

```java
@FeignClient(name = "shop-service")   // 指向注册中心里的服务名
public interface ShopClient {
    @GetMapping("/user/shop/status")
    Integer getShopStatus();
}
```

```java
@Autowired
private ShopClient shopClient;

Integer status = shopClient.getShopStatus();  // 当本地方法用
```

启用：主启动类加 `@EnableFeignClients`。原理：Feign 给接口生成动态代理，把方法调用翻译成 HTTP 请求，底层还是 HTTP 客户端。
