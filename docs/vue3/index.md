# Vue3
## Vue3新特性
- 重写双向数据绑定
- VDOM性能瓶颈
- Fragment
- Tree-Shaking的支持
- Compositon API
### 1. 重写双向绑定
- Vue2中双向数据绑定是通过`Object.defineProperty()`实现的，但是这种方式存在一些问题，比如无法检测到对象属性的添加和删除，也无法检测到数组索引和长度的变化。
- Vue3中使用了`Proxy`来重写双向数据绑定，Proxy可以拦截对象的各种操作，包括属性的读取、赋值、删除等，因此可以更好地处理对象和数组的变化。
  
  主要有以下优势：
  - 丢掉麻烦的备份数据
  - 省去for in循环
  - 可以监听数组变化
  - 代码更简化
  - 可以监听动态新增和删除的属性
  - 可以监听数组的索引和length属性
### 2. VDOM性能瓶颈
- Vue2中VDOM的性能瓶颈主要在于diff算法，当数据发生变化时，需要重新渲染整个VDOM树，即使只有一小部分数据发生了变化。Vue3中使用了静态提升和编译时优化来解决这个问题，可以减少不必要的渲染，提高性能。
- 静态提升：将不需要每次都重新渲染的节点标记为静态节点，在编译时进行优化，避免在每次渲染时都重新创建这些节点。
- 编译时优化：在编译时对模板进行静态分析，将静态节点和动态节点分开处理，避免不必要的diff操作。
### 3. Fragment
- Vue2中每个组件只能有一个根节点，如果需要多个根节点，需要使用`<div>`包裹起来，这会导致额外的DOM元素，增加了渲染负担。
- Vue3中引入了`Fragment`，允许组件有多个根节点，不需要额外的DOM元素包裹，提高了渲染性能。
### 4. Tree-Shaking的支持
- Vue3中使用了ES6模块化的特性，可以更好地支持Tree-Shaking，即去除未使用的代码，减小打包体积。
- 在Vue2中，无论我们使用什么功能，它们最终都会出现在生产代码中。主要原因是Vue实例在项目中是单例的，捆绑程序无法检测到该对象哪些属性在代码中被使用到，
### 5. Compositon API
## 项目搭建
1. 使用vite搭建
```
npm init vite@latest my-vue3-project
cd my-vue3-project
npm install
```
2. 使用vue-cli搭建
```
npm init vue@latest
```
## 目录、文件详解
### Vite目录
```
├── index.html （入口文件，webpack、rollup他们的入口文件都是enrty input是一个js文件，而vite的入口文件是一个html文件，它刚开始的时候不会编译这些js文件，只有用到的时候，如script src="***.js"会发起一个请求被vite拦截这时候才会解析js文件）
├── package.json
├── public（不会被编译 可以存放静态资源）
│   └── vite.svg
├── src
│   ├── App.vue（全局组件）
│   ├── assets （存放可以被编译的静态资源）
│   │   └── logo.png
│   ├── components（存放组件）
│   │   └── HelloWorld.vue
│   ├── main.js （全局的js文件）
│   └── shims-vue.d.ts
├── .gitignore
├── README.md
└── vite.config.js
```
### SFC语法规范
- `<template>`
  - 每个*.vue文件最多可同时包含一个顶层`<template>`块。
  - 其中的内容会被提取出来并传递给@vue/compiler-dom，预编译为JavaScript的渲染函数，并附属到导出的组件上为其render选项。
- `<script>`
  - 每个*.vue文件最多可同时包含一个顶层`<script>`块。
  - 其中的内容会被提取出来并传递给@vue/compiler-sfc，然后进一步传递给@vue/compiler-core，最终生成JavaScript模块。
  - 如果存在多个`<script>`块，那么第一个`<script>`会被视为组件的`<script setup>`，而后续的`<script>`会被视为普通的JavaScript模块，其内容会被保留在模板的`<script>`标签中，并作为模块的默认导出。
- `<style>`
  - 每个*.vue文件最多可同时包含一个`<style>`块。
  - 其中的内容会被提取出来并传递给@vue/compiler-sfc，然后进一步传递给@vue/compiler-dom，最终生成JavaScript模块。
  - 如果存在多个`<style>`块，那么它们会按照在模板中出现的顺序被合并为一个，并且会根据`<style>`标签上的`lang`属性决定使用哪个CSS预处理器。
