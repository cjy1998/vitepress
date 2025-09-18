# 开发规范

## 一、代码层面

### 1、箭头函数

推荐使用箭头函数(保持 this 指向不变，避免后期定位问题的发杂度)。

示例：

```javascript
//【建议】业务开发中提倡的做法, 箭头函数配合const函数一起使用
const getTableListData = () => { // TODO }
//【反例】尽量不要出现混用，如下：
 function getDomeData () {}
 const getDome1Data = () => {}
// 混用会导致可读性变差，而开发首要元素的可读性。
```

### 2、变量提升

在项目或者开发过程中，尽量使用 let 或者 const 定义变量，可以有效的规避变量提升的问题，不在赘述，注意 const 一般用于声明常量或者值不允许改变的变量。

### 3、数据请求

数据请求类、异步操作类需要使用 try…catch 捕捉异常。尽量避免回调地狱出现。

示例：

```javascript
// 推荐写法
/**
@description 获取列表数据 
@return void */
const getTableListData = async () => {
  // 自己的业务处理TODO
  try {
    const res = await getTableListDataApi();
    const res1 = await getTableListDataApi1();
    // TODO
  } catch (error) {
    // 异常处理相关
  } finally {
    // 最终处理
  }
};
//【提倡】推荐接口定义带着Api结尾，比如我的方法是getTableListData，
//【提倡】内部逻辑调用的后端接口，那我的接口便可以定位为getTableListDataApi。
```

当然也可以使用下面的方式：

示例：

```javascript
/**
@description 获取列表数据
@return void */
const getTableListData = () => {
    getTableListDataApi({....}).then(() => {
        // TODO
    }).catch(() => {
        // TODO
    }).finally(() => {
        // TODO
    }) }
// 注意使用这种方式避免嵌套层级太深，如下反例：
const getTableListData1 = () => {
    getTableListDataApi({
        ....}).then(() => {
        getTableListDataApi1({
            ....}).then(() => {
            getTableListDataApi2({
                ....}).then(() => {
                // TODO 这种就是典型的回调地狱，禁止出现这种
            }) }) }) }
```

合理使用数据并发请求：

示例：

```javascript
// 场景描述：表头和表格数据都需要请求接口获取，可以使用并发请求。
/**查询列表数据*/
const getTableList = async () => {
    // TODO try
    {
        // 并行获取表格列数据和列表数据
        const [resColumns, resData] = await Promise.all([ getTableColumnsApi({
            ....}),
                getTableListApi({
                    ...}), ]);
                  // TODO
                  } catch (error) {
            // TODO
        } finally {
            // TODO
        } };
    // Promise.all的一些执行细节不在赘述，但是注意区分和Promise.allSettled用法
    // Promise.all()方法会在任何一个输入的 Promise 被拒绝时立即拒绝。
    // 相比之下，Promise.allSettled() 方法返回的 Promise 会等待所有
    // 输入的 Promise 完成，不管其中是否有 Promise 被拒绝。如果你需要获取输入可迭代对象中每个 Promise 的最终结果，则应使用allSettled()方法。
```

合理使用数据竞速请求：

示例：

```javascript
// 场景描述：某些业务需要请求多个接口，但是只要一个接口先返回便处理逻辑
let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("数据请求1");
  }, 1000);
});
let promise2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("数据请求2");
  }, 500);
});
Promise.race([promise1, promise2]).then((result) => {
  console.log(result);
  // 输出 "数据请求2"
});
```

注意：

> **数据请求时一定要做好异常的捕获和处理，异常的捕获和处理可以增加程序的健壮性和提升用户使用体验。**

下面的反例要禁止：

```javascript
/** * 获取表格数据 */
function getTableListData () {
    getTableListData({ pageNum： 1, pageSize: 10 })
        .then((res) => {
        tableList.value = res.rows;
        tableTotal.value = res.total;
        //【提倡】 tableList.value = res?.code === 200 ? res.rows : [];
    }) }
// 上面写法，界面可能没报错，功能也实现了，但是....
```

### 4、响应性变量

合理的使用响应性变量。数据量很大的对象或者数组，同时属性又是嵌套的对象，你的业务场景只需要第一层属性具有响应性，推荐使用 shallowRef 和 shallowReactive 定义响应性变量，这时不在推荐使用 ref 和 reactive 了。

### 5、单一职责原则

组件或者方法的编写一定要遵循单一职责原则。

### 6、文件命名

功能菜单的入口文件一定要带着 name，同时其他编写的业务组件也推荐带着 name，同时 name 的命名规则大写驼峰，且尽量要全局唯一(避免后期定位问题增加复杂度)。

