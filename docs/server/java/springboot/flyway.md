---
lastUpdated: 2026-09-29
outline: deep
---

# Flyway 数据库迁移完整指南

Flyway 是一个数据库版本迁移工具。它把建表、字段调整、索引变更和基础数据初始化等数据库变更保存为迁移脚本，并按照版本顺序自动执行。

适合使用 Flyway 的场景：

- 多人协作开发，需要统一数据库结构；
- 开发、测试、预发布和生产环境需要执行相同变更；
- 希望数据库变更可审查、可追踪、可重复部署；
- Spring Boot 应用需要在启动或发布阶段自动完成数据库升级。

> Flyway 管理的是数据库结构的**向前演进**。生产环境回退通常不是简单执行反向 SQL，而是通过备份恢复或新的修复迁移完成。

## 一、核心工作原理

Flyway 的基本流程如下：

1. 扫描指定目录中的迁移文件；
2. 读取数据库中的 `flyway_schema_history` 历史表；
3. 对比本地迁移文件与已执行记录；
4. 校验版本、文件名和 checksum；
5. 按版本顺序执行尚未应用的迁移；
6. 将执行结果写入历史表。

```text
迁移文件 ──扫描──> Flyway ──对比──> flyway_schema_history
                         │
                         └──执行待迁移 SQL──> 目标数据库
```

### `flyway_schema_history` 表

Flyway 首次运行时会自动创建历史表，默认名称为：

```text
flyway_schema_history
```

常见字段：

| 字段 | 含义 |
| --- | --- |
| `installed_rank` | 实际执行顺序 |
| `version` | 迁移版本，重复迁移通常为空 |
| `description` | 文件名中的描述 |
| `type` | SQL、JDBC、BASELINE 等迁移类型 |
| `script` | 迁移文件名 |
| `checksum` | 文件内容校验值 |
| `installed_by` | 执行迁移的数据库用户 |
| `installed_on` | 执行时间 |
| `execution_time` | 执行耗时，单位通常为毫秒 |
| `success` | 是否执行成功 |

不要手动修改该表。遇到异常时应先确认数据库实际状态，再考虑使用 `repair`。

## 二、Spring Boot 快速接入

### 1. 添加依赖

Spring Boot 3.x 常用 Maven 配置：

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

部分数据库还需要对应的 Flyway 数据库模块。例如 MySQL：

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
</dependency>
```

PostgreSQL：

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

如果项目使用 Spring Boot 依赖管理，一般不要单独指定 Flyway 版本，由 Spring Boot BOM 管理兼容版本。Spring Boot 4 提供 Flyway Starter 时，可以根据当前 Boot 版本的官方依赖说明使用 Starter。

Gradle 示例：

```groovy
dependencies {
    implementation "org.flywaydb:flyway-core"
    implementation "org.flywaydb:flyway-mysql"
}
```

### 2. 创建迁移目录

默认目录：

```text
src/main/resources/db/migration
```

示例结构：

```text
src/main/resources/
└── db/
    └── migration/
        ├── V1__create_user_table.sql
        ├── V2__add_user_status.sql
        ├── V3__create_user_email_index.sql
        └── R__refresh_user_view.sql
```

### 3. 编写第一个迁移

`V1__create_user_table.sql`：

```sql
CREATE TABLE user_account (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL,
    email VARCHAR(128) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_account_email UNIQUE (email)
);
```

`V2__add_user_last_login_at.sql`：

```sql
ALTER TABLE user_account
    ADD COLUMN last_login_at DATETIME NULL;
```

应用启动时，Spring Boot 会自动执行尚未应用的迁移。

### 4. 常用配置

`application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: ${DB_PASSWORD}

  flyway:
    enabled: true
    locations: classpath:db/migration
    validate-on-migrate: true
    clean-disabled: true
    baseline-on-migrate: false
    out-of-order: false

  jpa:
    hibernate:
      ddl-auto: validate
```

#### `enabled: true`

控制 Spring Boot 是否启用 Flyway 自动迁移。

```yaml
spring:
  flyway:
    enabled: true
