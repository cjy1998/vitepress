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
右外：所有部门 + 员工（没有员工也显示）
select e.id,e.name,d.name as dept_name from emp as e right join dept as d on e.dept_id = d.id;b ON a.id = b.a_id;
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