文件名命名中，Vue 中没有强制的规则，这里借鉴 React 的规则，大写驼峰。

> React component names must start with a capital letter, like StatusBar and SaveButton. React components also need to return something that React knows how to display, like a piece of JSX.

示例：

```javascript
<script setup name='CustomName'> </script>
// 或者
export default defineComponent({ name: 'CustomName', ....... })
```

### 7、监听器使用

在 Vue3 中使用监听器 watchEffect 和 watch 时，需要留意使用方式，先看 watchEffect：

示例：

```javascript
<script setup>
import { ref, watchEffect } from "vue"
const a = ref(true)
const b = ref(false)
watchEffect(() => {
    if (a.value || b.value) {
        console.log('执行了更新操作');
    } })
const test = () => b.value = !b.value;
</script>
<template>
    <button @click="test">改变b的值</button>
	<h2>当前b的值:{{ b }}</h2>
</template>
```

答案：当模板中改变 b 的值时，watchEffect 无法监听 '执行了更新操作'。

在看下面的示例：

```javascript
<script setup>
    import { ref, watchEffect } from "vue"
	const getInfo = async () => {
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(111) }, 2000)
        }) }
    watchEffect(async () => {
        // 请求信息
        await getInfo()
        if (b.value) console.log('执行了更新操作');
    })
const test = () => b.value = !b.value;
</script>
<template>
    <button @click="test">改变b的值</button>
	<h2>当前b的值:{{ b }}</h2>
</template>
```

答案：当模板中改变 b 的值时，watchEffect 无法监听 '执行了更新操作'。

在继续看下面示例：

```javascript
<script setup>
    import { ref, watchEffect } from "vue"
const a = ref(true)
const b = ref(true)
setTimeout(() => {
    watchEffect(() => {
        if (a.value) {
            console.log('执行了更新操作');
        } }) }, 2000)
const test = () => b.value = !b.value;
</script>
<template>
    <button @click="test">改变b的值</button>
	<h2>当前b的值:{{ b }}</h2>
</template>
```

答案：当模板中改变 b 的值时，watchEffect 无法监听 '执行了更新操作'。 使用 watchEffect 一定要注意两点：

> 1、要使 watchEffect 可以第一时间捕捉到响应性变量；
>
> 2、异步操作触发微任务会影响 watchEffect 第一时间捕捉响应性变量。

watchEffect 使用不是很熟悉的话，建议尽量使用 watch。

watch 注意点：当你的组件内部使用 watch 较多或者你想手动消除 watch 的复杂度。

建议如下：

```javascript
<script setup>
    const currentScope = effectScope();
currentScope.run(() => {
    watch( () => props.currentRow, (newVal, oldVal) => {
        // TODO
    }, { deep: true } );
    watchEffect(() => {
        if (queryObj.visitId) {
            // TODO
        } }); });
	onBeforeUnmount(() => {
    	currentScope.stop();
	});
</script>
```

需要留意的是 Vue3.5+中新增了 deep 属性可以直接传入数字，告诉 wacth 监听到响应性数据到第几层。

### 8、Hooks 使用

在 Vue3 的项目中强烈推荐使用 hooks 进行功能的拆分和复用，这是 Vue 官方团队推荐的编写方式，下面来看一个列子，比如说，我要实现一个弹框的功能，下面常见的写法，第一种偏后端思维的写法：

```javascript
const editModel = reactive({
  isShow: false,
  form: {
    name: "ANDROID",
    // ......
  },
  showFunc: () => {
    // 显示逻辑
  },
  cancelFunc: () => {
    // 取消逻辑
  },
  submitFunc: () => {
    // 提交逻辑
  },
});
```

或者其他的类似写法，不在赘述。 其实都可以换成 hooks 的写法：

示例：

```javascript
const useEditModel = () => {
  const isShow = ref(false);
  /** * 显示弹框 */
  const showModal = () => {};
  /** * 关闭弹框 */
  const cancelModal = () => {};
  /** * 提交操作 */
  const submitModal = () => {};
  onBeforeMount(() => {
    // TODO
  });
  return {
    isShow,
    showModal,
    cancelModal,
    submitModal,
  };
};
// 其他地方使用
const { isShow, showModal, cancelModal, submitModal } = useEditModel();
```

简单总结一下 hooks 编写的思想：

> **在函数作用域内定义、使用响应式\\非响应性状态、变量或者从多个函数中得到的状态、变量、方法进行组合，从而处理复杂问题。**

### 9、暴露方法