```

设置为 `true` 后，只要项目中存在 Flyway 依赖并且数据源可用，Spring Boot 启动时就会：

1. 创建或读取 `flyway_schema_history`；
2. 校验已经执行的迁移；
3. 按版本顺序执行待迁移文件；
4. 迁移失败时阻止应用启动。

设置为 `false` 只表示本次启动不运行 Flyway，不会删除迁移文件和历史记录。常见用途是某些测试场景暂时禁用迁移，或者生产环境改由独立 CI/CD Job 执行迁移。

> 如果生产迁移由独立任务负责，可在应用进程中设置为 `false`，避免每个实例启动时都尝试迁移；但必须保证独立任务先成功执行。

#### `locations: classpath:db/migration`

指定 Flyway 扫描迁移文件的位置。`classpath:` 表示从应用 classpath 中读取，因此该配置通常对应：

```text
src/main/resources/db/migration
```

默认目录也是 `classpath:db/migration`。可以配置多个位置：

```yaml
spring:
  flyway:
    locations:
      - classpath:db/migration/common
      - classpath:db/migration/mysql
      - filesystem:/opt/app/migrations
```

- `classpath:`：从打包进 JAR 的资源中读取；
- `filesystem:`：从服务器文件系统读取；
- 多个目录中的迁移会合并后按版本排序，不是按目录配置顺序执行。

迁移目录改变后，Flyway 可能找不到以前执行过的文件并报告 Missing，因此项目运行后不要随意移动或删除历史迁移。

#### `validate-on-migrate: true`

控制每次 `migrate` 前是否校验本地迁移文件与数据库历史记录的一致性。

主要检查：

- 已执行的迁移文件是否仍然存在；
- 文件版本、描述和类型是否匹配；
- 已执行文件的 checksum 是否发生变化；
- 是否存在无法正常解析的迁移。

例如，`V2__add_user.sql` 已经在测试库执行，之后又被修改，启动时会出现 checksum mismatch 并停止迁移。

```yaml
spring:
  flyway:
    validate-on-migrate: true
```

生产环境应保持为 `true`。它能防止迁移历史被悄悄篡改，但不会检查 SQL 是否会锁表、丢数据，也不会验证业务数据是否正确。

#### `clean-disabled: true`

控制是否禁止执行 `flyway clean`。

`clean` 会删除 Flyway 管理的 Schema 中的表、视图、存储过程等对象，是破坏性命令。设置为 `true` 后，即使误执行 `flyway clean` 也会被拒绝：

```yaml
spring:
  flyway:
    clean-disabled: true
```

生产环境必须保持为 `true`。只有本地临时数据库或可随时重建的自动化测试数据库，才可以考虑临时设置为 `false`。

该配置不会影响 `migrate`，也不会在启动时主动清理数据库，它只是给危险的 `clean` 命令加一道保险。

#### `baseline-on-migrate: false`

控制执行 `migrate` 时，遇到“Schema 中已经有表，但不存在 `flyway_schema_history`”的旧数据库，是否自动创建基线。

设置为 `false` 时：

```text
非空数据库 + 没有 Flyway 历史表 → 迁移失败，要求人工确认
```

设置为 `true` 时：

```text
非空数据库 + 没有 Flyway 历史表 → 自动写入基线记录 → 执行高于基线版本的迁移
```

例如基线版本为 `1`，自动基线化后，通常从高于 V1 的迁移开始执行。它不会根据现有表结构自动生成 V1，也不会验证现有数据库是否真的和 V1 一致。

```yaml
spring:
  flyway:
    baseline-on-migrate: false
    baseline-version: 1
```

生产环境推荐保持 `false`。否则连接错数据库时，本应失败的操作可能被自动基线化，削弱 Flyway 的防误操作能力。旧系统第一次接入 Flyway 时，应先备份和核对结构，再人工执行 `baseline`。

> 空数据库不受该配置影响，Flyway 会正常从第一条版本迁移开始执行。

#### `out-of-order: false`

控制是否允许补执行版本号低于当前最高版本的迁移。

假设数据库已经执行：

```text
V1 → V2 → V5
```

之后合并代码时又出现 `V3`：

- `false`：不会补执行 V3，`info` 中通常显示为 Ignored；
- `true`：允许执行 V3，并在历史表中记录为乱序迁移。

```yaml
spring:
  flyway:
    out-of-order: false
```

生产环境通常保持 `false`，通过时间戳版本号或合并前重编号解决分支冲突。开启后，不同环境可能按不同顺序执行相同脚本，容易产生只在部分环境出现的问题。

#### 这组配置的整体效果

当前配置表达的是一套偏安全的默认策略：

```text
应用启动时启用 Flyway
→ 只扫描 classpath:db/migration
→ 迁移前严格校验历史文件
→ 禁止清空数据库
→ 不自动接管未知旧数据库
→ 不允许补执行乱序版本
```

推荐让 Flyway 独立负责数据库结构，避免同时使用以下机制自动建表：

- Hibernate `ddl-auto=update/create/create-drop`；
- Spring 的 `schema.sql`；
- 其他 ORM 的自动同步功能。

如果使用 JPA，生产项目通常配置为：

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
```

