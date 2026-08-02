# 事务管理

## 一、什么是事务

事务是一组数据库操作的集合，这些操作被当作一个不可分割的整体：**要么全部成功提交，要么全部失败回滚**。

以新增员工为例（主子表关联写入），需要同时完成两步操作：

1. 向 `emp` 主表插入员工记录，并回显自增 ID；
2. 向 `emp_expr` 子表批量插入该员工的工作经历。

两步操作必须满足“要么同时成功，要么同时失败”，否则会出现主表有数据、子表没数据（或反之）的脏数据，破坏数据的一致性和完整性。

### 事务边界

将两步操作整体纳入**同一个事务范围**内，即可实现原子性控制。事务边界由“开始事务 → 提交 / 回滚”界定。

### ACID 四大特性

| 特性 | 英文 | 说明 |
|---|---|---|
| 原子性 | Atomicity | 事务内操作要么全部成功，要么全部回滚 |
| 一致性 | Consistency | 事务执行前后，数据库始终满足完整性约束 |
| 隔离性 | Isolation | 多个事务并发执行时互不干扰 |
| 持久性 | Durability | 事务提交后，修改被永久保存 |

## 二、Spring 事务管理机制

Spring 框架对事务管理进行了封装，开发者无需手动执行 `START TRANSACTION`、`COMMIT`、`ROLLBACK` 等 SQL 指令。

只需在方法上添加 `@Transactional` 注解，即声明该方法由 Spring 进行事务管理，Spring 会自动完成整个事务生命周期：

1. **方法执行前**：Spring 自动开启事务；
2. **方法全部执行成功**：Spring 自动提交事务；
3. **方法执行中抛出异常**：Spring 自动回滚事务。

```java
@Transactional
public void save(Emp emp) {
    empMapper.save(emp);           // 第一步操作
    empExprMapper.saveList(list);  // 第二步操作
}                                  // 全部成功 → 提交；抛出异常 → 回滚
```

## 三、@Transactional 的作用范围

| 应用位置 | 生效范围 | 说明 |
|---|---|---|
| 方法级 | 仅该方法 | 注解加在业务层具体方法上，只对该方法启用事务控制 |
| 类级 | 类中所有方法 | 注解加在业务层实现类上，该类所有方法均启用事务控制 |
| 接口级 | 所有实现类 | 注解加在业务层接口上，该接口所有实现类的所有方法均启用事务控制 |

**推荐实践：方法级。** 因类或接口中常存在不操作数据库的方法，若加在类或接口上，会导致不必要的事务开销和资源浪费。此外，接口级注解的实现类不一定被 Spring 代理管理，容易失效，应避免使用。

## 四、事务注解适用场景判断

| 场景 | 是否需要事务 | 原因 |
|---|---|---|
| 单次数据库增删改操作 | 不需要 | 无数据不一致风险 |
| 多次数据库增删改操作 | 需要 | 任一失败都需回滚，保证原子性 |

推荐将 `@Transactional` 加在**涉及多次数据库增删改操作的业务方法**上，以确保原子性。

## 五、rollbackFor：控制回滚的异常范围

`rollbackFor` 是 `@Transactional` 中用于控制异常回滚行为的关键属性，它指定“出现何种异常时需执行事务回滚操作”。

### 默认回滚条件

- Spring 事务**默认仅对 `RuntimeException`（运行时异常）及其子类**执行回滚，如 `ArithmeticException`（`1 / 0` 触发）、`NullPointerException`；
- **检查型异常（checked exception）默认不触发回滚**，如 `IOException`、`SQLException`。因为 Spring 认为检查型异常是业务可预期的异常，业务层可能已经处理。

> 源码验证：通过 IDEA 源码导航可确认 `ArithmeticException` 的类声明为 `public class ArithmeticException extends RuntimeException`，故 `1 / 0` 会触发回滚。

### 解决方案：显式指定 rollbackFor

`rollbackFor` 类型为 `Class<? extends Throwable>[]` 数组，支持声明多种异常：

| 写法 | 说明 |
|---|---|
| `rollbackFor = Exception.class` | 所有 `Exception` 及其子类均触发回滚（最常用） |
| `rollbackFor = {SQLException.class, IOException.class}` | 只对指定异常类型回滚 |

```java
@Transactional(rollbackFor = Exception.class)
public void save(Emp emp) {
    // 即使抛出检查型异常也会回滚
}
```

### @Transactional 常用属性总览

| 属性 | 作用 | 默认值 |
|---|---|---|
| `rollbackFor` | 指定触发回滚的异常类型 | 仅 `RuntimeException` / `Error` |
| `propagation` | 事务传播行为 | `REQUIRED` |
| `isolation` | 事务隔离级别 | 数据库默认 |
| `timeout` | 事务超时时间（秒），超时自动回滚 | `-1`（不超时） |
| `readOnly` | 是否只读事务，优化查询性能 | `false` |
| `noRollbackFor` | 指定不触发回滚的异常类型 | 无 |

## 六、事务传播行为 propagation

所谓事务的传播行为，指的是**当一个事务方法被另一个事务方法调用时，该方法应该如何进行事务控制**。

`propagation` 属性共有 7 种取值：

