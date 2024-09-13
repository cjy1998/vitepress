## ES2016以后
- 空值合并操作符（ ECMAScript 2020 ）
  主要用于处理null或undefined的情况，提供一种更简洁和明确的方式来为变量设置默认值或从多个值中选择第一个非null/undefined的值。
  ```js
    let user;
    alert(user?? "匿名"); // 匿名（user 未定义）

    let user = "john";
    alert(user?? "匿名"); // john（user 已定义）
  ```
  
  