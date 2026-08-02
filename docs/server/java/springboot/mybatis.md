## 集成mysql

1. Maven 依赖

```xml
<dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
</dependency>

```

2. application.yml 配置

```yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/your_db?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

## 集成MyBatis

1. Maven 依赖

```xml
 <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>3.0.4</version>
</dependency>

```

2. application.yml 配置

```yml
# MyBatis 配置
mybatis:
  #指定 xml映射配置文件的位置
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.entity
  configuration:re-to-camel-case: true # 开启驼峰映射
    log-impl: org
    map-undersco.apache.ibatis.logging.stdout.StdOutImpl # 开发时打印SQL
```

3. mapper

```java

package com.cjy.mapper;

import com.cjy.pojo.Dept;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface DeptMapper {
//    @Results({
//            @Result(column = "create_time",property = "createTime"),
//            @Result(column = "update_time",property = "updateTime")
//    })
    @Select("select * from dept order by update_time")
    List<Dept> findAll();
    @Delete("delete from dept where id = #{id}")
    void deleteById(Integer id);
    @Options(useGeneratedKeys = true, keyProperty = "id")
    @Insert("insert into dept(name,create_time,update_time) values (#{name},#{createTime},#{updateTime})")
    void addDept(Dept dept);
    @Update("update dept set name=#{dept.name},update_time=#{dept.updateTime} where id = #{id}  ")
    Integer updateDept(Integer id,@Param("dept")  Dept dept);
    @Select("select * from dept where id = #{id} order by update_time")
    Dept getDeptById(Integer id);
}

