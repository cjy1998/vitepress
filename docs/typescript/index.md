# **基础知识**

## **简介**

typescript是js的超集，主要学习ts里面的原始类型、字面量类型、数组类型、函数类型、类类型、接口类型、类型别名、联合与交叉类型、枚举类型、泛型等类型元素，以及类型推断、类型断言、类型缩小、类型放大等特性。

```
npm i -g typescript@4.5.2
```

在项目文件夹中执行tsc -init表示ts初始化项目

```
tsc -init
```

编译当前项目文件夹的ts文件到指定的目录下：

```
tsc -p tsconfig.json
```

开启服务，监听编译当前项目文件夹的ts文件到指定的目录下：

```
 tsc -p tsconfig.json --watch
```



## **二、原始类型**

**string，number，boolean，symbol，null，undefined**

```typescript
TypeScript
export {}; // 第一行增加这个是为了使文件里的变量不污染全局 
let num: number = 1; // number 
let str: string = "2"; // string 
let bool: boolean = true; // boolean 
let sy: symbol = Symbol(); // symbol 
let undef: undefined = undefined; // undefined 
let nul:null = null; // null 
let vd: void = undefined; // 可以把undefined类型赋值给void类型，但是反过来不行 
// 函数没有返回值，那么函数的返回值类型就是void 
function fn(): void { return undefined; }
```

**注意：**

1. **void只用在函数没有返回值的情形下。**
2. **undefined和null最大的价值主要体现在接口类型上，表示可缺省、未定义的属性；null表示对象或者属性是空值。**
3. **如果不写类型typescript是可以推断类型的，但注意let、const的区别**

## **三、非原始类型**

### **小object, 大Object, {}**

小object：代表的是非原始类型的类型，也就是不能是string，number，boolean，symbol，严格模式：多包括null，undefined

```typescript
TypeScript
let obj1: object = 3; // 报错 
let obj2: object = "3"; // 报错 
let obj3: object = true; // 报错 
let obj4: object = null; // 报错 
let obj5: object = undefined; // 报错 
let obj6: object = Symbol(); // 报错 
let obj7:object = {a: 1, b: '2'}; 
let obj8:object = [1, 2, 3];
```

大Object ：代表所有拥有 toString、hasOwnProperty 方法的类型，所以所有**原始类型、非原始类型**都可以赋给 Object，严格模式下不包括null，undefined。{}空对象类型和大 Object 一样。

```typescript
TypeScript 
let obj1: Object = 3; 
let obj2: Object = "3"; 
let obj6: Object = Symbol(); 
let obj3: Object = true; 
let obj4: Object = null; // 报错 
let obj5: Object = undefined; // 报错 
let obj7: Object = { a: 1, b: "2" }; 
let obj8: Object = [1, 2, 3];
```

**注意：**

1. **官方文档说可以使用小 object 代替大 Object，但是我们仍要明白大 Object 并不完全等价于小 object。**
2. **上面的例子看起来，大Object是小object的父类型，但并不是！！！真实的情况是大Object才是小object的子类型**

### **数组类型**

**数组类型的定义：**

```typescript
TypeScript 
let arr1: Array<number> = [1, 2, 3]; 
arr1.push('3'); // 报错 
arr1.push(5); 
let arr2: string[] = ['4', '5', 'a']; 
arr2[3] = '6';
```



### **字面量类型**

- 字面量不仅可以表示值，还可以表示类型

```typescript
TypeScript 
let x3: 1 | 3 = 1; 
x3 = 2; // 报错 
x3 = 3; 
let x4:'hello' = 'hello'; 
x4 = 'hi'; // 报错
```

**注意：**

 **TypeScript支持 3 种字面量类型：string字面量类型、number字面量类型、boolean字面量类型**

### **联合类型**

可以把“|”类比为 JavaScript 中的逻辑或 “||”，只不过前者表示可能的类型。

```typescript
TypeScript 
let age: number | string = 20;
```

### **交叉类型**

在 TypeScript 中，还存在一种类似逻辑与行为的类型——交叉类型（Intersection Type），它可以把多个类型合并成一个类型，合并后的类型将拥有**所有成员类型**的特性。使用“&”操作符来声明交叉类型(并集)。

```typescript
TypeScript 
// 思考这里有一个值满足m的类型要求吗？ 
let m : string & number; 
let zs: { name: string; age: number } & { height: number } = 
{ name: "张三", age: 20, height: 180, };
```

### **联合、交叉组合**

联合、交叉类型本身就可以直接组合使用，这就涉及 |、& 操作符的优先级问题。联合操作符 | 的优先级低于交叉操作符 &，同样，我们可以通过使用小括弧 () 来调整操作符的优先级，这个和js一样。

