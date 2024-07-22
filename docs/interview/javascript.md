# javaScript
## 求两个数组的交集
### 方法一：使用filter和includes
```js
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [4, 5, 6, 7, 8];
const intersection = arr1.filter(item => arr2.includes(item));
console.log(intersection); // [4, 5]
```
### 方法二：使用Set数据结构
```js
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [4, 5, 6, 7, 8];
const intersection = Array.from(new Set([...set1].filter(x => set2.has(x))));
console.log(intersection); // [4, 5]
```
### 方法三：使用循环
```js
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [4, 5, 6, 7, 8];
const intersection = [];
or (let item of array1) {
  if (array2.includes(item) &&!intersection.includes(item)) {
    intersection.push(item);
  }
}
console.log(intersection); // [4, 5]
```
## 求两个数组的并集
```js
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [4, 5, 6, 7, 8];
const union = [...new Set([...arr1, ...arr2])];
console.log(union); // [1, 2, 3, 4, 5, 6, 7, 8]
```
## 求两个对象数组的交集
### 方法一：使用 filter 方法和 some 方法
```js
const arr1 = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
const arr2 = [{ id: 2, name: 'Bob' }, { id: 3, name: 'Charlie' }];
const intersection = arr1.filter(item => arr2.some(obj => obj.id === item.id));
console.log(intersection); // [{ id: 2, name: 'Bob' }]
```
### 方法二：使用 reduce 方法
```js
const intersection = arr1.reduce((acc, obj1) => {
  if (arr2.some(obj2 => obj1.id === obj2.id)) {
    acc.push(obj1);
  }
  return acc;
}, []);
console.log(intersection);
```
### 方法三：先将对象数组转换为以对象的某个属性（如 id）为键的对象，然后再进行比较
```js
const obj1 = arr1.reduce((acc, obj) => ({...acc, [obj.id]: obj}), {});
const obj2 = arr2.reduce((acc, obj) => ({...acc, [obj.id]: obj}), {});

const intersection = Object.entries(obj1).filter(([key, value]) => obj2[key]).map(([key, value]) => value);
console.log(intersection);
```
## 闭包是什么？闭包有什么作用？
当一个函数的返回值是另外一个函数，而返回的那个函数如果调用了其父函数内部的变量，且返回的这个函数在外部被执行，就产生了闭包，简单说闭包就是一个环境，能够读取其他函数内部的变量。本质上，闭包是将函数内部和函数外部连接起来的桥梁。
```js
function outerFunction() {
  let count = 0;
  function innerFunction() {
    count++;
    console.log(count);
  }
  return innerFunction;
}

let increment = outerFunction();
increment(); 
increment(); 

```
### 应用场景
1. 实现块级作用域
   ```js
    function foo(){
      var result = [];
      for(var i = 0;i<10;i++){
        result[i] = function(){
          console.log(i)
        }
      }
      return result;
    }
    var result = foo();
    result[0](); // 10
    result[1](); // 10
   ```
   可以看到，每个函数并不像我们期待的那样 result[0]() 打印 0，result[1]() 打印 1，以此类推。
因为 var 声明的 i 不只是属于当前的每一次循环，甚至不只是属于当前的 for 循环,因为没有块级作用域，变量 i 被提升到了函数 foo 的作用域中。所以每个函数的作用域链中都保存着同一个变量 i，而当我们执行数组中的子函数时，此时 foo 内部的循环已经结束，此时 i = 10，所以每个函数调用都会打印 10。
接下来我们对 for 循环内部添加一层即时函数（又叫立即执行函数 IIFE），形成一个新的闭包环境，这样即时函数内部就保存了本次循环的 i，所以再次执行数组中子函数时，结果就像我们期望的那样 result[0]() 打印 0，result[1]()打印 1 …
```js
function foo(){
    var result = [];
    for(var i = 0;i<10;i++){
      (function(i){
        result[i] = function(){
          console.log(i)
        }
      })(i)
    }
    return result;
  }
  var result = foo();
  result[0](); // 0
  result[1](); // 1
```
把var换成let也可以实现，因为let是块级作用域，每次循环都会创建一个新的块级作用域，每个块级作用域中的变量都是独立的，所以每个函数调用都会打印对应的值。
2. 保存内部状态
   ```js
   function cacheCalc(){
      var cache = new Map()
      return function (i){
        if(!cache.has(i)) cache.set(i,i*10)
        return cache.get(i)
      }
    }
    var calc = cacheCalc()
    console.log(calc(2)) // 20
   ```
   可以看到，函数内部会使用 Map 保存已经计算过的结果（当然也可以是其他的数据结构），只有当输入数字没有被计算过时，才会计算，否则会返回之前的计算结果，这样就会避免重复计算。