当我们想要暴露第三方组件的所有属性时，我们怎么快速的暴露？

使用 expose 需要一个一个写，显然太麻烦，可以使用下面的方式：

```javascript
expose(
  new Proxy(
    {},
    {
      get(target, key) {
        // CustomDomRef是定义的模板中的ref dom节点
        return CustomDomRef.value?.[key];
      },
      has(target, key) {
        return key in CustomDomRef.value;
      },
    }
  )
);
```

### 10、挑选属性

某些业务场景下我们需要挑选出，部分属性传递给接口，如何优雅的挑选属性，可以参考如下：

```javascript
const obj = { name: "张三", age: 20, sex: "男", name1: "张三1" };
// 当不需要name1传递时，怎么做呢？
// 方式1
delete obj.name1;
// 方式2
const newObj = { name: obj.name, age: obj.age, sex: obj.sex };
// 方式3
const newObj = { ...obj, name1: undefined };
// 其实可以使用一种更优雅的方式
const { name1, ...newObj } = obj;
// 或者使用lodash的omit或者pick方法
```

### 11、组合式 API

组合式 API 本身是为了灵活，但是项目中使用时出现了五花八门的情况，有的把 expose 写到了最开始，把组件引入放到最下面，当你不确定 setup 语法糖下使用顺序时，可以参考下面的顺序：

示例：

```javascript
<script setup>
  // import语句 // Props(defineProps) // Emits(defineEmits) // 响应性变量定义
  //Computed // Watchers // 函数 // 生命周期 // Expose(defineExpose)
</script>
```

### 12、逻辑分支

当我们编写业务代码时，经常会遇到下面这种写法，写法没有对错只是有更好的优化方式：

示例：

```javascript
// 场景一
if (type === 1) {
  // TODO
} else if (type === 2) {
  // TODO
} else if (type === 3) {
  // TODO
} else if (type === 4) {
  // TODO
} else if (type === 5) {
  // TODO
} else {
  // TODO
}
// 场景二
if (type === 1) {
  if (type1 === 1) {
    if (type2 === 1) {
      if (type3 === 1) {
        // TODO
      }
    }
  }
}
```

场景一：违背了**开闭原则**(对扩展开放、对修改关闭)和**单一职责原则**。场景一可以进行如下的优化：

```javascript
// 优化方式一：字典映射方式
const typeHandlers = {
  1: handleType1,
  2: handleType2,
  3: handleType3,
  4: handleType4,
  5: handleType5,
  default: handleDefault,
};
const handler = typeHandlers[type] || typeHandlers.default;
handler();
// 优化方式二：高阶函数方式
const handleType1 = () => {
  /* TODO for type 1 */
};
const handleType2 = () => {
  /* TODO for type 2 */
};
// 其他处理函数...
const handlers = [handleType1, handleType2 /*...*/];
const processType = (type) => {
  if (handlers[type - 1]) handlers[type - 1]();
};
processType(type);
```

场景二：违背了**圈复杂度原则**和**单一职责原则**，场景二可以进行如下优化：

```javascript
// 优化方式一
const isValidType = () => {
  return type === 1 && type1 === 1 && type2 === 1 && type3 === 1;
};
if (isValidType()) {
}
// 优化方式二：使用"早返回原则"或者叫"错误前置原则"进行优化
if (type !== 1) return;
if (type1 !== 1) return;
if (type2 !== 1) return;
if (type3 !== 1) return;
// TODO
```

上面只是简单列举的优化的思路，方案有很多，合理即可。

### 13、删除冗余

在业务开发过程中，我们经常会对代码进行注释，有些文件中会出现好多处注释，当然这些注释后边可能会放开，但是官方提倡的做法是**尽量删除掉这些注释的代码，真正需要哪些代码，在还原回来即可**。

另一个常见的问题是：console 打印和 debugger 之类的，虽然说可以通过插件配置在打包的时候删除掉，但是官方提倡的是**在源码层面一旦调试完成就立即删除**。

**还有单文件不要超过 600 行代码，当然也可以适当根据实际情况放宽，一般情况下超过这个行数就要进行代码的拆分，拆分的方式包括组件、方法、样式、配置项等。但是过度拆分也会导致碎片化的问题，需要合理把握。**

### 14、异步组件

Vue3 中提供了异步组件(defineAsyncComponent)的定义，异步组件的优点：

> 1、在运行时是懒加载的，可以更好的让浏览器渲染其他功能。
>
> 2、有利于 vite 打包时进行代码分割。

示例：

