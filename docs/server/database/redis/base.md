---
outline: deep
---

## 一、基本概念

### Redis 是什么

Redis（**RE**mote **DI**ctionary **S**erver）是一个开源的、基于内存的 **Key-Value（键值）数据库**，常被当作缓存、消息队列和分布式锁来用。

它的核心特点可以概括为「快、多、持久」：

| 特点 | 说明 |
| --- | --- |
| 基于内存 | 数据主要放在内存中读写，QPS 可达 10w+，远超磁盘数据库 |
| 单线程模型 | 命令执行是单线程的，天然避免了并发竞态，也省去了锁开销 |
| 丰富的数据类型 | 不止 String，还有 Hash、List、Set、ZSet 等，能直接表达业务结构 |
| 持久化 | 支持 RDB、AOF，重启后可以恢复数据 |
| 高可用 / 分布式 | 主从复制、哨兵（Sentinel）、集群（Cluster） |
| 原子性 | 单条命令是原子的；多条命令可用事务或 Lua 脚本保证原子 |

> 注意：Redis 6.0 之后引入了**多线程 IO**，但**命令执行仍然是单线程**的。所以「Redis 是单线程」这句话，指的是核心的命令处理流程。

### 为什么快

1. 纯内存操作，不涉及磁盘 IO（持久化是异步/后台的）。
2. 单线程避免了线程切换和锁竞争的开销。
3. IO 多路复用（epoll）处理大量连接，非阻塞地等待网络事件。
4. 精巧的数据结构（跳表、压缩列表、哈希表等）与高效的编码转换。

### 核心概念

- **Key-Value**：一切数据都以「键 -> 值」的形式存储，键是字符串，值可以是多种数据类型。
- **键的命名规范**：推荐用冒号分层，如 `user:1001:name`、`order:2024:queue`，可读且便于批量管理。
- **数据库**：默认有 **16 个**逻辑库（0~15），通过 `SELECT index` 切换；集群模式下只有 db 0。
- **过期时间（TTL）**：`EXPIRE`、`PEXPIRE`、`SETEX` 等可给键设置存活时间，到期后键被删除。
  - 删除策略是「**惰性删除 + 定期删除**」：访问时才判断是否过期，配合定时抽样清理，兼顾 CPU 和内存。
- **内存淘汰**：内存达到 `maxmemory` 时，按 `maxmemory-policy` 策略处理，常见的有 `noeviction`、`allkeys-lru`、`allkeys-lfu`、`volatile-lru`、`volatile-ttl` 等。

### 常用通用命令

这些命令对所有数据类型都通用：

```bash
KEYS pattern      # 查找键（生产环境慎用，会阻塞）
SCAN cursor       # 游标式增量遍历键，替代 KEYS
EXISTS key        # 判断键是否存在
DEL key           # 删除键
TYPE key          # 查看值的数据类型
TTL key           # 剩余存活时间（秒），-1 永不过期，-2 已不存在
EXPIRE key 60     # 设置 60 秒后过期
PERSIST key       # 移除过期时间
RENAME key newkey # 重命名
FLUSHDB / FLUSHALL # 清空当前库 / 所有库（危险）
```

### 持久化与高可用（了解）

- **RDB**：在指定时间间隔把内存快照写入磁盘（`dump.rdb`），体积小、恢复快，但可能丢最近的数据。
- **AOF**：以追加方式记录每条写命令，实时性好、丢失少，但文件更大、恢复更慢；可用 `appendfsync` 控制刷盘频率（`always` / `everysec` / `no`）。
- **主从复制**：从节点复制主节点数据，实现读写分离与备份。
- **Sentinel**：监控主从、自动故障转移。
- **Cluster**：数据分片（16384 个槽），支持水平扩容。

### 典型应用场景