3. 实现柯里化
   柯里化是可以将一个接受多个参数的函数分解成多个接收单个参数的函数的技术，直到接收的参数满足了原来所需的数量后，才执行原函数的逻辑。
   ```js
    function add(x){
      return function(y){
        return function(z){
          return x+y+z
        }
      }
    }
    console.log(add(1)(2)(3)) // 6
   ```
4. 单例模式
   单例模式是一种常见的涉及模式，它保证了一个类只有一个实例。实现方法一般是先判断实例是否存在，如果存在就直接返回，否则就创建了再返回。单例模式的好处就是避免了重复实例化带来的内存开销：
   ```js
    // 单例模式
    function Singleton(){
      this.data = 'singleton';
    }

    Singleton.getInstance = (function () {
      var instance;
        
      return function(){
        if (instance) {
          return instance;
        } else {
          instance = new Singleton();
          return instance;
        }
      }
    })();

    var sa = Singleton.getInstance();
    var sb = Singleton.getInstance();
    console.log(sa === sb); // true
    console.log(sa.data); // 'singleton'

   ```
5. 模拟私有属性
   javascript 没有 java 中那种 public private 的访问权限控制，对象中的所用方法和属性均可以访问，这就造成了安全隐患，内部的属性任何开发者都可以随意修改。虽然语言层面不支持私有属性的创建，但是我们可以用闭包的手段来模拟出私有属性
   ```js
    // 模拟私有属性
    function getGeneratorFunc () {
      var _name = 'John';
      var _age = 22;
        
      return function () {
        return {
          getName: function () {return _name;},
          getAge: function() {return _age;}
        };
      };
    }

    var obj = getGeneratorFunc()();
    obj.getName(); // John
    obj.getAge(); // 22
    obj._age; // undefined

   ```
   ### 缺点
   ```js
    function foo() {
      var a = 2;

      function bar() {
        console.log( a );
      }

      return bar;
    }

    var baz = foo();

    baz(); // 这就形成了一个闭包

   ```
   javascript 内部的垃圾回收机制用的是引用计数收集：即当内存中的一个变量被引用一次，计数就加一。垃圾回收机制会以固定的时间轮询这些变量，将计数为 0 的变量标记为失效变量并将之清除从而释放内存。
   上述代码中，理论上来说， foo 函数作用域隔绝了外部环境，所有变量引用都在函数内部完成，foo 运行完成以后，内部的变量就应该被销毁，内存被回收。然而闭包导致了全局作用域始终存在一个 baz 的变量在引用着 foo 内部的 bar 函数，这就意味着 foo 内部定义的 bar 函数引用数始终为 1，垃圾运行机制就无法把它销毁。更糟糕的是，bar 有可能还要使用到父作用域 foo 中的变量信息，那它们自然也不能被销毁… JS 引擎无法判断你什么时候还会调用闭包函数，只能一直让这些数据占用着内存。
   ### 解决
   返回的函数调用后，把外部的引用关系置空。
   ```js
    function fn2(){
      let test = new Array(1000).fill('isboyjc')
      return function(){
        console.log(test)
        return test
      }
    }
    let fn2Child = fn2()
    fn2Child()
    fn2Child = null

   ```
   ## 垃圾回收机制
   在 JavaScript 中，垃圾回收机制是自动管理内存的重要部分，其主要目的是回收不再使用的内存空间，以提高程序的性能和避免内存泄漏。
   JavaScript 中的垃圾回收主要基于以下两种常见的算法：
     1. 引用计数：
    - 原理：为每个对象维护一个引用计数器。当对象被引用时，计数器加 1；当引用被删除时，计数器减 1。当计数器为 0 时，对象被认为是不再使用的，会被垃圾回收器回收。
    - 问题：无法处理循环引用的情况。例如，如果两个对象相互引用，但没有被其他对象引用，它们的引用计数都不为 0，然而实际上它们已经不再被使用，这种情况下引用计数算法无法回收它们的内存。
     1. 标记清除：
    - 原理：垃圾回收器会定期从根对象（如全局对象、当前执行上下文的变量对象等）开始，遍历所有可达的对象，并标记它们为“可达”。然后，未被标记的对象被认为是不可达的，即不再使用，会被回收。
    - 优点：能够有效处理循环引用的问题。
  
    为了避免不必要的内存占用和优化性能，在编写 JavaScript 代码时，一些良好的实践包括：
      - 及时解除不再使用的对象引用，例如将变量设置为 null 。
      - 避免创建不必要的全局变量，因为全局变量的生命周期很长，可能会导致内存占用。
      - 对于大型数据结构，如果不再使用，及时进行清理或重置。