```typescript
TypeScript 
let m:{ id: number } & { name: string } | { id: string } & { name: number };
m = { id: 1, name: '' } m = { id: '', name: 1 }
```

## **四、any&&unknown**

- any 指的是一个任意类型，它是官方提供的一个选择性绕过静态类型检测的作弊方式。非常不建议使用；**Any is Hell（Any 是地狱）**
- unknown 是 TypeScript 3.0 中添加的一个类型，它主要用来描述类型并不确定的变量。和any的区别就是会进行类型检测。

```typescript
TypeScript 
let unk: unknown; 
let x = 1; 
let y = "2"; 
if (x) { unk = x; } else { unk = y; } // 使用unknown后，typescript会做类型检测 
unk.toFixed(2); // 报错
// any会绕过类型检测，所以下面不会有问题提示 
let an1: any; an1.toFixed(2); 
// 通过缩小类型可以通过类型检测 
if (typeof unk === 'number') { unk.toFixed(2); }
```

**注意：**

1. **可以把任何类型的值赋值给unknown，但是unknown类型的值只能赋值给any或者unknown；**
2. **unknown比any好的地方，还有一个就是它可以通过缩小类型的手段类确定类型**

## **五、never类型**

- never 表示永远不会发生值的类型

```typescript
TypeScript 
function throwErrFn():never { throw new Error('出错了'); }
```

**注意：**

1. **如果函数里是死循环，返回值类型也是never**
2. **never 是所有类型的子类型**

## **六、接口（interface）**

TypeScript 不仅能帮助前端改变思维方式，还能强化面向接口编程的思维和能力，而这正是得益于 Interface 接口类型。

### **定义变量和函数的类型**

使用接口定义变量和函数参数的类型

```typescript
TypeScript 
interface PersonInfo { name: string; age: number; } 
// 定义变量的类型 
let zhangsan: PersonInfo = { name: "张三", age: 20, }; 
// 定义数组的类型 
interface ArrayNumber { [idx: number]: number; } let arr1: ArrayNumber = [1, 2, 3]; 
// 定义函数的类型 
interface PersonFn { (p: PersonInfo): void; } let Person1: PersonFn = (obj: PersonInfo): void => { console.log(obj.name, obj.age); };
```

**注意：**

1. **很少使用接口类型来定义函数的类型，更多使用内联类型或类型别名配合箭头函数语法来定义函数类型；**

### **继承**

多个不同接口之间是可以实现继承的，但是如果继承的接口PersonInfo和被继承的接口NameInfo有相同的属性，并且类型不兼容，那么就会报错。

```typescript
TypeScript 
interface NameInfo { name: string; } 
interface AgeInfo { age: number; } 
interface PersonInfo extends NameInfo, AgeInfo { height: number; } 
let zs: PersonInfo = { name: "张三", age: 20, height: 177, };
```

多个不同的接口可以实现继承，组合成一个新的接口，那么如果出现多个相同名字的接口会怎么样？

### **多个相同接口**

多个相同名字的接口，会进行合并，得到一个新的接口；这个接口的特性一般用在扩展第三方库的接口类型。

```typescript
TypeScript 
interface PersonInfo { name: string, age: number } 
interface PersonInfo { name: string, height: number } 
let zs: PersonInfo = { name: "张三", age: 20, height: 177, };
```

### **缺省和只读特性**

```typescript
TypeScript 
interface PersonInfo { name?: string; // 缺省 readonly height: number; // 只读 }
```

## **七、类型别名（type）**

接口类型的一个作用是将内联类型抽离出来，从而实现类型可复用。其实，我们也可以使用类型别名接收抽离出来的内联类型实现复用。格式：type 别名名称 = 类型定义。

### 1. **基础使用**

```typescript
TypeScript 
type PersonInfo = { name: string; age: number }; 
let zs: PersonInfo = { name: "张三", age: 20, };
```

### 2. **特定使用场景**

大家可能觉得这个和接口没多大区别，这不是重复了吗？其实不是，类型别名可以针对接口没法覆盖的场景，例如组合类型、交叉类型等；

```typescript
TypeScript 
// 1. 组合类型 
type NumAndString = number | string; 
// 2. 交叉类型 
type SectionType = { name: string; age: number } & { height: number; name: string; }; interface PersonInfo { name: string; height: number; } 
// 3. 提取接口属性类型 
type PersonHeight = PersonInfo["height"]; let zs: SectionType = { name: "张三", age: 20, height: 180, }; 
// 黑魔法 
type BorderColor = 'black' | 'red' | 'green' | 'yellow' | 'blue' | string & {}; // vscode提示字面类型都被保留
```

### 3. **Interface 与 Type 的区别**