| 场景 | 说明 |
| --- | --- |
| 缓存 | 热点数据放 Redis，降低数据库压力（注意缓存穿透 / 击穿 / 雪崩） |
| 会话共享 | 集群环境下集中存储 Session / Token |
| 排行榜 | 用 ZSet 天然支持按分数排序 |
| 计数器 / 限流 | `INCR` 原子自增，配合过期时间做接口限流 |
| 消息队列 | 用 List 或 Stream 实现简单的异步队列 |
| 分布式锁 | `SET key value NX PX 30000` 或 Redisson |
| 位统计 / 签到 | Bitmap 极省内存地记录「某用户某天是否打卡」 |

---

## 二、数据类型

Redis 的数据类型分为**五大基础类型**和**四种扩展类型**。

### 1. String（字符串）

最基础的类型，value 是二进制安全的字符串，最大 **512MB**。

底层编码：`int`（整数）、`embstr`（短字符串，≤44 字节）、`raw`（长字符串）。

```bash
SET key value            # 设置
GET key                  # 获取
SETNX key value           # 不存在才设置（分布式锁基础）
SET key value NX PX 10000 # 原子设置 + 过期，做锁的推荐写法
MSET k1 v1 k2 v2          # 批量设置
MGET k1 k2                # 批量获取
INCR / DECR key           # 原子自增 / 自减
INCRBY key 10             # 增加指定数值
APPEND key value          # 追加
STRLEN key                # 长度
GETRANGE key 0 -1         # 截取
SETEX key 60 value        # 设置并带过期时间
```

**典型场景**：缓存对象（JSON 序列化后存）、计数器、分布式锁、限流。

### 2. Hash（哈希）

一个键下存多个「字段 -> 值」的映射，适合存对象，比 String 存 JSON 更省内存、支持按字段更新。

底层编码：小数据量用 `listpack`（旧版 `ziplist`），字段多或值大时转为 `hashtable`。

```bash
HSET user:1 name tom age 18   # 设置多个字段
HGET user:1 name              # 获取单个字段
HMGET user:1 name age         # 获取多个字段
HGETALL user:1                # 获取全部字段
HDEL user:1 age               # 删除字段
HINCRBY user:1 age 1          # 字段自增
HEXISTS user:1 name           # 字段是否存在
HKEYS / HVALS / HLEN user:1   # 所有字段 / 所有值 / 字段数量
```

**典型场景**：购物车（用户 id 为 key，商品 id 为 field，数量为 value）、用户信息对象。

### 3. List（列表）

有序、可重复的双向链表，支持两端插入和弹出，本质是一个**双端队列**。

底层编码：`listpack`（小数据）或 `quicklist`（大数据，即多个 listpack 组成的双向链表）。

```bash
LPUSH key a b c    # 左侧插入
RPUSH key a b c    # 右侧插入
LPOP / RPOP key    # 左侧 / 右侧弹出
LRANGE key 0 -1    # 按索引范围取（0 到 -1 是全部）
LLEN key           # 长度
BLPOP key 5        # 阻塞式左弹出，超时 5 秒（消息队列常用）
LREM key 1 a       # 删除指定值
LTRIM key 0 99     # 只保留前 100 个，其余删除
```

**典型场景**：消息队列、最新列表（朋友圈时间线）、栈 / 队列。

### 4. Set（集合）

无序、**自动去重**的集合，且支持交、并、差运算。

底层编码：元素都是整数且数量少时用 `intset`，否则用 `hashtable`。

```bash
SADD key a b c        # 添加元素
SREM key a            # 删除元素
SMEMBERS key          # 全部元素
SISMEMBER key a       # 是否存在
SCARD key             # 元素个数
SINTER k1 k2          # 交集
SUNION k1 k2          # 并集
SDIFF k1 k2           # 差集
SRANDMEMBER key 3     # 随机取 3 个（不删除）
SPOP key              # 随机弹出（删除）
```

**典型场景**：去重（文章点赞用户）、共同好友（交集）、抽奖（随机取）、标签。