## Vue指令
| 指令      | 说明 | 
| :---        |    :----:   |  
| v-text      | 显示文本     | 
| v-html   | 展示富文本      | 
| v-if      | 控制元素的显示隐藏 | 
| v-show   | 控制元素的显示隐藏（display none block Css切换）| 
| v-on      | 简写@ 用来给元素添加事件 | 
| v-bind   | 简写: 用来绑定元素的属性Attr | 
| v-model      | 双向绑定 | 
| v-for    | 遍历元素| 
| v-once      | 性能优化只渲染一次| 
| v-memo    | 性能优化会有缓存| 
## 虚拟DOM和diff算法
### 1. 虚拟DOM
虚拟DOM就是通过js来生成一个AST节点树。
- 为什么要有虚拟DOM?
  - 因为操作真实DOM是非常耗费性能的，所以我们需要一个虚拟DOM来减少操作真实DOM的次数，提高性能。
  - 解决方案就是我们可以用js的计算性能来换取操作DOM所消耗的性能。
### 2. diff算法
diff算法就是比较新旧虚拟DOM的差异，然后只更新差异的部分，从而提高性能。
#### Vue 2 的双端 diff 算法：
使用双指针的方式，从新旧 children 的两端开始进行比较，通过四种比较方式（新前与旧前、新后与旧后、新后与旧前、新前与旧后）来找到可复用的节点。其核心方法是updateChildren，步骤如下：
1. 定义了新前（newStartIndex、newStartVnode）、新后（newEndIndex、newEndVnode）、旧前（oldStartIndex、oldStartVnode）、旧后（oldEndIndex、oldEndVnode）等指针。
2. 比较新前与旧前，如果相同则新老开始下标往后移动一格。
3. 若新前与旧前不同，再比较新后与旧后，相同则新老结束下标往前移动一格。
4. 若新后与旧后也不同，接着比较新后与旧前，相同则将老的开始节点移动到老的结束节点后面，老的开始下标往后移动一格，新的结束下标往前移动一格。
5. 若新后与旧前还是不同，就比较新前与旧后，相同则将老的结束节点移动到老的开始节点前面，新的开始下标往后移一格，老的结束下标往前移动一格。
6. 如果以上四种比较方式都不满足，就通过循环oldChildren生成一个key和index的映射表，然后用新的开始节点的key去映射表中查找。如果找到，就把该节点移动到最前面，原来的位置用undefined占位；如果没有找到就直接创建新节点插入。
7. 当比较结束后，若newStartIndex > newEndIndex，说明有新节点剩余，需逐个插入剩余的新节点。若oldStartIndex > oldEndIndex，则说明有老节点剩余，需逐个删除剩余的老节点。
#### Vue 3 的 diff 算法：
Vue 3 更新了对比子节点的核心算法逻辑，性能综合提高约 30%～50%。它借鉴了字符串 diff 的一些思路，主要步骤如下：
1. 进行预处理，找出前置和后置可复用的节点，且这些节点不需要移动。
2. 判断是否存在剩余节点：如果 old 子节点存在剩余节点而 new 子节点不存在，说明比对完成，需移除多余的 old 子节点对应的真实 dom；反之，如果 old 子节点不存在剩余节点而 new 子节点存在，说明比对完成，需新建多余的 new 子节点对应的真实 dom 并插入。
3. 若 old 和 new 子节点都存在剩余子节点，则将剩余部分进行比对复用。这里用到了最长递增子序列，复用与最长递增子序列内的节点对应的 old 真实 dom 时，无需移动，从而进一步减少了移动次数，提高了性能。
   
相比 Vue 2 的 diff 算法，Vue 3 的优势在于复用 dom 元素时，能尽可能复用其相对顺序，减少移动 dom 的次数。例如，在 Vue 2 中，只要复用的节点不在头尾就一定会移动复用的真实 dom，而 Vue 3 则通过最长递增子序列等方式降低了这种不必要的移动。