实际上，在大多数的情况下使用接口类型和类型别名的效果等价，但是在某些特定的场景下这两者还是存在很大区别。

1. **重复定义的接口类型，它的属性会叠加，这个特性使得我们可以极其方便地对全局变量、第三方库的类型做扩展**
2. **如果我们重复定义类型别名，那么就会报错**

## **七、函数类型**

### 1. **基础定义**

显式指定函数参数和返回值的类型

```typescript
TypeScript 
const add = (a: number, b: number): number => { return a + b; }

//或者用type来声明函数类型

TypeScript 
type addFnType = (a: number, b:number) => number; let addFn: addFnType = (num1, num2) => { return num1 + num2; }
```

### 2. **函数参数类型**

参数一般有：可选参数、默认参数、剩余参数；

### 3. **可选参数**

在类型标注的:前添加?表示 log 函数的参数 x 就是可缺省的；

```typescript
TypeScript 
function log(msg?: string):void { console.log(msg); }
```

可缺省是不是相当于msg参数的类型就是和string | undefined等价呢？这个当然不是，string | undefined的意思是这两个类型中的一种，而可缺省是不传的意思。

### 4. **默认参数**

```typescript
TypeScript
function addFn1(num1: number = 1, num2: number = 2):number { return num1 + num2; }
```

**函数的默认参数类型必须是参数类型的子类型**

```typescript
TypeScript
function log3(x: number | string = 'hello') { console.log(x); }
```

这里x参数的类型就是联合类型number | string，函数默认参数的类型就是联合类型的子类型

### 5. **剩余参数**

```typescript
TypeScript
function sum(...nums: number[]) { return nums.reduce((a, b) => a + b, 0); } sum(1, 2); 
// => 3 sum(1, 2, 3); // => 6
```

### 6. **this**

函数中的this问题，一直都是javascript最令人头疼的问题，因为this的指向只有函数调用的时候才能确定。还有一些可以改变this指向的方法（apply，call，bind）。

但是在Typescript中，必须要明确的指定this的类型（严格模式下）。

```typescript
TypeScript 
type objType = {person: (n: string) => void, myname: string};
function person(this: Window | objType , name: string):void { 
    this.myname = name; console.log(this.myname); 
} 
window.person = person; 
window.person('window name'); 
let obj:objType = { person, myname: '' }; 
obj.person('obj name');
```

单单是上面的代码是有问题的，我们还需要创建一个类型声明文件**global.d.ts**，为window对象上扩展两个属性person、myname；

```typescript
TypeScript
interface Window { person: (n: string) => void; myname: string; }
```

**定义对象的函数属性时，只要实际调用中 this 的指向与指定的 this 指向不同，TypeScript 就能发现 this 指向的错误**

```typescript
TypeScript 
interface ObjType2 { name: string; say: (this: ObjType2) => void; } 
let obj2:ObjType2 = { 
    name: 'obj2', 
    say() { console.log(this.name);
          } }
obj2.say(); // ok
let t11 = obj2.say; 
t11();
```

**注意：**

1. **显式声明函数的返回值类型为 undfined，则会出现错误提示，如果没有返回值，我们用void表示；**
2. **注意：显式注解函数中的 this 类型，它表面上占据了第一个形参的位置，但并不意味着函数真的多了一个参数，因为 TypeScript 转译为 JavaScript 后，“伪形参” this 会被抹掉，这算是 TypeScript 为数不多的特有语法。**

## **八、枚举**

### 1. **数字枚举和字符串枚举**

枚举的作用在于定义被命名的常量集合，一个默认从 0 开始递增的数字集合，称之为数字枚举。也可以指定值，这里可以指定的值可以是数字或者字符串。

```typescript
TypeScript 
enum Days { Sunday = 1, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday } 
let day = Days.Sunday;
```

## **九、泛型**

### 1. **什么是泛型？**

泛型指的是**类型参数化**，即将原来某种具体的类型进行参数化。设计泛型的目的在于有效约束类型成员之间的关系，比如函数参数和返回值、类或者接口成员和方法之间的关系。

### 2. **泛型类型参数**

```typescript
TypeScript 
function getValue(val: string): string { 
    return val; 
} 
function getValue1(val: number): number {
    return val; 
} 
function getValue2(val: unknown): unknown { 
    return val; 
} 
let g1: string = getValue("1"); 
let g2: number = getValue1(1);
let g3: unknown = getValue2(1); 
function getValue3<T>(val: T): T { 
    return val; 
} 
let g4: number = getValue3<number>(3);
let g5: string = getValue3<string>('4');
```

### 3. **泛型类型**

前面我们使用过Array<类型>来定义数组的类型，这里的Array也是一种类型。