这样 Hibernate 只验证实体与数据库结构，不擅自修改数据库。

## 三、迁移文件命名规范

### 1. Versioned Migration：版本迁移

格式：

```text
V<版本>__<描述>.sql
```

示例：

```text
V1__init.sql
V2__create_user_table.sql
V2.1__add_user_email.sql
V202609291430__add_order_index.sql
```

规则：

- 默认版本前缀是大写 `V`；
- 版本与描述之间是两个下划线 `__`；
- 描述中的空格通常用单下划线 `_` 代替；
- 版本只能向前增加；
- 已成功执行的文件不可修改或删除；
- 同一个版本只能存在一个版本迁移。

版本迁移只执行一次。Flyway 会保存 checksum，后续发现文件内容发生变化时会校验失败。

### 2. Repeatable Migration：可重复迁移

格式：

```text
R__<描述>.sql
```

示例：

```text
R__refresh_user_view.sql
R__create_reporting_procedures.sql
R__sync_dictionary_data.sql
```

适合管理：

- 视图；
- 存储过程；
- 函数；
- 触发器；
- 可幂等维护的字典数据。

Flyway 会在以下情况重新执行重复迁移：

- 第一次发现该文件；
- 文件内容变化导致 checksum 变化。

重复迁移在待执行的版本迁移之后执行，并按描述排序。脚本应尽量具备幂等性：

```sql
CREATE OR REPLACE VIEW active_user_view AS
SELECT id, username, email
FROM user_account
WHERE status = 1;
```

不要在重复迁移里直接执行不可重复的普通 `INSERT`：

```sql
-- 不推荐：每次重新执行都可能插入重复数据
INSERT INTO sys_role(name) VALUES ('ADMIN');
```

可以改成数据库支持的幂等写法，或者通过唯一键配合 upsert。

### 3. Undo Migration：撤销迁移

格式通常为：

```text
U<版本>__<描述>.sql
```

它用于撤销对应版本迁移，但属于 Flyway 商业版能力，并且无法自动解决数据丢失、跨版本依赖等问题。多数团队更倾向于编写新的向前修复迁移。

### 4. Baseline Migration：基线迁移

新版本 Flyway 支持以 `B` 为默认前缀的基线迁移文件，例如：

```text
B10__current_database_state.sql
```

它可以让新环境直接从某个较新的数据库快照开始，而已经存在的环境继续保留完整迁移历史。该能力与 `baseline` 命令不是同一个概念：

- **Baseline Migration 文件**：用于压缩新环境需要执行的历史脚本；
- **`baseline` 命令**：在已有数据库中写入一个基线标记。

普通项目初期通常不需要基线迁移文件。

## 四、版本号怎么设计

### 方案一：连续整数

```text
V1__init.sql
V2__add_user.sql
V3__add_order.sql
```

优点是简单直观，适合单人或小团队。

缺点是多人同时开发时容易创建相同版本号。

### 方案二：语义分段

```text
V1.0__init.sql
V1.1__add_user.sql
V1.2__add_order.sql
```

适合按业务版本组织，但并不意味着 Flyway 理解语义化版本含义；Flyway只按版本片段排序。

### 方案三：时间戳

```text
V202609291430__add_user_status.sql
V202609301015__create_order_index.sql
```

适合多人并行开发，版本冲突概率低。团队应统一时间精度和时区，例如固定使用 12 位 `yyyyMMddHHmm`。

> 推荐：小项目使用连续整数；多人并行项目使用时间戳。不要在同一个项目中随意混用多套编号规则。

## 五、日常最常用命令

Spring Boot 自动迁移能覆盖常规启动流程，但本地排查和 CI/CD 中经常需要 Flyway CLI、Maven Plugin 或 Gradle Plugin。

### 1. `migrate`：执行迁移

```bash
flyway migrate
```

作用：校验并执行所有待执行迁移。

Maven Plugin：

```bash
mvn flyway:migrate
```

### 2. `info`：查看状态

```bash
flyway info
```

用于查看：

- 已执行迁移；
- 待执行迁移；
- 执行失败记录；
- 缺失、忽略、未来版本和乱序迁移等状态。