```

## 集成PageHelper

1. Maven 依赖

```xml
<dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
</dependency>
```

Spring Boot Starter 会自动配置 PageHelper，`application.yaml` 中无需额外配置。

### 工作原理

PageHelper 利用 MyBatis 拦截器机制，在 SQL 执行前自动追加 `LIMIT ? OFFSET ?` 分页语句，无需手动在 SQL 中编写分页参数。

### 使用方式

#### 查询参数对象（EmpQueryParam）

将所有查询条件（分页参数 + 搜索条件）封装为一个对象，替代 Controller 中逐个声明参数的方式：

```java
@Data
public class EmpQueryParam {
    private Integer page = 1;          // 默认第1页
    private Integer pageSize = 10;     // 默认每页10条
    private String name;
    private Integer gender;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate begin;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate end;
}
```

#### Controller 层

用参数对象直接接收请求参数，Spring MVC 自动按字段名绑定：

```java
@GetMapping("")
public Result getList(EmpQueryParam empQueryParam){
    log.info("分页查询参数：{}", empQueryParam);
    PageResult<Emp> pageResult = empService.getList(empQueryParam);
    return new Result(200, "success", pageResult);
}
```

#### Service 层

从参数对象中取出分页参数，调用 `PageHelper.startPage()`：

```java
@Override
public PageResult<Emp> getList(EmpQueryParam empQueryParam) {
    PageHelper.startPage(empQueryParam.getPage(), empQueryParam.getPageSize());
    List<Emp> list = empMapper.getList(empQueryParam);
    Page<Emp> p = (Page<Emp>) list;
    return new PageResult<>(p.getTotal(), p.getResult());
}
```

关键点：

- `PageHelper.startPage(page, pageSize)` 仅对紧随其后的**第一次**查询生效
- 查询结果 `List` 实际上是 `com.github.pagehelper.Page` 的实例，可强转获取分页信息
- `p.getTotal()` 获取总记录数
- `p.getResult()` 获取当前页数据

#### Mapper 层

SQL 中**不需要**编写 `LIMIT` 分页语句，PageHelper 会自动拦截并追加。同时动态 SQL 条件在 XML 中实现：

```java
// Mapper 接口
public List<Emp> getList(EmpQueryParam empQueryParam);
```

```xml
<!-- EmpMapper.xml -->
<select id="getList" resultType="com.cjy.pojo.Emp">
    select * from emp e left join dept d on e.dept_id = d.id
    <where>
        <if test="name != null and name != ''">
            e.name like concat('%',#{name},'%')
        </if>
        <if test="gender != null">
            and e.gender = #{gender}
        </if>
        <if test="begin != null and end != null">
            and e.entry_date between #{begin} and #{end}
        </if>
    </where>
    order by e.update_time desc
</select>
```

#### 分页结果统一封装

自定义 `PageResult` 泛型类：

```java
@Data
@AllArgsConstructor
public class PageResult<T> {
    private Long total;    // 总记录数
    private List<T> rows;  // 当前页数据
}
```

### 与原始分页的对比

原始手动分页方式需要写两条 SQL（查总数 + 查分页数据），且需手动计算偏移量：

```java
// 原始分页（不推荐）
Integer start = (page - 1) * pageSize;
Long total = empMapper.count();                    // select count(*) ...
List<Emp> rows = empMapper.getList(start, pageSize); // select ... limit #{start},#{pageSize}
```

使用 PageHelper 后只需一条业务 SQL，代码更简洁，彻底解耦分页逻辑与业务逻辑。

### 注意事项

1. `startPage` 仅对紧随其后的第一条查询生效，多线程环境下通过 `ThreadLocal` 隔离，互不影响
2. 需要总记录数时，将结果 `List` 强转为 `Page` 即可获取
3. 如果需要 `PageInfo` 对象（包含更多分页信息如页码、总页数等），可使用 `new PageInfo<>(list)` 代替强转 `Page`

## MyBatis 动态 SQL

多条件组合查询是后台管理系统的核心场景。通过 MyBatis 动态 SQL，根据前端传入的参数按需拼接 WHERE 条件，避免写死多条 SQL 或使用 `1=1` 占位。

### 查询参数对象封装

将分页参数与搜索条件统一封装到 `EmpQueryParam` 中，Controller 用对象接收而非逐个声明参数：

```java
@Data
public class EmpQueryParam {
    private Integer page = 1;          // 字段默认值替代 @RequestParam(defaultValue)
    private Integer pageSize = 10;
    private String name;
    private Integer gender;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate begin;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate end;
}
```

**细节说明**：

- `page = 1` / `pageSize = 10`：直接在字段上赋默认值，无需在每个 Controller 方法上加 `@RequestParam(defaultValue = "1")`，代码更干净
- **`@DateTimeFormat(pattern = "yyyy-MM-dd")`**：Spring MVC 默认无法将 `2025-07-29` 这种字符串自动转为 `LocalDate`。加上该注解后，请求参数中的日期字符串（如 `?begin=2025-01-01`）会被自动解析为 `LocalDate` 对象，否则会报类型转换异常
- 参数对象中的字段名与请求参数名自动匹配（Spring MVC 数据绑定机制）

### XML 动态 SQL

MyBatis 提供一系列 XML 标签用于动态拼接 SQL：

#### `<where>` 标签

自动处理 WHERE 子句的生成，核心行为：

- 至少有一个内部条件成立时，自动添加 `WHERE` 关键字
- 自动去除条件块开头多余的 `AND` / `OR`
- 所有内部条件都不成立时，完全省略 `WHERE` 子句（查询全表）

#### `<if>` 标签

根据 test 表达式的结果决定是否加入该条件：

```xml
<select id="getList" resultType="com.cjy.pojo.Emp">
    select * from emp e left join dept d on e.dept_id = d.id
    <where>
        <if test="name != null and name != ''">
            e.name like concat('%',#{name},'%')
        </if>
        <if test="gender != null">
            and e.gender = #{gender}
        </if>
        <if test="begin != null and end != null">
            and e.entry_date between #{begin} and #{end}
        </if>
    </where>
    order by e.update_time desc
</select>
```

**逐条解析 `<if>` 内的 test 表达式**：

| `<if>` 条件                     | 含义                 | 细节                                                                           |
| ------------------------------- | -------------------- | ------------------------------------------------------------------------------ |
| `name != null and name != ''`   | 姓名非空且非空字符串 | 必须同时判空和判空串，否则只传 `?name=`（空串）时会生成 `like '%%'` 的无效条件 |
| `gender != null`                | 性别已传入           | `Integer` 类型，只需判 `!= null`，不存在空串问题                               |
| `begin != null and end != null` | 起止日期都已传入     | 日期范围查询要求两端同时不为空，避免生成 `between null and ...` 的残缺条件     |

**注意每个 `<if>` 内部 SQL 片段必须以 `and` 开头**（除第一个外），`<where>` 标签会自动处理首条 `and` 的去除。同时写 `and` 可保证任意条件组合拼接后的 SQL 语法正确。

#### 生成的 SQL 示例

| 传参                               | 生成的 SQL                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| 无任何条件                         | `select ... where ... order by ...`（有 left join 的 on 条件，无 WHERE）           |
| `?name=张`                         | `select ... where e.name like concat('%','张','%') order by ...`                   |
| `?name=张&gender=1`                | `select ... where e.name like concat('%','张','%') and e.gender = 1 order by ...`  |
| `?begin=2025-01-01&end=2025-06-30` | `select ... where e.entry_date between '2025-01-01' and '2025-06-30' order by ...` |

### 与 PageHelper 配合

动态 SQL 与 PageHelper 协同工作时，完整调用链：

```
请求 GET /emps?page=2&pageSize=5&name=张&gender=1&begin=2025-01-01&end=2025-06-30

Controller:  Spring MVC 将请求参数绑定到 EmpQueryParam 对象
               ↓ @DateTimeFormat 自动将日期字符串转为 LocalDate
Service:      PageHelper.startPage(2, 5)  →  ThreadLocal 记录分页参数
               ↓
Mapper:       MyBatis 解析 XML 动态 SQL → 根据条件拼接 WHERE
               ↓
PageHelper:   拦截 SQL → 追加 LIMIT 5 OFFSET 5  →  同时执行 count 查询
               ↓
返回:         Page<Emp> → getTotal() 获取总数 → getResult() 获取当前页
```

### `@DateTimeFormat` 详解

```java
@DateTimeFormat(pattern = "yyyy-MM-dd")
private LocalDate begin;
```

| 要点             | 说明                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| **作用**         | 将 HTTP 请求参数中的字符串按指定格式解析为日期对象                                               |
| **所属包**       | `org.springframework.format.annotation.DateTimeFormat`                                           |
| **适用类型**     | `LocalDate`、`LocalDateTime`、`LocalTime`、`Date`、`Calendar` 等                                 |
| **常见坑**       | 不加此注解时，Spring 默认只认 `yyyy-MM-dd` 格式的 ISO 标准日期，中文环境或自定义格式必须显式声明 |
| **pattern 说明** | `yyyy` 小写表示日历年；`MM` 大写表示月份（小写 `mm` 是分钟）；`dd` 小写表示日期                  |

### `<where>` 标签原理

深入理解 `<where>` 的自动处理逻辑：

```xml
<where>
    <if test="name != null and name != ''">
        e.name like concat('%',#{name},'%')
    </if>
    <if test="gender != null">
        and e.gender = #{gender}
    </if>
</where>
```

当只有 `gender` 条件成立时，实际渲染的 SQL 片段：

```sql
-- 原始条件片段: "and e.gender = 1"
-- <where> 处理: 自动去除首部的 "and" 关键字
-- 最终 SQL: WHERE e.gender = 1
```

当两个条件都成立时：

```sql
-- <where> 不处理中间的 and
-- 最终 SQL: WHERE e.name like concat('%','张','%') and e.gender = 1
```

### 常用动态 SQL 标签速查

| 标签                          | 用途                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| `<where>`                     | 动态生成 WHERE 子句，自动去除首部 `AND`/`OR`                           |
| `<if test="...">`             | 条件判断，满足时才拼接 SQL 片段                                        |
| `<set>`                       | 动态生成 SET 子句（UPDATE 语句），自动去除尾部逗号                     |
| `<foreach>`                   | 遍历集合生成 `IN (?, ?, ?)` 或批量 INSERT                              |
| `<choose>/<when>/<otherwise>` | 多条件分支，相当于 `switch-case-default`                               |
| `<trim>`                      | 更灵活的字符串裁剪（补充/去除前后缀），`<where>` 和 `<set>` 的底层实现 |
| `<sql>/<include>`             | SQL 片段复用                                                           |

### Mapper：主键回显 `useGeneratedKeys`

```xml
<insert id="save" useGeneratedKeys="true" keyProperty="id">
    insert into emp(username, name, gender, phone, job, salary, image, entry_date, dept_id)
    values (#{userName},#{name},#{gender},#{phone},#{job},#{salary},#{image},#{entryTime},#{deptId})
</insert>
```

| 属性                      | 说明                                                        |
| ------------------------- | ----------------------------------------------------------- |
| `useGeneratedKeys="true"` | 启用 JDBC 的 `getGeneratedKeys()`，获取数据库自动生成的主键 |
| `keyProperty="id"`        | 将获取到的主键值回填到**参数对象**的 `id` 字段              |

### `<foreach>` 批量插入

```xml
<insert id="saveList">
    insert into emp_expr(begin, end, company, job, emp_id) VALUES
    <foreach collection="exprList" item="expr" separator=",">
        (#{expr.begin},#{expr.end},#{expr.company},#{expr.job},#{expr.empId})
    </foreach>
</insert>
```

| 属性                    | 说明                                 |
| ----------------------- | ------------------------------------ |
| `collection="exprList"` | 要遍历的集合，对应 Mapper 方法参数名 |
| `item="expr"`           | 每次遍历的元素别名                   |
| `separator=","`         | 每次迭代之间的分隔符                 |
| `open`                  | 遍历开始前拼接的片段（如 `(`）       |
| `close`                 | 遍历结束后拼接的片段（如 `)`）       |

> **注意**：MySQL 默认 `max_allowed_packet` 为 4MB，批量插入数据量过大时需注意，一般建议每批 500~1000 条。

## resultMap 映射

resultMap 用于解决"数据库列名"与"Java 实体属性名"不一致、多表关联查询时的嵌套结果映射问题，尤其是**一对多**场景（如员工 → 工作经历）。

### 一、resultType 与 resultMap 的区别

| 属性 | 值 | 用途 |
| --- | --- | --- |
| `resultType` | Java 类型（全限定类名或别名） | 自动映射到指定类型，列名与属性名按规则对应（配合驼峰映射） |
| `resultMap` | resultMap 的 **id** | 手动指定映射规则，支持嵌套对象、集合等复杂映射 |


### 二、resultMap 基本结构

```xml
<resultMap id="empResultMap" type="com.cjy.pojo.Emp">
    <!-- <id>：主键映射，MyBatis 用它判断两条记录是不是同一个对象 -->
    <id column="id" property="id"/>
    <!-- <result>：普通字段映射 -->
    <result column="username" property="userName"/>
    <result column="entry_date" property="entryTime"/>
</resultMap>
```

| 标签/属性 | 说明 |
| --- | --- |
| `<resultMap id>` | 映射规则的唯一标识，被 `resultMap="..."` 引用 |
| `<resultMap type>` | 要映射到的实体类（全限定类名） |
| `<id>` | 主键映射。**判断对象唯一性靠它**，集合去重也靠它 |
| `<result>` | 普通列与属性的映射 |
| `column` | 数据库列名 |
| `property` | 实体属性名 |

### 三、一对多 collection 映射

查询员工时同时查出他的多条工作经历（`emp` 1 对 `emp_expr` 多）：

```xml
<resultMap id="empResultMap" type="com.cjy.pojo.Emp">
    <id column="id" property="id"/>
    <result column="username" property="userName"/>
    <!-- 省略其他字段 -->

    <collection property="exprList" ofType="com.cjy.pojo.EmpExpr">
        <id column="expr_id" property="id"/>
        <result column="expr_company" property="company"/>
        <result column="expr_job" property="job"/>
        <result column="expr_begin" property="begin"/>
        <result column="expr_end" property="end"/>
        <result column="emp_id" property="empId"/>
    </collection>
</resultMap>

<select id="getById" resultMap="empResultMap">
    select e.id, e.username, e.name, e.gender, e.phone, e.job, e.salary, e.image,
           e.entry_date, e.dept_id,
           ee.id as expr_id, ee.company as expr_company, ee.job as expr_job,
           ee.`begin` as expr_begin, ee.`end` as expr_end, ee.emp_id
    from emp e
    left join emp_expr ee on e.id = ee.emp_id
    where e.id = #{id}
</select>
```

| 标签/属性 | 说明 |
| --- | --- |
| `<collection property>` | 实体中的集合属性名（如 `exprList`） |
| `<collection ofType>` | 集合元素类型（全限定类名） |
| `<collection id>` | 子对象的**唯一主键**，用于判断元素是否重复 |

### 四、经典坑：`select *` + 联表导致集合只剩一条

#### 症状

控制台 SQL 日志明明查到了 2 行，但接口返回的 `exprList` 只有 1 条工作经历。

```
Columns: id, username, password, name, gender, phone, job, salary, image,
         entry_date, dept_id, create_time, update_time,
         id, begin, end, company, job, emp_id
Row: 1, zhangsan, ..., 1, 15000, ..., 1, 2018-07-01, ..., 阿里巴巴, Java开发, 1
Row: 1, zhangsan, ..., 1, 15000, ..., 2, 2020-07-01, ..., 字节跳动, 后端工程师, 1
```

#### 原因

两张表都有 `id` 和 `job` 列，`select *` 导致列名重复：

1. MyBatis 按**列名**取值，子表的 `id`、`job` 取到的是员工的 id 和岗位；
2. `<id>` 标签判断集合元素唯一性，两条经历的 `id` 都变成了 1，被认为是"同一个对象"；
3. 结果：**集合去重，只剩一条**，且经历里的字段值也是错的。

#### 修复

1. 放弃 `select *`，改为**显式列 + 别名**，给子表列起 `expr_` 前缀；
2. resultMap 中集合部分改用别名；
3. `begin`、`end` 是 MySQL 保留字，起别名时用反引号包裹。

修复后的完整示例见上文"一对多 collection 映射"。

### 五、其他常见坑

#### 1. resultMap 列名写错不报错，只是字段为 null

```xml
<!-- 错误：表里实际列名是 entry_date，结果 entryTime 一直是 null -->
<result column="entry_time" property="entryTime"/>

<!-- 正确 -->
<result column="entry_date" property="entryTime"/>
```

列名映射错误不会抛异常，只会在接口里静默返回 null，排查时可以对照 MyBatis 打印的 SQL 日志中的 `Columns` 列表核对。

#### 2. 不需要返回的敏感字段不要映射

`password` 等字段即使查询出来了，不在 resultMap 中映射就不会返回给前端。

### 六、最佳实践

1. **少用 `select *`**，显式写出列名，可读性好且避免隐患；
2. 联表查询遇到重名列（`id`、`job` 等）必须起别名，且别名要有语义（如 `expr_id`）；
3. collection 的子对象 `<id>` 必须能唯一区分每条记录，否则集合会被去重；
4. 数据库保留字（`begin`、`end`、`order` 等）作为列名/别名时用反引号包裹；
5. 列名与属性名差异不大时，开启驼峰映射 `map-underscore-to-camel-case: true` 可少写很多 `<result>`；
6. 复杂映射统一用 XML + resultMap，注解方式（`@Results`）在多表关联时可读性差。