| 传播行为 | 说明 |
|---|---|
| `REQUIRED`（默认） | 需要事务：当前存在事务则加入，不存在则新建 |
| `REQUIRES_NEW` | 需要新事务：挂起当前事务，始终创建全新独立事务 |
| `SUPPORTS` | 支持事务：存在事务则加入，不存在则以非事务方式运行 |
| `NOT_SUPPORTED` | 不支持事务：挂起当前事务，以非事务方式运行 |
| `MANDATORY` | 强制事务：当前不存在事务则抛出异常 |
| `NEVER` | 从不使用事务：当前存在事务则抛出异常 |
| `NESTED` | 嵌套事务：存在事务则创建保存点（Savepoint）嵌套执行，内层回滚不影响外层；不存在则新建事务 |

> 实际开发中重点掌握 `REQUIRED` 与 `REQUIRES_NEW`：`REQUIRED` 有则加入、无则新建；`REQUIRES_NEW` 始终创建独立新事务。

### 典型案例：REQUIRES_NEW 保证日志写入不受主事务回滚影响

新增员工的主业务中，若主业务抛异常（`Integer i = 1 / 0`），`finally` 中仍要记录操作日志。若日志写入复用主事务，主事务回滚时日志也会一并回滚，导致日志丢失。

主业务方法（加入主事务）：

```java
@Transactional(rollbackFor = Exception.class)
@Override
public void save(Emp emp) {
    try {
        emp.setCreateTime(LocalDateTime.now());
        emp.setUpdateTime(LocalDateTime.now());
        empMapper.save(emp);
        Integer i = 1 / 0;                    // 模拟业务异常
        // ...批量插入工作经历
    } finally {
        EmpLog empLog = new EmpLog(null, LocalDateTime.now(), "新增员工信息" + emp);
        empLogService.saveEmpLog(empLog);     // 无论成败都记录日志
    }
}
```

日志方法（REQUIRES_NEW 独立事务）：

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
@Override
public void saveEmpLog(EmpLog empLog) {
    empLogMapper.saveLog(empLog);
}
```

执行流程：

1. 主事务（save）开启 → 执行业务 → 抛出异常 → 进入 `finally`；
2. 调用 `saveEmpLog()` 时，因 `REQUIRES_NEW`，系统**挂起主事务**（suspend current transaction）并**创建新事务**（create new transaction）；
3. 新事务独立执行日志插入 → **新事务提交**（transaction commit）；
4. 新事务完成后，恢复被挂起的主事务 → **主事务回滚**（transaction rollback）。

最终效果：**日志数据已持久化，主业务数据全部回滚。**

## 七、事务隔离级别 isolation

当多个事务并发操作同一数据时，可能产生三类问题：

| 并发问题 | 说明 |
|---|---|
| 脏读 | 读到其他事务**未提交**的数据，该事务回滚后数据失效 |
| 不可重复读 | 同一事务内两次读取同一行，结果不同（期间被其他事务修改并提交） |
| 幻读 | 同一事务内两次查询的结果集行数不同（期间其他事务插入/删除并提交） |

四种隔离级别：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 说明 |
|---|---|---|---|---|
| `READ_UNCOMMITTED` 读未提交 | 可能 | 可能 | 可能 | 隔离性最弱，性能最高 |
| `READ_COMMITTED` 读已提交 | 避免 | 可能 | 可能 | Oracle 默认级别 |
| `REPEATABLE_READ` 可重复读 | 避免 | 避免 | 可能 | **MySQL 默认级别**（InnoDB 配合间隙锁基本避免幻读） |
| `SERIALIZABLE` 串行化 | 避免 | 避免 | 避免 | 完全串行执行，性能最低 |

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void query() {
    // ...
}
```

实际开发中一般遵循数据库默认隔离级别，无需显式配置。

## 八、编程式事务 TransactionTemplate

声明式事务（`@Transactional`）适用于大部分场景；当需要在**同一方法内动态控制提交 / 回滚时机**（如循环内部分提交、根据条件决定回滚）时，可使用编程式事务。

```java
@Service
public class OrderService {
    @Autowired
    private TransactionTemplate transactionTemplate;

    public void createOrder() {
        transactionTemplate.execute(status -> {
            orderMapper.insert(order);   // 正常返回 → 提交
            orderItemMapper.insert(item);
            return null;
            // 抛出运行时异常 → 回滚
        });
    }
}
```

> 注意：`TransactionTemplate` 默认同样只对运行时异常回滚；若需要检查型异常回滚，可在回调中调用 `status.setRollbackOnly()`。

## 九、常见事务失效场景

| 失效场景 | 原因 | 解决方案 |
|---|---|---|
| 异常被 `try-catch` 捕获 | 异常未抛出到事务代理，Spring 认为执行成功 | 捕获后重新抛出，或手动 `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()` |
| 方法内部自调用 | `this.xxx()` 调用绕过 Spring AOP 代理，注解不生效 | 注入自身代理对象，或把被调方法拆到另一个 Bean |
| 方法非 `public` | `private` / `protected` / `final` 方法无法被动态代理拦截 | 使用 `public` 方法 |
| 多线程并发调用 | 事务与当前线程绑定，子线程不共享主线程事务 | 子线程内重新开启事务，或将操作并入主线程 |
| 表引擎不支持事务 | 如 MyISAM 不支持事务 | 使用 InnoDB |
| 传播行为配置不当 | 如 `REQUIRES_NEW` / `NOT_SUPPORTED` 导致不在原事务内 | 按业务需要正确选择传播行为 |