排查问题时通常先执行 `info`，不要一开始就执行 `repair`。

### 3. `validate`：校验一致性

```bash
flyway validate
```

主要检查：

- 已执行迁移是否仍存在；
- 迁移名称、类型和 checksum 是否一致；
- 是否存在无法解析的迁移；
- 已执行记录与本地文件是否匹配。

Spring Boot 默认会在迁移时进行校验。建议在 CI 中单独执行一次验证，使错误更早暴露。

### 4. `repair`：修复历史表

```bash
flyway repair
```

`repair` 可以：

- 删除历史表中的失败迁移记录；
- 将历史表中的 checksum、描述和类型与当前文件重新对齐；
- 将缺失迁移标记为 deleted。

`repair` 不会：

- 自动撤销已经执行的 SQL；
- 自动清理失败迁移留下的表、字段或索引；
- 判断修改历史脚本是否符合业务预期。

正确使用流程：

1. 用 `info`、日志和数据库结构确认失败原因；
2. 手动清理非事务型 DDL 遗留对象；
3. 修正待执行脚本；
4. 确认历史记录确实需要修复；
5. 执行 `repair`；
6. 再执行 `validate` 和 `migrate`。

> checksum 不一致时，优先恢复原来的历史脚本。不要把 `repair` 当成修改已发布脚本后的常规操作。

### 5. `baseline`：接管已有数据库

```bash
flyway baseline
```

适用于数据库已有完整结构，但之前没有使用 Flyway 的情况。执行后 Flyway 会写入一条基线记录，只执行高于基线版本的迁移。

常见配置：

```yaml
spring:
  flyway:
    baseline-version: 1
    baseline-description: Initial existing database
```

接管已有数据库的推荐步骤：

1. 导出并审查当前数据库结构；
2. 创建能代表当前状态的初始化脚本并纳入 Git；
3. 在数据库备份或副本上演练；
4. 明确基线版本；
5. 手动执行一次 `baseline`；
6. 通过 `info` 确认状态；
7. 后续只使用新版本迁移。

### 6. `clean`：清空 Schema

```bash
flyway clean
```

`clean` 会删除 Flyway 管理的 Schema 中的数据库对象，可能造成不可恢复的数据丢失。

生产配置必须保持：

```yaml
spring:
  flyway:
    clean-disabled: true
```

只建议在本地临时数据库或自动化测试数据库中使用。

## 六、常用配置详解

| Spring Boot 配置 | Flyway 原生配置 | 说明 | 建议 |
| --- | --- | --- | --- |
| `spring.flyway.enabled` | `enabled` | 是否启用自动迁移 | 默认开启 |
| `spring.flyway.locations` | `locations` | 迁移文件目录 | 使用固定、可审查目录 |
| `spring.flyway.validate-on-migrate` | `validateOnMigrate` | 迁移前校验 | 保持 `true` |
| `spring.flyway.clean-disabled` | `cleanDisabled` | 禁止 `clean` | 生产保持 `true` |
| `spring.flyway.baseline-on-migrate` | `baselineOnMigrate` | 非空且无历史表时自动基线化 | 默认 `false` |
| `spring.flyway.baseline-version` | `baselineVersion` | 基线版本 | 接管旧库时明确设置 |
| `spring.flyway.out-of-order` | `outOfOrder` | 是否允许执行低于当前版本的遗漏迁移 | 默认 `false` |
| `spring.flyway.target` | `target` | 只迁移到指定版本 | 临时发布控制使用 |
| `spring.flyway.table` | `table` | 历史表名称 | 通常不要修改 |
| `spring.flyway.default-schema` | `defaultSchema` | 历史表和默认对象所在 Schema | 多 Schema 时设置 |
| `spring.flyway.schemas` | `schemas` | Flyway 管理的 Schema 列表 | 多 Schema 项目使用 |
| `spring.flyway.create-schemas` | `createSchemas` | 是否自动创建 Schema | 按权限策略决定 |
| `spring.flyway.encoding` | `encoding` | SQL 文件编码 | 推荐 UTF-8 |
| `spring.flyway.connect-retries` | `connectRetries` | 数据库连接失败重试次数 | 容器环境可适当设置 |
| `spring.flyway.placeholder-replacement` | `placeholderReplacement` | 是否替换占位符 | 默认按需开启 |
| `spring.flyway.placeholders.*` | `placeholders.*` | 自定义占位符值 | 不用于保存秘密 |
| `spring.flyway.validate-migration-naming` | `validateMigrationNaming` | 是否严格校验迁移文件名 | 建议开启 |