在 TypeScript 中，类型本身就可以被定义为拥有不明确的类型参数的泛型，并且可以接收明确类型作为入参，从而衍生出更具体的类型。

```typescript
TypeScript 
// 定义数组类型 
let arr: Array<number> = [1];
let arr1: Array<string> = [""]; 
// 类型别名 
type typeFn<P> = (params: P) => P; 
let fntype: typeFn<number> = (n: number) => { return n; }; 
let fn1:typeFn<string> = (p: string):string => { return p; } 
// 定义接口类型 
interface TypeItf<P> { name: P; getName: (p: P) => P; } 
let t1: TypeItf<number> = { name: 123, getName: (n: number) => { return n; }, }; 
let t2: TypeItf<string> = { name: "123", getName: (n: string) => { return n; }, };
```

### 4. **泛型约束**

把泛型入参限定在一个相对更明确的集合内，以便对入参进行约束。

```typescript
TypeScript 
interface TypeItf<P extends string | number> { name: P; getName: (p: P) => P; } 
let t1: TypeItf<number> = { name: 123, getName: (n: number) => { return n; }, }; 
let t2: TypeItf<string> = { name: "123", getName: (n: string) => { return n; }, };
```

## **十、class（类）**

面向对象实践 OOP 编程思想，在实际工作中，都是极其有用的抽象、封装利器。

```typescript
TypeScript
class Person {
    name: string; 
    say(this: Person, song: string): Person {
        console.log(song); return this; 
    } 
    constructor(name: string) { 
        this.name = name;
    } } 
let p1 = new Person('张三'); p1.say('Song').name;
```



### 1. **继承**

使用extends关键字实现继承

```typescript
TypeScript
class Male extends Person {
    age: number; 
    constructor(name: string, age: number) { 
        super(name); this.age = age; 
    } }
```

### 2. **修饰符（public、private、protected、readonly）**

在 TypeScript 中就支持 3 种访问修饰符，分别是 public、private、protected。通过这三个修饰符做到控制属性和方法的访问。

- public：基类、子类、类外部都可以访问；
- protected：基类、子类可以访问，类外部不可以访问；
- private：基类可以访问，子类、类外部不可以访问；
- readonly：只读修饰符

```typescript
TypeScript 
class Person { 
    public readonly name: string = '张三'; 
    protected age: number = 20; 
    private height: string = '180'; 
    protected getPersonInfo():void {
        console.log(this.name, this.age, this.height); // 基类里面三个修饰符都可以访问 
    } } 
class Male extends Person { public getInfo():void { console.log(this.name, this.age); 
                                                   // 子类只能访问public、protected修饰符的 
                                                  } } 
let m = new Male(); console.log(m.name); 
// 类外部只能访问public修饰的 m.name = '李四'; // name属性使用只读修饰符，所以不能对name进行赋值修改操作
```



### 3. **静态属性**

基于静态属性的特性，往往会把与类相关的常量、不依赖实例 this 上下文的属性和方法定义为静态属性，从而避免数据冗余，进而提升运行性能。

```typescript
TypeScript 
class Person { static title: string = "个人信息"; } Person.title;
```

### 4. **抽象类和接口**

抽象类，它是一种不能被实例化仅能被子类继承的特殊类。

```typescript
TypeScript
abstract class Person { 
    abstract name: string; 
    abstract getName(): void; 
    extendsFn():void { 
        console.log('扩展方法'); } } 
class Male extends Person {
    constructor(name: string) { 
        super(); this.name = name; } 
    name: string; 
    getName(): void { console.log(this.name);
                    } }
```

接口interface也可以约束类的实现，使用接口与使用抽象类相比，区别在于接口**只能定义类成员的类型**。

```typescript
TypeScript 
interface Person { 
    name: string; 
    age: number; 
    getName: () => void; 
} 
class Male implements Person { 
    constructor(name: string, age: number) { 
        this.name = name; this.age = age; 
    } 
    name: string; age: number; 
    getName(): void { console.log(this.name);
                    } }
```



### 5. **类的类型**

在声明类的时候，其实也同时声明了一个特殊的类型（确切地讲是一个接口类型），这个类型的名字就是类名，表示类实例的类型。

```typescript
TypeScript 
class Male { 
    constructor(name: string, age: number) { 
        this.name = name; this.age = age; 
    } 
    name: string; 
    age: number; 
    getName(this: Male): void { 
        console.log(this.name); 
    } } 
let m1: Male = new Male("张三", 20); 
let m2: Male = { 
    name: "张三", 
    age: 20, 
    getName(this: Male) {
        console.log(this.name);
    }, };
m2.getName(); 
let fn = m2.getName; fn(); // 报错，this指向并不是Male对象
```

