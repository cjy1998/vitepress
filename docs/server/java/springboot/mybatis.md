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

2. mapper

```java

package com.cjy.mapper;

import com.cjy.pojo.Emp;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface EmpMapper {
//----------------------------------原始分页查询---------------------------------
    /**
     *  查询总记录数
     */
//    @Select("select count(*) from emp left join dept on emp.dept_id = dept.id")
//    public Long count();

//    @Select("select emp.*,dept.name as deptName from emp left join dept on emp.dept_id = dept.id order by emp.update_time desc limit #{start},#{pageSize}")
//    public List<Emp> getList(@Param("start") Integer start, @Param("pageSize") Integer pageSize);

//    pagehelper 分页
    @Select("select emp.*,dept.name as deptName from emp left join dept on emp.dept_id = dept.id order by emp.update_time desc")
    public List<Emp> getList();
}


```

3. service

```java
package com.cjy.service.impl;

import com.cjy.mapper.EmpMapper;
import com.cjy.pojo.Emp;
import com.cjy.pojo.PageResult;
import com.cjy.service.EmpService;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpServiceImpl implements EmpService {
    @Autowired
    private EmpMapper empMapper;

    /**
     * 原始分页
     * @return
     */
//
//    @Override
//    public PageResult<Emp> getList(Integer page, Integer pageSize) {
//        Integer start = (page - 1) * pageSize;
//        return new PageResult<>(empMapper.count(),empMapper.getList(start,pageSize));
//    }

    /**
     *  PageHelper 分页
     * @param page
     * @param pageSize
     * @return
     */
    @Override
    public PageResult<Emp> getList(Integer page, Integer pageSize) {
        PageHelper.startPage(page, pageSize);
        List<Emp> list = empMapper.getList();
        Page<Emp> p = (Page<Emp>) list;
        return new PageResult<>(p.getTotal(),p.getResult());
    }
}


```

**注意事项**

1. 在查询前调用 startPage，仅对紧跟其后的第一条 SELECT 生效
2. mapper 语句中的 sql 语句结尾不能使用";"