推荐配置：

```yaml
spring:
  flyway:
    enabled: true
    locations:
      - classpath:db/migration
    validate-on-migrate: true
    validate-migration-naming: true
    clean-disabled: true
    baseline-on-migrate: false
    out-of-order: false
    encoding: UTF-8
```

### `locations`

支持 classpath 和文件系统路径：

```yaml
spring:
  flyway:
    locations:
      - classpath:db/migration/common
      - classpath:db/migration/mysql
      - filesystem:/opt/app/migrations
```

Spring Boot 还支持 `{vendor}` 占位符：

```yaml
spring:
  flyway:
    locations: classpath:db/migration/{vendor}
```

连接 MySQL 时会加载对应数据库厂商目录，适合一个应用兼容多种数据库。

### `baseline-on-migrate`

```yaml
spring:
  flyway:
    baseline-on-migrate: true
```

当目标 Schema 非空且没有 Flyway 历史表时，Flyway 会在 `migrate` 过程中自动建立基线。

风险：配置到错误数据库时，原本应当失败的迁移可能被自动基线化，削弱防误操作保护。建议只在旧系统首次接入阶段临时使用，生产长期保持 `false`。

### `out-of-order`

假设数据库已经执行到 V5，此时分支合并进来一个 V4：

- `out-of-order=false`：V4 不会自动补执行；
- `out-of-order=true`：允许补执行 V4，并在历史表中标记为乱序执行。

开启后虽然能缓解并行分支合并问题，但最终数据库状态可能受到实际执行顺序影响。优先通过时间戳版本和团队协作避免冲突。

### `target`

```yaml
spring:
  flyway:
    target: 10
```

Flyway 只迁移到指定版本。适合分阶段发布或兼容旧应用，但长期固定 target 容易导致环境漂移，用完应及时移除。

## 七、Placeholder 占位符

配置：

```yaml
spring:
  flyway:
    placeholders:
      app_schema: demo_app
      admin_role: APP_ADMIN
```

SQL 中使用：

```sql
CREATE TABLE ${app_schema}.audit_log (
    id BIGINT PRIMARY KEY,
    operator_role VARCHAR(64) NOT NULL DEFAULT '${admin_role}'
);
```

适用场景：

- 不同环境使用不同 Schema 名称；
- 数据库角色名称不同；
- 少量环境相关的非敏感参数。

注意事项：

- 不要把密码、令牌等秘密直接写入迁移文件；
- 同一迁移在不同环境替换成不同结构时，会增加环境差异；
- 修改占位符可能影响 checksum，重复迁移还可能因此再次执行；
- 核心数据库结构应尽量在所有环境保持一致。

## 八、常见开发场景

### 1. 新增非空字段

如果表中已有数据，不要直接添加没有默认值的非空字段。

推荐拆分：

```sql
-- V10__add_user_level.sql
ALTER TABLE user_account
    ADD COLUMN level_code VARCHAR(32) NULL;
```

```sql
-- V11__fill_user_level.sql
UPDATE user_account
SET level_code = 'NORMAL'
WHERE level_code IS NULL;
```

```sql
-- V12__make_user_level_not_null.sql
ALTER TABLE user_account
    MODIFY COLUMN level_code VARCHAR(32) NOT NULL;
```

### 2. 重命名字段

直接重命名会导致旧版本应用无法运行。生产环境推荐 Expand and Contract：

1. 新增新字段；
2. 新旧代码同时兼容；
3. 回填历史数据；
4. 切换读写到新字段；
5. 确认旧应用不再运行；
6. 在后续版本删除旧字段。

### 3. 创建索引

```sql
CREATE INDEX idx_order_created_at
    ON order_record(created_at);
```

大表创建索引可能长时间锁表。生产执行前应确认：

- 数据库是否支持在线或并发创建索引；
- 是否需要设置锁超时；
- 执行时间和磁盘空间；
- 失败后的清理方式。

Flyway 负责执行顺序，但不会自动保证 SQL 是在线、无锁或低风险的。

### 4. 初始化字典数据

版本迁移示例：

```sql
INSERT INTO sys_dictionary(dict_type, dict_code, dict_name)
VALUES
    ('USER_STATUS', 'ENABLED', '启用'),
    ('USER_STATUS', 'DISABLED', '禁用');
```

如果字典数据后续需要持续同步，可放入重复迁移并使用数据库对应的 upsert 语法。