此外，Vue 3 的 diff 算法在一些细节上也进行了优化，如在编译时对静态节点进行提升，这些节点在更新时不会被重新创建，而是直接复用，大大减少了渲染成本；支持碎片化（fragment），允许组件有多个根节点；引入了区块树（block tree）概念，可以跳过静态内容，快速定位到动态节点，减少了 diff 时的比较次数；在编译时会对模板进行静态提升，将不会变化的节点和属性提取出来，避免在每次渲染时都重新创建，减少了虚拟 dom 树的创建和销毁过程，提高了性能。
##  ref全家桶
| api      | 说明 | 
| :---     |    :----:   |  
| ref      | 接受一个内部值并返回一个响应式且可变的 ref 对象。ref 对象仅有一个 .value property，指向该内部值。| 
| isRef   | 判断是不是一个ref对象      | 
| shallowRef | 用于创建浅层响应式引用的函数 | 
| customRef   | 用于创建一个自定义的 ref，并对其依赖项跟踪和更新触发进行显式控制。| 
| toRef   | 将响应式对象的属性转换为 ref | 
| toRefs   | 将响应式对象的属性转换为 ref | 
| toRaw   | 返回由 ref 对象包裹的原始对象 | 
| unref   | 如果参数是一个 ref，则返回内部值，否则返回参数本身 |
| triggerRef   | 手动触发 ref 的副作用 | 
- shallowRef是浅层响应式，只有对 .value 的访问和修改是响应式的，而对于其内部对象的深层次属性修改，不会自动触发视图更新。
然而，如果在同一个作用域中，ref 的更新导致了一些副作用，例如触发了其他函数或操作，而这些操作又间接修改了 shallowRef 的 .value，那么就可能会引起 shallowRef 的视图更新。但这种情况并不是直接由 ref 的更新触发的，而是通过中间的其他代码逻辑产生的影响。
官方推荐在修改 shallowRef 所定义的深层数据后，使用 triggerRef() 方法去主动触发更新，而不是依赖这种可能不规范或难以预期的方式。这样可以更明确地控制 shallowRef 的更新时机，避免意外的视图更新。
```js
import { ref, shallowRef, triggerRef } from 'vue';

const state1 = ref({ count: 1 }); 
const state = shallowRef({ count: 1 }); 

function update() {
  state1.value.count++; 
  // 这里直接修改 state.value.count 不会触发视图更新
  state.value.count++; 
  triggerRef(state); // 手动触发 shallowRef 的更新，以更新视图
}
```
- customRef 是一个函数，用于创建一个自定义的 ref 对象。customRef接收一个函数作为参数，这个函数接收track（用于通知 Vue 追踪后续内容的变化）和trigger（用于通知 Vue 重新解析模板）两个函数作为参数，并返回一个带有get和set方法的对象。
一般来说，track应该在get方法中调用，用于提示 Vue 追踪数据的变化；而trigger应该在set方法中调用，用于通知 Vue 去重新解析模板，从而更新视图。然而，你对何时调用track和trigger，甚至是否调用它们有完全的控制权。

以下是一个使用customRef实现防抖功能的示例代码：
```js
import { customRef } from 'vue';

function myref(value, delay = 300) { 
  let timer; 
  return customRef((track, trigger) => { 
    return { 
      get() { 
        track();  // 追踪数据的变化
        return value; 
      }, 
      set(newValue) { 
        if (timer) {
          clearTimeout(timer); 
        }
        timer = setTimeout(() => { 
          value = newValue; 
          trigger();  // 通知 Vue 重新解析模板
        }, delay); 
      } 
    } 
  }); 
}

let keyword = myref('hello'); 
```
## reactive全家桶
| api      | 说明 | 
| :---     |    :----:   |  
| reactive      | 接受一个普通对象并返回一个响应式代理对象。| 
| isReactive   | 判断是不是一个reactive对象      | 
| shallowReactive   | 创建一个浅层响应式代理对象，只有第一层属性是响应式的。| 
| readonly   | 创建一个只读的响应式代理对象，任何对它的修改都会被忽略。|
- ref和reactive的区别
  - ref支持所有的类型，reactive只支持引用数据类型 Array Object Set Map等。
  - ref取值和赋值都需要加.value，reactive不需要加.value。
- reactive 与数组：异步获取数组值并赋值时不能直接复制，可通过数组方法或转换为对象解决。
```js
import { reactive } from 'vue';

let state = reactive({ arr: [] }); 
// 异步获取数组值并赋值
setTimeout(() => { 
const temp = [1, 2, 3]; 
  
  // 或者
  state.arr = temp; 
}, 1000); 

let state1 = reactive([]); 
// 异步获取数组值并赋值
setTimeout(() => { 
  const temp = [1, 2, 3]; 
  // 或者
  state1.push(...temp);
}, 1000); 
```
## to系列全家桶
| api      | 说明 | 
| :---     |    :----:   |  
| toRef      | 将响应式对象的属性转换为 ref | 
| toRefs   | 将响应式对象的属性转换为 ref | 
| toRaw   | 返回由 ref 对象包裹的原始对象 | 
```js
const info = reactive({name:"c",age:23})
let {name,age} = toRefs(info)
const edit = () => {
  name.value = "a"
}
```