```javascript
// 简单示例
<script setup>
    import { defineAsyncComponent } from 'vue'
	const AdminPage = defineAsyncComponent(() => import('./components/AdminPageComponent.vue') )
</script>
<template>
      <AdminPage />
</template>
    // 复杂示例
    // 异步组件的定义
    import { defineAsyncComponent } from "vue";
export const PreferenceItemComs: any = {
    Residence: defineAsyncComponent(() => import("./Residence.vue")),
    PastHistory: defineAsyncComponent(() => import("./PastHistory.vue")),
    AllergyHistory: defineAsyncComponent(() => import("./AllergyHistory.vue")),
    Diagnose: defineAsyncComponent(() => import("./Diagnose.vue")), };
// 异步组件的使用
<keep-alive>
    <component :is="getCurrentComponents()" ></component>
</keep-alive>
/** * 获取当前需要渲染的组件 */
const getCurrentComponents = () => {
    const projectType = activeName.value;
    if (projectType && PreferenceItemComs[projectType]) {
        return PreferenceItemComs[projectType];
    } return null;
};
```

**复杂功能的拆分可以考虑使用异步组件。**

### 15、路由懒加载

现有框架里面一般不需要我们接触这块，因为菜单和路由已经是封装完善的，但是我们也需要知道路由懒加载的概念：

示例：

```javascript
// 将
import UserDetails from './views/UserDetails.vue'
// 替换成
const UserDetails = () => import('./views/UserDetails.vue')
const router = createRouter({ // ...
    routes: [ { path: '/users/:id', component: UserDetails
              }
// 或在路由定义里直接使用它
 { path: '/users/:id', component: () => import('./views/UserDetails.vue') }, ], })
```

路由懒加载有利于 vite 对不同的菜单功能进行代码分割，降低打包之后的代码体积，从而增加访问速度。 需要注意的是：**不要**在路由中使用**异步组件**。异步组件仍然可以在路由组件中使用，但路由组件本身就是动态导入的。

### 16、运算符

es 新特性中有几个新增的运算符你需要了解，因为它可以简化你的编码编写。

> ?? ( 空值合并运算符)
>
> ?. (可选链式运算符)
>
> ??= (空值合并赋值操作符)
>
> ?= (安全复制运算符)

示例

```javascript
// ?? ( 空值合并运算符)：这个运算符主要是左侧为null和undefined，直接返回右侧值
// 请在开发过程中合理使用||和??
let result = value ?? '默认值';
console.log('result', result);
// ?.(可选链运算符): 用于对可能为 null 或 undefined 的对象进行安全访问。
// 建议这个属性要用起来，防止数据不规范时控制台直接报错
const obj = null; let prop = obj?.property; console.log('prop', prop);
// ??= (空值合并赋值操作符): 用于在变量已有非空值，避免重复赋值。
let x = null; x ??= 5;
// 如果 x 为 null 或 undefined，则赋值为 5
// ?= (安全复制运算符)：旨在简化错误处理。改运算符与 Promise、async 函数以及任何实现了 Symbol.result 方法的对象兼容，简化了常见的错误处理流程。
// 注意：任何实现了 Symbol.result 方法的对象都可以与 ?= 运算符一起使用，Symbol.result 方法返回一个数组，第一个元素为错误，第二个元素为结果。
const [error, response] ?= await fetch("https://blog.conardli.top");
```

## 二、代码注释

> 代码的可读性和可迭代性是编写代码时首要考虑因素。

### 1、文件注释

单个文件注释规范，每个独立的 VUE 文件开头可进行文件注释，表明该文件的描述信息、作者、创建时间等。

示例：

```javascript
<!-- ** @FileDescription: 该文件的描述信息
        * @Author: 作者信息
        * @Date: 文件创建时间
        * @LastEditors: 最后更新作者
        * @LastEditTime: 最后更新时间
 *-->
```

### 2、方法注释

功能开发时编写的相关方法要进行方法注释和说明，注释要遵循 JSDOC 规范。

方法注释格式：

```javascript
/**
 * @description: 方法描述 （可以不带@description）
 * @param {参数类型} 参数名称
 * @param {参数类型} 参数名称
 * @return 没有返回信息写 void / 有返回信息 {返回类型} 描述信息
 */
```

示例：

```javascript
/**
 * @description 获取解析统计相关数据
 * @param {Object} userInfo
 * @param {Array} lists
 * @return void */
或者;
/**
 * 获取解析统计相关数据
 * @param {Object} userInfo 用户信息
 * @param {Array} lists 用户列表
 * @return void */
```

### 3、变量注释