业务数据通常不应混入结构迁移，尤其是体量大、需要调用外部服务或运行时间不可控的数据修复。

### 5. 大批量数据迁移

不建议在单个 Flyway SQL 中一次更新数千万行。可采用：

- 分批更新；
- 独立数据迁移任务；
- 先增加兼容结构，后台逐步回填；
- 最终再用 Flyway 增加约束或删除旧字段。

数据库结构迁移和大规模业务数据迁移可以由同一发布流程协调，但不一定要由同一个工具完成。

## 九、迁移事务与失败处理

Flyway 是否能整体回滚，取决于数据库和具体 DDL 是否支持事务。

- PostgreSQL 对事务型 DDL 支持较好；
- MySQL 的许多 DDL 会隐式提交，失败后可能留下部分对象；
- 某些并发索引操作要求不能运行在事务中。

针对单个特殊迁移，可以使用与迁移文件同名的脚本配置文件。例如：

```text
V20__create_large_index.sql
V20__create_large_index.sql.conf
```

配置示例：

```properties
executeInTransaction=false
```

只在数据库语句明确要求非事务执行时使用。

迁移失败后：

1. 停止继续发布；
2. 检查迁移日志和数据库实际结构；
3. 判断 DDL 是否已经部分提交；
4. 手动清理遗留对象或完成预期结构；
5. 修复脚本；
6. 必要时执行 `repair`；
7. 重新执行 `validate` 和 `migrate`。

## 十、生产环境推荐流程

### 推荐模式：在发布流水线中执行一次

```text
提交迁移脚本
    ↓
代码审查
    ↓
CI 创建临时数据库并执行全部迁移
    ↓
备份或确认恢复方案
    ↓
发布任务执行 flyway migrate
    ↓
验证数据库状态
    ↓
部署应用实例
```

中大型团队通常不建议每个应用实例同时尝试迁移生产库。可以选择：

- CI/CD 中独立的迁移 Job；
- Kubernetes 中单独的 Job 或发布前任务；
- DBA 审核后通过 DMS、Bytebase、Archery 等平台执行；
- 只允许一个受控实例拥有 DDL 权限。

Flyway 有数据库锁机制来避免多个进程重复执行同一迁移，但独立迁移任务更便于权限隔离、审计和故障处理。

### 应用账号与迁移账号分离

推荐：

- 应用运行账号：仅拥有日常 DML 权限；
- Flyway 迁移账号：拥有必要的 DDL 权限；
- 凭据由部署平台或 Secret 管理系统注入。

Spring Boot 可以单独配置 Flyway 数据源：

```yaml
spring:
  flyway:
    url: ${FLYWAY_DB_URL}
    user: ${FLYWAY_DB_USER}
    password: ${FLYWAY_DB_PASSWORD}
```

### 发布前检查清单

- [ ] 新迁移文件版本唯一；
- [ ] 没有修改已发布迁移；
- [ ] SQL 已经过代码审查；
- [ ] 在空数据库验证过从 V1 全量迁移；
- [ ] 在接近生产版本的数据库副本上验证过增量迁移；
- [ ] 大表 DDL 已评估锁表和执行时间；
- [ ] 数据删除、字段删除等操作已有备份和恢复方案；
- [ ] 新旧版本应用在滚动发布期间兼容；
- [ ] `clean-disabled=true`；
- [ ] 生产使用受控迁移账号；
- [ ] 发布后执行 `info` 或查询历史表确认结果。

## 十一、CI 测试建议

### 1. 测试完整迁移链

每次构建创建空数据库，从第一条迁移执行到最新版本，验证新环境可正常初始化。

### 2. 测试增量迁移

准备接近生产版本的数据库快照，只执行本次新增迁移，验证真实升级路径。

### 3. 配合 Testcontainers

集成测试可启动与生产同类型、尽量同版本的数据库容器，让 Spring Boot 启动时自动执行 Flyway。

测试目录可以追加测试专用迁移：

```text
src/test/resources/db/migration
```

但要避免测试迁移遮盖生产脚本问题。生产迁移仍应作为测试基础。

## 十二、常见报错与处理

### `Validate failed: Migration checksum mismatch`

原因：已经执行过的迁移文件被修改。

处理顺序：

1. 从 Git 恢复原文件；
2. 把新改动放到一个新的迁移文件；
3. 只有确认数据库状态与新文件完全一致时才考虑 `repair`。

### `Found non-empty schema(s) but no schema history table`

原因：已有数据库中存在对象，但尚未建立 Flyway 历史表。

