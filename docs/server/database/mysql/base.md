## 多表查询

- **连接查询**：基于表间关联关系进行数据合并
- **子查询（嵌套查询）**：在 SELECT 语句中嵌套另一个 SELECT 语句

### 连接查询细分

#### 内连接（INNER JOIN）

仅返回两表关联字段匹配的**交集**数据。

1. 隐式内连接

```sql
select emp.id,emp.name,dept.name from emp,dept where emp.dept_id = dept.id;
```

2. 显式内连接

```sql
select emp.id,emp.name,dept.name from emp inner join dept on emp.dept_id = dept.id;
```

#### 外连接（OUTER JOIN）

- **左外连接（LEFT OUTER JOIN）**：以左表为基准，返回左表全部数据 + 右表匹配数据（无匹配则补 NULL）
- **右外连接（RIGHT OUTER JOIN）**：以右表为基准，返回右表全部数据 + 左表匹配数据（无匹配则补 NULL）

```sql
# 左外：所有员工 + 部门（没有部门也显示）
select e.id,e.name,d.name as dept_name from emp as e left join dept as d on e.dept_id = d.id;
# 右外：所有部门 + 员工（没有员工也显示）
select e.id,e.name,d.name as dept_name from emp as e right join dept as d on e.dept_id = d.id;
```

### 子查询

SQL 语句中嵌套 select 语句，称为嵌套查询，又称子查询。

```sql
select * from t1 where column1 = (select column1 from t2 ...);
```

子查询外部的语句可以是 insert/update/delete/select 的任何一个，最常见的是 select。

分类：

- 标量子查询：子查询返回的结果为单个值

```sql
# 查询 最早入职 的员工信息
select * from emp where entry_date = (select min(emp.entry_date) from emp);
```

- 列子查询：子查询返回的结果为一行

```sql
# 查询“教研部”和“咨询部”的所有员工信息
select * from emp where dept_id in (SELECT id FROM dept WHERE name IN ('教研部', '咨询部'));
```

- 行子查询：子查询返回的结果为一行

```sql
# 和张三同薪资、同部门，且不是张三本人。
select * from emp where ( salary,dept_id) = (select salary, dept_id from emp where name = '张三') and name != '张三';
```

- 表子查询：子查询返回的结果为多行多列

```sql
-- 获取每个部门中薪资最高的员工信息

-- a. 每个部门中的最高薪资

 select dept_id,max(salary) from emp group by dept_id;

-- b.每个部门中薪资最高的员工信息

select  * from emp e,(select dept_id,max(salary) as max_salary from emp group by dept_id) g where e.dept_id = g.dept_id and e.salary = g.max_salary;

```

## 计算函数

### 聚合函数（常和 GROUP BY 一起用）

| 函数 | 作用 | 示例 |
|------|------|------|
| `COUNT(*)` | 行数（含 NULL） | `COUNT(*)` |
| `COUNT(col)` | 非 NULL 个数 | `COUNT(salary)` |
| `COUNT(DISTINCT col)` | 去重计数 | `COUNT(DISTINCT dept_id)` |
| `SUM(col)` | 求和 | `SUM(salary)` |
| `AVG(col)` | 平均（忽略 NULL） | `AVG(salary)` |
| `MAX(col)` | 最大 | `MAX(salary)` |
| `MIN(col)` | 最小 | `MIN(salary)` |
| `GROUP_CONCAT(col)` | 分组拼接字符串 | `GROUP_CONCAT(name)` |

```sql
SELECT dept_id,
       COUNT(*) AS cnt,
       SUM(salary) AS total,
       AVG(salary) AS avg_sal,
       MAX(salary) AS max_sal,
       MIN(salary) AS min_sal
FROM emp
GROUP BY dept_id;
```

### 数值计算

| 函数 | 作用 | 示例 |
|------|------|------|
| `ABS(x)` | 绝对值 | `ABS(-5)` → 5 |
| `CEIL(x)` / `CEILING(x)` | 向上取整 | `CEIL(3.2)` → 4 |
| `FLOOR(x)` | 向下取整 | `FLOOR(3.8)` → 3 |
| `ROUND(x, n)` | 四舍五入 | `ROUND(3.1415, 2)` → 3.14 |
| `TRUNCATE(x, n)` | 截断小数 | `TRUNCATE(3.189, 2)` → 3.18 |
| `MOD(a, b)` / `a % b` | 取余 | `MOD(10, 3)` → 1 |
| `POW(x, y)` / `POWER` | 幂 | `POW(2, 3)` → 8 |
| `SQRT(x)` | 平方根 | `SQRT(9)` → 3 |
| `GREATEST(a,b,...)` | 多个值取最大 | `GREATEST(1,5,3)` → 5 |
| `LEAST(a,b,...)` | 多个值取最小 | `LEAST(1,5,3)` → 1 |

> `MAX/MIN` 是**聚合**（多行一列）；`GREATEST/LEAST` 是**同行多列/多值**比较。

### 字符串

| 函数 | 作用 |
|------|------|
| `CONCAT(a,b)` | 拼接 |
| `LENGTH(s)` / `CHAR_LENGTH(s)` | 字节长 / 字符长 |
| `UPPER` / `LOWER` | 大小写 |
| `SUBSTRING(s, pos, len)` | 截取 |
| `REPLACE(s, from, to)` | 替换 |
| `TRIM(s)` | 去首尾空格 |

### 日期时间

| 函数 | 作用 |
|------|------|
| `NOW()` / `CURDATE()` / `CURTIME()` | 当前日期时间 / 日期 / 时间 |
| `DATE_ADD(d, INTERVAL n DAY)` | 加时间 |
| `DATE_SUB(d, INTERVAL n MONTH)` | 减时间 |
| `DATEDIFF(d1, d2)` | 相差天数 |
| `YEAR` / `MONTH` / `DAY` | 取年/月/日 |
| `DATE_FORMAT(d, '%Y-%m-%d')` | 格式化 |

### 条件 / 空值

| 函数 | 作用 | 示例 |
|------|------|------|
| `IF(cond, a, b)` | 三元 | `IF(salary>10000,'高','低')` |
| `IFNULL(a, b)` | a 为 NULL 用 b | `IFNULL(salary, 0)` |
| `COALESCE(a,b,c)` | 第一个非 NULL | `COALESCE(phone, '无')` |
| `CASE WHEN ... END` | 多分支 | 见下 |

```sql
SELECT name,
       CASE
         WHEN salary >= 15000 THEN '高'
         WHEN salary >= 10000 THEN '中'
         ELSE '低'
       END AS level
FROM emp;
```

### 练习示例

```sql
-- 全表
SELECT COUNT(*), AVG(salary), MAX(salary), MIN(salary), SUM(salary) FROM emp;

-- 按部门
SELECT d.name, COUNT(e.id), ROUND(AVG(e.salary), 2)
FROM dept d
LEFT JOIN emp e ON e.dept_id = d.id
GROUP BY d.id, d.name;

-- 高于平均薪资
SELECT * FROM emp
WHERE salary > (SELECT AVG(salary) FROM emp);
```

**记忆点**：`SUM/AVG/COUNT/MAX/MIN` = 聚合；`ROUND/CEIL/FLOOR` = 单行计算；`GROUP BY` 后才能 `SELECT` 非聚合列。