关键的变量要进行注释说明，变量注释一般包括两种：

示例：

```javascript
// 提倡(vscode可以给出提示的写法)
/* 描述信息 */ activeName: "first";
activeName: "first"; // 默认激活的Tab页 或者;
// 默认激活的Tab页
activeName: "first";
```

### 4、行内注释

关键业务代码必须进行行内注释，行内注释建议按照以下格式进行：

示例：

```javascript
// 根据指定的属性对数据进行分类 或者;
// 根据指定的属性对数据进行分类，
// 分类之后按住时间进行降序排序
// ...... 或者; /** * 根据指定的属性对数据进行分类， * 分类之后按住时间进行降序排序 * ...... */
```

### 5、折叠代码块注释

耦合度非常高的变量或者方法建议进行代码折叠注释

示例：

```javascript
// #region 升序、降序处理逻辑
/**
* 升序、降序处理逻辑说明：
* * 根据指定的属性对数据进行分类，
* 分类之后按住时间进行降序排序
* ...... */
const asceOrderLists = [];
// 升序数组
const descOrderLists = [];
// 降序数组
/**
* @description 升序操作
* @param {Array} lists
* @return {Array} arrs */
const handleAsceOrder = (lists) => {
    // .........
    return arrs }
/**
* @description 降序操作
* @param {Array} lists
* @return {Array} arrs */
const handleDescOrder = (lists) => {
    // .........
    return arrs }
...... // #endregion
```

### 6、其他

日常开发中，常见的问题修改和功能开发建议按下列方式进行注释：

```javascript
-新功能点开发 -
  // FEAT-001: 进行了XXXXX功能开发(LMX-2024-09-24)
  问题修复;
// BUGFIX-001: 进行了XXXXX功能修复(LMX-2024-09-24) ....
```

说明：

```javascript
格式说明： [${a1}-${a2}]: 相关描述信息(${a3}-${a4})
    - a1：类型描述，建议遵循git提交规范，但是使用全驼峰大写。（feat、fix、bugfix、docs、style、refactor、perf、chore）
    - a2: 编号，可以使用bug单号、功能特性单号或者自增序号，建议使用bug单号、功能特性单号。
    - a3: git账户或者能标识自己的账号即可。
    - a4: 新增或者修改时间，建议精确到天。
```

## 三、目录结构

针对于项目功能开发，怎样划分一个功能的目录结构？怎么的目录结构可以提高代码的可读性？

下面是一个相对完善业务功能文件目录，可以进行参考:

```plain
custom_module                   # 业务模块
│   ├── api                     # 业务模块私有接口
│   ├── components/modules      # 业务组件(涉及业务处理)
│   ├── composable              # 业务组件(不涉及具体业务)
│   ├── functional              # 业务函数式组件
│   ├── methods/hooks           # 业务hooks
│   ├── config                  # 业务配置项
│   ├── styles                  # 业务样式
│   └── utils                   # 业务私有工具类
|── index.vue                   # 业务入口文件
|── .pubrc.js                   # 业务后期模块联邦入口
└── README.md                   # 业务说明文档
```

具体的业务功能划分，可以根据自己的具体业务划定，总之合理即可。如果是公用性组件的话，可以不需要按照上面的目录结构进行划分。

## 四、性能优化

### 减小代码打包体积

- 减少源代码重复，复用功能抽取共用组件或者方法
- 优化前端依赖，防止新依赖的加入导致包体积的增大，例如 lodash-es 要优于 lodash
- 代码分割(ESM 动态导入，路由懒加载)
- 合理的配置 vite.config.ts 中配置项。例如 rollupOptions 配置项中的 output.manualChunks,sourceMap 等

### 优化资源加载速度

- 部分静态资源或者依赖项可以考虑 cdn 方式，增加访问速度
- 开启浏览器的 gzip 压缩，减少带宽请求
- 某些关键性资源是否可以考虑预加载
- 部分图片和视频是否可以考虑延迟加载

### 业务代码层面优化

- 较少接口请求数量，耗时接口如何优化
- 大数据量的场景处理(分页、虚拟滚动)
- 减少非必要的更新(父子组件之间的更新, key 禁止使用 index)
- 减少大数量下的响应性开销
- 减少人为的内存泄露和溢出操作
- 优化 JS 中执行较长时间的任务(比如是否可以考虑异步、requestAnimationFrame、requestIdleCallback)

### 合理利用缓存

- 浏览器的协商缓存
- 浏览器的强缓存
- 浏览器本地的存储(localStorage、sessionStorage、indexedDB 这些是否可以使用)