### 5. ZSet（有序集合 / Sorted Set）

每个元素带一个 **score（分数）**，按分数排序，score 相同再按成员字典序排。既能去重，又能排序，是 Redis 最有特色的类型。

底层编码：小数据用 `listpack`，大数据用 **跳表（skiplist）+ 哈希表**——哈希表实现 O(1) 查分数，跳表实现 O(logN) 的范围查询。

```bash
ZADD rank 90 tom 85 jerry   # 添加成员及分数
ZSCORE rank tom             # 查分数
ZINCRBY rank 5 tom          # 增加分数
ZRANGE rank 0 -1 WITHSCORES # 正序取（含分数），-1 表示最后
ZREVRANGE rank 0 9          # 倒序取前 10（排行榜）
ZRANGEBYSCORE rank 80 100   # 按分数区间取
ZRANK / ZREVRANK rank tom   # 正序 / 倒序排名（从 0 开始）
ZCARD rank                  # 成员数量
ZCOUNT rank 80 100          # 区间内成员数量
ZREM rank tom               # 删除成员
```

**典型场景**：排行榜、热度排序、延时队列（score 存时间戳）。

### 6. 扩展类型

| 类型 | 特点 | 常用命令 | 场景 |
| --- | --- | --- | --- |
| Bitmap（位图） | 本质是 String，按 bit 位操作，极省内存 | `SETBIT` `GETBIT` `BITCOUNT` `BITOP` | 签到、活跃用户统计 |
| HyperLogLog | 基数统计，固定约 12KB，标准误差 0.81% | `PFADD` `PFCOUNT` `PFMERGE` | UV 统计（不要求精确） |
| GEO | 地理坐标，底层是 ZSet | `GEOADD` `GEODIST` `GEOSEARCH` | 附近的人 / 门店 |
| Stream | 5.0 引入，支持多播、消费组、ACK 的消息队列 | `XADD` `XREAD` `XGROUP` `XACK` | 可靠消息队列 |

```bash
# Bitmap：id 为 1 的用户第 3 天签到
SETBIT sign:2024:09 1 1
BITCOUNT sign:2024:09          # 统计签到总人数

# HyperLogLog：统计访问用户数
PFADD uv:page:1 u1 u2 u3
PFCOUNT uv:page:1

# GEO：添加坐标并查询附近
GEOADD city 116.40 39.90 beijing 121.47 31.23 shanghai
GEODIST city beijing shanghai km
```

### 数据类型选择速查

| 需求 | 选择 |
| --- | --- |
| 单个值 / 计数 / 锁 | String |
| 对象、按字段更新 | Hash |
| 有序、可重复、先进先出 | List |
| 去重、集合运算 | Set |
| 去重 + 排序 / 排行榜 | ZSet |
| 布尔状态、省内存统计 | Bitmap |
| 海量去重计数（允许误差） | HyperLogLog |
| 地理位置 | GEO |
| 可靠消息队列 | Stream |

---

## 三、常见面试延伸

- **缓存穿透**：查询不存在的数据，缓存不命中，请求全打到数据库。解决：缓存空值、布隆过滤器。
- **缓存击穿**：某个热点 key 过期瞬间，大量请求涌向数据库。解决：互斥锁重建、热点 key 不过期。
- **缓存雪崩**：大量 key 同时过期或 Redis 宕机，数据库被压垮。解决：过期时间加随机值、多级缓存、集群高可用。
- **缓存与数据库一致性**：常用「先更新数据库，再删除缓存」（Cache Aside），配合延迟双删或订阅 binlog 保证最终一致。

**记忆点**：Redis 是内存中的 Key-Value 数据库，核心命令单线程执行；五大基础类型 **String / Hash / List / Set / ZSet**，扩展类型 **Bitmap / HyperLogLog / GEO / Stream**；选型看「是否需要排序、去重、按字段更新」。