处理：确认目标数据库无误后执行 `baseline`。不要为了消除报错直接永久开启 `baseline-on-migrate`。

### `Detected failed migration`

处理：

1. 检查失败 SQL；
2. 检查是否留下部分表结构；
3. 清理遗留对象；
4. 修正尚未成功发布的迁移；
5. 执行 `repair`；
6. 重新迁移。

### `Detected resolved migration not applied to database`

表示本地存在数据库尚未执行的脚本，通常属于正常 Pending 状态；如果版本低于数据库当前版本，则可能需要处理乱序迁移。

### `Detected applied migration not resolved locally`

表示历史表中有执行记录，但当前代码中找不到对应迁移文件。常见原因：

- 文件被误删；
- 当前分支缺少迁移；
- `locations` 配置发生变化。

优先恢复迁移文件，不要直接修复历史表。

### 文件存在但没有被识别

检查：

- 是否位于 `locations` 指定目录；
- `V`、`R` 是否大写；
- 是否使用两个下划线；
- 后缀是否为 `.sql`；
- 是否存在重复版本；
- 是否开启 `validate-migration-naming` 以便尽早发现错误。

## 十三、团队迁移规范

推荐约定：

1. 一个迁移文件只完成一个明确目的；
2. 文件名使用英文，描述清楚；
3. 已进入共享环境的迁移禁止修改或删除；
4. 所有数据库变更必须通过代码审查；
5. 禁止依赖人工先改数据库、后补脚本；
6. 禁止在迁移脚本中写环境密码；
7. 破坏性变更至少跨两个应用版本完成；
8. 大表操作必须先评估锁、时间和磁盘空间；
9. 迁移脚本和依赖它的应用代码放在同一次发布中；
10. 生产失败时先确认数据库状态，禁止盲目 `repair`。

推荐文件命名：

```text
V202609291430__create_user_account.sql
V202609291510__add_user_status_index.sql
R__refresh_active_user_view.sql
```

## 十四、不经常使用但需要知道的功能

### 1. Java Migration

复杂迁移可以用 Java 实现，例如需要流式处理数据或调用 Java 库。通常继承 `BaseJavaMigration` 并实现迁移逻辑。

缺点：

- 审查不如 SQL 直观；
- 与应用代码和 Flyway API 耦合；
- 数据库变更难以交给 DBA 单独审核。

优先使用 SQL，只有 SQL 明显不适合时才考虑 Java Migration。

### 2. Callback 回调

Flyway 支持在迁移生命周期执行回调，例如：

```text
beforeMigrate.sql
afterMigrate.sql
beforeEachMigrate.sql
afterEachMigrate.sql
afterMigrateError.sql
```

可用于审计、设置会话参数或收集信息。不要把核心结构变更藏在回调中，否则迁移历史难以理解。

### 3. 多 Schema

```yaml
spring:
  flyway:
    default-schema: app
    schemas:
      - app
      - audit
```

`default-schema` 通常决定历史表所在位置以及未限定对象名的默认 Schema。数据库账号必须拥有对应权限。

### 4. 多数据源

可以使用：

- `@FlywayDataSource` 指定迁移数据源；
- 为不同数据源创建独立的 `Flyway` Bean；
- 分别设置不同的 `locations` 和历史表；
- 在部署流水线中为每个数据库独立运行 Flyway。

多数据源没有跨数据库原子事务。必须明确执行顺序和失败补偿方式。

### 5. 自定义历史表

```yaml
spring:
  flyway:
    table: custom_schema_history
```

只有存在表名冲突、权限隔离或平台规范时才需要修改。项目运行后不要随意更名。

### 6. 自定义命名前缀和后缀

Flyway 可以修改版本前缀、重复迁移前缀、分隔符和 SQL 后缀，但会增加新成员的理解成本。除非接入历史规范，否则保持默认：

```text
V1__description.sql
R__description.sql
```

### 7. `ignore-migration-patterns`

可忽略特定类型和状态的迁移校验，例如忽略缺失迁移。它适合特殊历史治理，不适合作为日常绕过校验的手段。

### 8. `cherryPick`

用于只选择特定迁移执行，常见于紧急修复或复杂发布编排，部分能力受 Flyway 版本或授权限制。频繁使用会破坏“所有环境按相同顺序演进”的简单模型。

### 9. Dry Run、Drift、Check

Flyway 商业版提供或增强以下能力：

- 生成待执行 SQL 报告；
- 检查迁移代码质量；
- 检测数据库漂移；
- 比较数据库或 Schema Model；
- 生成部署脚本和发布报告。

普通项目可以先用临时数据库、数据库快照、SQL 审查和 CI 测试覆盖主要需求。

### 10. `undo`

商业版可通过 Undo Migration 回退最近迁移，但它不是通用的安全回滚方案。例如删除列后，反向创建同名列也无法恢复数据。

### 11. 数据库认证与密钥集成

企业环境可能使用 Kerberos、云数据库身份认证、Vault 或其他 Secret Manager。Flyway 可通过命令行、环境变量、配置文件或部署平台注入连接信息。不要将生产凭据提交到 Git。

### 12. 修改迁移执行事务

除了脚本级 `.conf`，Flyway 还支持全局或按迁移控制事务行为。只有数据库明确要求时才关闭事务，否则会增加部分执行成功后的恢复难度。

### 13. 迁移到指定版本

通过 `target` 可暂时停在某个版本。常用于分阶段上线、兼容旧应用或演练，但需要持续监控环境是否落后。

### 14. 乱序迁移

`outOfOrder` 适合处理并行分支产生的旧版本脚本，但不能保证乱序 SQL 在任何执行顺序下都正确。它应是例外机制，不是默认协作方式。

### 15. 自定义迁移解析与数据库扩展

Flyway 支持扩展迁移解析、资源加载和数据库支持。这属于框架或平台级需求，普通业务项目很少需要自行实现。

## 十五、Spring Boot 与 Flyway 的职责边界

| 能力 | Spring Boot | Flyway |
| --- | --- | --- |
| 自动装配数据源 | 是 | 否 |
| 应用启动时触发迁移 | 是 | 提供迁移引擎 |
| 扫描并执行版本脚本 | 通过集成调用 | 是 |
| 保存迁移历史 | 否 | 是 |
| 校验 checksum | 否 | 是 |
| 生成业务实体 | 否 | 否 |
| 自动设计安全 SQL | 否 | 否 |
| 自动保证零停机 | 否 | 否 |
| 自动备份数据库 | 否 | 否 |

Flyway 能确保迁移**按规则执行且有记录**，但 SQL 是否安全、是否锁表、是否兼容滚动发布，仍需要开发者和 DBA 负责。

## 十六、推荐的最小落地方案

对于一般 Spring Boot + MySQL 项目：

1. 引入 `flyway-core` 和 `flyway-mysql`；
2. 迁移统一放在 `src/main/resources/db/migration`；
3. 使用时间戳版本号；
4. 开启命名和迁移校验；
5. 禁止修改已发布迁移；
6. Hibernate 使用 `ddl-auto=validate`；
7. 测试环境验证完整迁移链和增量迁移；
8. 生产通过独立发布任务或 DBA 平台执行；
9. 生产保持 `clean-disabled=true` 和 `baseline-on-migrate=false`；
10. 数据库变更失败后先核对实际状态，再决定是否 `repair`。

最终目录示例：

```text
src/main/resources/db/migration/
├── V202609291000__init_schema.sql
├── V202609291130__create_user_account.sql
├── V202609291430__create_order_record.sql
├── V202609301015__add_order_created_at_index.sql
└── R__refresh_active_user_view.sql
```

推荐配置：

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    validate-on-migrate: true
    validate-migration-naming: true
    clean-disabled: true
    baseline-on-migrate: false
    out-of-order: false
    encoding: UTF-8

  jpa:
    hibernate:
      ddl-auto: validate
```

## 参考资料

- [Flyway 官方文档](https://documentation.red-gate.com/fd/redgate-flyway-documentation-138346877.html)
- [Flyway Migrations](https://documentation.red-gate.com/fd/migrations-271585107.html)
- [Flyway Commands](https://documentation.red-gate.com/fd/commands-277578838.html)
- [Versioned Migrations](https://documentation.red-gate.com/fd/versioned-migrations-273973333.html)
- [Repeatable Migrations](https://documentation.red-gate.com/fd/repeatable-migrations-273973335.html)
- [Migration Placeholders](https://documentation.red-gate.com/fd/migration-placeholders-275218550.html)
- [Schema History Table](https://documentation.red-gate.com/fd/flyway-schema-history-table-273973417.html)
- [Repair Command](https://documentation.red-gate.com/fd/repair-277578892.html)
- [Spring Boot 数据库初始化](https://docs.spring.io/spring-boot/how-to/data-initialization.html)
