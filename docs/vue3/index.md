# Vue3基础
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
## 响应式原理源码实现

## computed计算属性
计算属性就是当依赖的属性的值发生变化的时候，才会触发他的改变，如果依赖的值不发生变化，使用的是缓存中的属性值。
1. 选项式写法
```js
  <template>
  <div>
      <input  v-model="firstName"  />
    <input  v-model="lastName"  />
    <h1>{{name}}</h1>
    <button @click="edit">编辑</button>
  </div>
</template>
<script setup lang="ts">
    import {ref, computed} from 'vue'
    let firstName = ref("张")
    let lastName = ref("三")
    //选项式写法，支持一个对象传入get函数以及set函数自定义操作
    let name = computed<string>({
      get(){
        return firstName.value + '-' + lastName.value
      },
      set(newVal){
        [firstName.value,lastName.value] = newVal.split("-")
      }
    })
    const  edit = () => {
      name.value = "chen-jian"
    }
  </script>
```
2. 函数式写法，只支持一个getter函数不允许修改值
```js
  let name = computed(() => {
    return firstName.value + '-' + lastName.value
  })
```
## watch和watchEffect
watch：侦听一个或多个响应式数据源，并在数据源变化时运行一个回调函数。
- 第一个参数监听源
- 第二个参数是回调函数`(newVal,oldVal)`
- 第三个参数是一个options配置项`{ immediate: true, deep: true}`

watchEffect：立即执行传入的一个函数，同时响应式追踪其依赖，并在其依赖变更时重新运行该函数。如果用到message 就只会监听message 就是用到几个监听几个 而且是非惰性 会默认调用一次
```js
  import { ref, watch, watchEffect } from 'vue';

  let count = ref(0); 
  let count2 = ref(0); 
  // 监听一个
  watch(count, (newVal, oldVal) => { 
    console.log(newVal, oldVal); 
  }); 
  // 监听多个
  watch([count,count2], (newVal, oldVal) => { 
    console.log(newVal, oldVal); 
  }); 
  //监听reactive对象
  let message = reactive({
      nav:{
          bar:{
              name:""
          }
      }
  })
  watch(message, (newVal, oldVal) => {
      console.log('新的值----', newVal);
      console.log('旧的值----', oldVal);
  })
  // 监听reactive单一值

  let message = reactive({
      name:"",
      name2:""
  })

  watch(()=>message.name, (newVal, oldVal) => {
      console.log('新的值----', newVal);
      console.log('旧的值----', oldVal);
  })
  // watchEffect
  let message = ref<string>('')
  let message2 = ref<string>('')
  watchEffect(() => {
      //console.log('message', message.value);
      console.log('message2', message2.value);
  })
  //清除副作用
  //就是在触发监听之前会调用一个函数可以处理你的逻辑例如防抖
  let message = ref<string>('')
  let message2 = ref<string>('')
  watchEffect((oninvalidate) => {
      //console.log('message', message.value);
      oninvalidate(()=>{
          
      })
      console.log('message2', message2.value);
  })
  //停止跟踪 watchEffect 返回一个函数 调用之后将停止更新

  const stop =  watchEffect((oninvalidate) => {
      //console.log('message', message.value);
      oninvalidate(()=>{
  
      })
      console.log('message2', message2.value);
  },{
    //如果想在侦听器回调中能访问被 Vue 更新之后的所属组件的 DOM，你需要指明 flush: 'post',别名watchPostEffect()
      flush:"post",
      //还可以创建一个同步触发的侦听器，它会在 Vue 进行任何更新之前触发，别watchSyncEffect()
      //flush: 'sync',
      onTrigger () {
  
      }
  })
  stop()

```
## 生命周期
组合式API 是没有 beforeCreate 和 created 这两个生命周期的，setup去代替。
| 选项式api     | 组合式api |  说明 | 
| :---         |  :----:   |   :----   |  
| beforeCreate | Not |  在实例初始化完成并且 props 被解析后立即调用,data() 和 computed 等选项也开始进行处理。 | 
| created      | Not  |  当这个钩子被调用时，以下内容已经设置完成：响应式数据、计算属性、方法和侦听器。然而，此时挂载阶段还未开始，因此 $el 属性仍不可用。  | 
| beforeMount  | onBeforeMount | 组件已经完成了其响应式状态的设置，但还没有创建 DOM 节点。它即将首次执行 DOM 渲染过程。 | 
| mounted      | onMounted     | 在组件挂载完成后执行，允许直接`DOM`访问   | 
| beforeUpdate | onBeforeUpdate|  数据更新时调用，发生在虚拟 `DOM` 打补丁之前  | 
| updated      | onUpdated     |   `DOM`更新后，`updated`的方法即会调用。 |
| beforeUnmount| onBeforeUnmount| 在卸载组件实例之前调用。在这个阶段，实例仍然是完全正常的。 |
| unmounted	   | onUnmounted  |  卸载组件实例后调用。调用此钩子时，组件实例的所有指令都被解除绑定，所有事件侦听器都被移除，所有子组件实例被卸载。  | 
| errorCaptured | onErrorCaptured |  捕获了后代组件传递的错误时调用 | 
| renderTracked | onRenderTracked |  注册一个调试钩子，当组件渲染过程中追踪到响应式依赖时调用。 | 
| renderTriggered| onRenderTriggered |  注册一个调试钩子，当响应式依赖的变更触发了组件渲染时调用。 |
| activated	     | onActivated  |  若组件实例是` <KeepAlive> `缓存树的一部分，当组件被插入到 DOM 中时调用。 |
| deactivated    | onDeactivated | 若组件实例是 `<KeepAlive> `缓存树的一部分，当组件从 DOM 中被移除时调用。 |
## 父子组件传参
### 父组件给子组件传递参数
```js
// 父组件文件
  <template>
    <div>
      我是父组件
      <Children :title="name" :arr="[1.2]" />
      <button @click="handleEdit">点击修改</button>
    </div>
  </template>
  <script setup lang="ts">
    import {ref} from "vue";
    import Children from "./Children.vue"
    let name = ref<string>("我是父组件传递来的值")
    const handleEdit = () => {
      name.value = "被修改后"
    }
  </script>
```
**子组件接收值**
- 通过defineProps来接收，defineProps可以接收一个对象（js），也可以接收一个泛型(Ts)。
- TS 特有的默认值方式，withDefaults是个函数也是无须引入开箱即用接受一个props函数第二个参数是一个对象设置默认值。

```js
  // 子组件文件
<template>
    <div>
      我是子组件
      {{title}}
      {{arr}}
    </div>
</template>
<script setup lang="ts">
  //接收父组件传递过来的值defineProps
  // const props =  defineProps({
  //   title:{
  //     type:String,
  //     default:() => "默认值"
  //   }
  // })
  // ts字面量形式
  // const props = defineProps<{
  //   title:string;
  //   arr:number[]
  // }>()
  //ts定义默认值withDefaults
  type Props = {
    title?: string;
    arr?:number[]
  }
  const props = withDefaults(defineProps<Props>(),{
    title:"00",
    arr:[]
  })
  console.log(props.title)
</script>
```
### 子组件给父组件传值
- 通过defineEmits派发事件
```js
  // 子组件
  <template>
    <div>
      我是子组件
      <button @click="send">给父组件传值</button>
    </div>
  </template>
  <script setup lang="ts">
     // const emits = defineEmits(['on-click'])
     //ts
      const emits = defineEmits<{
        (e:"on-click",name:string):void
      }>()
      const send = () => {
        emits('on-click',"我是子组件传递的值")
      }
  </script>
```
### 子组件暴露给父组件内部属性
- 通过defineExpose暴露属性
```js
  // 子组件
  <template>
    <div>
      我是子组件
    </div>
  </template>
  <script setup lang="ts">
   const open = () => {
      alert("open!")
    }
    defineExpose({
      open
    });
  </script>
```
- 父组件接收子组件暴露的属性
```js
  // 父组件
  <template>
    <div>
      我是父组件
      <Children ref="childrenRef" />
    </div>
 </template>
  <script setup lang="ts">
    import Children from "./Children.vue"
    //注意这儿的typeof里面放的是组件名字不是ref的名字 ref的名字对应开头的变量名
    const childrenRef = ref<InstanceType<typeof Children>>()
    onMounted(() => {
          // console.log(childrenRef.value.open)
      childrenRef.value.open()
    })
  </script>
```
## 依赖注入provider/inject
provide 可以在祖先组件中指定我们想要提供给后代组件的数据或方法，而在任何后代组件中，我们都可以使用 inject 来接收 provide 提供的数据或方法。 
```js
  // 祖先组件
  <template>
    <div class="app1">
      <div>
        <el-radio-group v-model="color">
          <el-radio value="red" size="large">红色</el-radio>
          <el-radio value="yellow" size="large">黄色</el-radio>
        </el-radio-group>
        <div class="color-block"></div>
        <provideA/>
      </div>

    </div>
  </template>

  <script setup lang="ts">
  import {provide, readonly, ref} from "vue";
  import provideA from "@/components/provideA/index.vue"
  const color = ref<string>('red')
  provide("color",readonly(color) )
  </script>

  <style lang="scss" scoped>
  .color-block{
    width: 200px;
    height: 200px;
    background-color: v-bind(color);
  }
  </style>

```
```js
  <template>
      <div class="color-block">子组件</div>
      <provideB/>
    </template>

    <script setup lang="ts">
    import {inject} from "vue";
    import type {Ref} from 'vue'
    import provideB from "../provideB/index.vue"
    const color = inject<Ref<string>>("color")
    </script>

    <style lang="scss" scoped>
    .color-block{
      width: 200px;
      height: 200px;
      background-color: v-bind(color);
    }
    </style>
```
```js
<template>
    <div class="color-block">孙子组件</div>
    <el-button type="primary" @click="changeColor">改变颜色</el-button>
  </template>

  <script setup lang="ts">
  import {inject} from "vue";
  import type {Ref} from 'vue'
  const color = inject<Ref<string>>("color")
  const changeColor = () => {
    color.value = "blue"
  }
  </script>

  <style lang="scss" scoped>
  .color-block{
    width: 200px;
    height: 200px;
    background-color: v-bind(color);
  }
  </style>

```
**后代组件改变inject()接收到的值，会改变祖先组件中的值，使用readly()包裹provide()传递的值可以避免**
## Mitt
1. 安装
   ```js
    npm install mitt -S
   ```
2. 全局挂载
   ```js
    import { createApp } from 'vue'
    import App from './App.vue'
    import mitt from 'mitt'
    
    const Mit = mitt()
    
    //TypeScript注册
    // 由于必须要拓展ComponentCustomProperties类型才能获得类型提示
    declare module "vue" {
        export interface ComponentCustomProperties {
            $Bus: typeof Mit
        }
    }
    
    const app = createApp(App)
    
    //Vue3挂载全局API
    app.config.globalProperties.$Bus = Mit
    
    app.mount('#app')
   ```
3. 使用方法通过emit派发， on 方法添加事件，off 方法移除，clear 清空所有。
    ```js
      <template>
      <div>
          <h1>我是A</h1>
          <button @click="emit1">emit1</button>
          <button @click="emit2">emit2</button>
      </div>
      </template>
      
      <script setup lang='ts'>
      import { getCurrentInstance } from 'vue'
      const instance = getCurrentInstance();
      const emit1 = () => {
          instance?.proxy?.$Bus.emit('on-num', 100)
      }
      const emit2 = () => {
          instance?.proxy?.$Bus.emit('*****', 500)
      }
      </script>
    ```
    ```js
        <template>
          <div>
              <h1>我是B</h1>
          </div>
      </template>
      
      <script setup lang='ts'>
      import { getCurrentInstance } from 'vue'
      const instance = getCurrentInstance()
      instance?.proxy?.$Bus.on('on-num', (num) => {
          console.log(num,'===========>B')
      })
      //监听所有事件
      instance?.proxy?.$Bus.on('*',(type,num)=>{
            console.log(type,num,'===========>B')
        })
      </script>
    ```
    ```js
    //移除监听事件
      const Fn = (num: any) => {
          console.log(num, '===========>B')
      }
      instance?.proxy?.$Bus.on('on-num',Fn)//listen
      instance?.proxy?.$Bus.off('on-num',Fn)//unListen
    //清空所有事件
      instance?.proxy?.$Bus.all.clear() 
    ```
## 局部组件、全局组件、递归组件、动态组件
- 局部组件
  直接在要使用的页面引入，直接使用即可。
  ```js
  import Card from "@/views/Card.vue"
  <template>
    <div>
      <Card />
    </div>
  </template>
  ```
- 全局组件
  在main.ts中引入，使用app.component注册
  ```js
  import Card from "@/views/Card.vue"
  app.component('Card',Card)
  ```
- 批量注册全局组件
  ```js
  // /components/index.ts
    import type {App,Component} from 'vue'
    import Button from "./Button/index.vue"
    import Line from "./Line/index.vue"

    const allGlobalComponents = {Button,Line}
    export default  {
          install(app:App) {
              Object.keys(allGlobalComponents).forEach((key:string) => {
                  app.component(key,allGlobalComponents[key])
              })
          }
      }
  ```
  ```js
  // /main.ts
   import globalComponents from "@/components"
   app.use(globalComponents)
  ```
- 递归组件
  ```js
  // /components/Tree/index.vue
  <template>
      <div class="tree" v-for="item in props.list" :key="item.name">
        <span>{{item.name}}</span>
        <input type="checkbox" v-model="item.checked">
          <Tree v-if="item.children?.length" :list="item.children" />
      </div>
  </template>

    <script setup lang="ts">
     import {defineProps, withDefaults} from "vue";
      // import {Tree as TreeItem} from '../Tree/index.vue'
      const props = defineProps({
        list:{
          type:Array,
          default: () => []
        }
      })
    </script>
    <style lang="scss" scoped>
      .tree{
        margin-left: 10px;
      }
    </style>
  ```

  ```js
     <Tree :list="treelist" />
     interface Tree {
        name:string,
        checked:boolean,
        children?:Tree[]
      }

    const treelist = reactive<Tree[]>([
      {
        name:'1',
        checked:false,
        children:[
          {
            name:"2-1",
            checked:false,
            children:[
              {
                name:"3-1",
                checked:false,
                children:[]
              },
              {
                name:"3-2",
                checked:true,
                children:[]
              },
              {
                name:"3-3",
                checked:false,
                children:[]
              }
            ]
          },
          {
            name:"2-2",
            checked:false,
            children:[

            ]
          }
        ]
      }
    ])

  ```
- 动态组件
  ```js
  // A.vue
  <template>
    <div class="content">
      A
    </div>
  </template>

  <script setup lang="ts"></script>

  <style lang="scss" scoped>
    .content{
      width: 100px;
      height: 100px;
      @include row-display{
        flex-wrap: wrap;
      }
      border: 1px red solid;
    }
  </style>
   // B.vue
  <template>
    <div class="content">
      B
    </div>
  </template>

  <script setup lang="ts"></script>

  <style lang="scss" scoped>
    .content{
      width: 100px;
      height: 100px;
      @include row-display{
        flex-wrap: wrap;
      }
      border: 1px red solid;
    }
  </style>
  ```
  ```js
  // App.vue
  <template>
    <div>
      <div class="tab">
        <div v-for="(item,index) in coms" :key="item.name" :class="[index === active ? 'active' : '' ]" class="tab-item" @click="handleTabClick(item,index)">
          <span>{{item.name}}</span>
        </div>
        <component :is="showComponent" />
      </div>
    </div>
  </template>
  <script setup lang="ts">
    import {ref, computed, reactive} from 'vue'
    import A from "@/components/A/index.vue"
    import B from "@/components/B/index.vue"
    const showComponent = ref(A)
    const active = ref(0)
    const coms = reactive([
      {
        name:'A组件',
        com: A
      },
      {
        name:'B组件',
        com: B
      },
      {
        name:'C组件',
        com: C
      },
    ])
    const handleTabClick = (item,index) => {
      showComponent.value = item.com
      active.value = index
    }
  </script>

  <style lang="scss" scoped>
    .tab{
      width: 300px;
      height: 200px;
      @include row-display{
        flex-wrap: wrap;
      }
      .tab-item{
        margin: 0 10px;
        padding: 5px 10px;
        border: 1px black solid;
        cursor: pointer;
      }
    }
    .active {
      color: blue;
    }
  </style>
  ```
  - 页面警告
    ```
    App.vue:19 [Vue warn]: Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`. 
    ```
    意思是会把组件信息也变成响应式，导致性能开销，所以需要使用`markRaw`或者`shallowRef`代替`ref`。
    - markRaw: 将一个对象标记为不被转化为代理对象（即不具有响应式特性），返回该对象本身。
    ```js
       // App.vue
    <template>
      <div>
        <div class="tab">
          <div v-for="(item,index) in coms" :key="item.name" :class="[index === active ? 'active' : '' ]" class="tab-item" @click="handleTabClick(item,index)">
            <span>{{item.name}}</span>
          </div>
          <component :is="showComponent" />
        </div>
      </div>
    </template>
    <script setup lang="ts">
      import {ref, computed, reactive} from 'vue'
      import A from "@/components/A/index.vue"
      import B from "@/components/B/index.vue"
      const showComponent = shallowRef(A)
      const active = ref(0)
      const coms = reactive([
        {
          name:'A组件',
          com: markRaw(A)
        },
        {
          name:'B组件',
          com:markRaw(B)
        },
        {
          name:'C组件',
          com: markRaw(C)
        },
      ])
      const handleTabClick = (item,index) => {
        showComponent.value = item.com
        active.value = index
      }
    </script>

    <style lang="scss" scoped>
      .tab{
        width: 300px;
        height: 200px;
        @include row-display{
          flex-wrap: wrap;
        }
        .tab-item{
          margin: 0 10px;
          padding: 5px 10px;
          border: 1px black solid;
          cursor: pointer;
        }
      }
      .active {
        color: blue;
      }
    </style>
    ```
## 插槽
### 匿名插槽
```js
     <slot></slot>
```
### 具名插槽
```js
  <slot name="header"></slot>
```
```js
//父组件
   <template #header>
      <span>具名插槽</span>
  </template>
// 或者
   <template v-slot:header>
      <span>具名插槽</span>
  </template>
```
### 作用域插槽
```js
//子组件
  <template>
    <header>
      <slot name="header" data="我是header插槽传过来的数据"></slot>
    </header>

    <section>
      <slot :data="list"></slot>
    </section>

    <footer>

    </footer>
</template>

<script setup lang="ts">
  import {reactive} from "vue";

  type names = {
    name:string,
    age:number
  }
  const  list = reactive<names[]>([
    {
      name:'张三',
      age:20
    },
    {
      name:'李四',
      age:15
    },
    {
      name:'王五',
      age:16
    }
  ])
 </script>

<style lang="scss" scoped>
  header{
    height: 200px;
    background-color: red;
    color: #fff;
    @include row-display;
  }
  section{
    height: 500px;
    background-color: blue;
    color: white;
    @include row-display;
  }
  footer{
    height: 200px;
    background-color: aqua;
    color: blue;
    @include row-display;
  }

</style>
```

```js
  // 父组件
      <Dialog>
        <template #header="{data}">
          <span>具名插槽</span>
          <span>{{data}}</span>
        </template>
        <template #default="{data}">
          <span>匿名插槽</span>
          <span v-for="item in data" :key="item.age">
            {{item.name}}-{{item.age}}
          </span>
        </template>
    </Dialog>
```
### 动态插槽
```js
  <template #[slotName]>
      <span>我在哪里？</span>
  </template>

  let slotName = ref('footer')
```
## 异步组件、代码分包、suspense
### 骨架屏案例

```js
//skeleton.vue
  <template>
    <div class="skeleton-content">
      <div class="skeleton-header">
        <div class="skeleton-header-icon">
        <div class="img"></div>
        </div>
        <div class="skeleton-header-name"></div>
      </div>
      <hr/>
      <div class="skeleton-body"></div>
    </div>
  </template>

  <script setup lang="ts">

  </script>

  <style lang="scss" scoped>
    .skeleton-content{
      width: 600px;
      height: 200px;
      padding: 20px 10px;
      //background-color: #f5f0f0;
      .skeleton-header{
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
        .img{
          width: 50px;
          height: 50px;
          margin-right: 10px;
          border-radius: 50%;
          background-color: #f5f0f0;
        }
        .skeleton-header-name{
        width: 45px;
        height: 15px;
        background-color: #f5f0f0;
      }
      }
      .skeleton-body{
        width: 100%;
        height: 15px;
        background-color: #f5f0f0;
      }
    }
  </style>
```

```js
//skeleton.vue
 <template>
    <div class="sync-content">
      <div class="sync-header">
        <div class="sync-header-icon">
          <img :src="info.icon">
        </div>
        <div class="sync-header-name">{{info.name}}</div>
      </div>
      <hr/>
      <div class="sync-body">{{info.content}}</div>
    </div>
</template>

<script setup lang="ts">
    import {reactive} from "vue";

    let info = reactive({
      // name:"张三",
      // icon:'https://test.shwread.cn:8082/download/smgwykhserver/fc980774698b4bb9919f072002e2bbf6.jpg',
      // content:"你还是开两端红烧鸡块回复即可很反感，返回日的可过一会日考核；看附件多亏了附近"
    })
    await fetch('./data.json').then( data => {
      return data.text()
    }).then(res => {
      const result = JSON.parse(res)
      info = result.data
    })
</script>

<style lang="scss" scoped>
  .sync-content{
    width: 600px;
    height: 200px;
    padding: 20px 10px;
    background-color: #f5f0f0;
    .sync-header{
      width: 100%;
      height: 50px;
      display: flex;
      align-items: center;
      img{
        width: 50px;
        height: 50px;
        margin-right: 10px;
        border-radius: 50%;
      }
    }
  }
</style>
```

```js
  <template>
    <div class="app1">
      <Suspense>
        <template #default>
          <syncView />
        </template>
        <template #fallback>
          <skeleton/>
        </template>
      </Suspense>
    </div>
</template>

<script setup lang="ts">
  import skeleton from '@/components/skeleton/index.vue'
  import {defineAsyncComponent} from "vue";
  const syncView = defineAsyncComponent(() => import('@/components/sync/index.vue'))
</script>

<style lang="scss" scoped>
  .app1{
    @include row-display;
  }

</style>
```
## Teleport组件

 Teleport组件是一种能够将我们的模板渲染至指定的DOM节点，不受父级style、v-show等属性的影响，但data、prop数据依旧能够公用的技术，可以将子组件渲染到父组件之外的其他地方，常用于模态框、通知等场景。类似于React中的Portal技术。

## keep-alive组件
 keep-alive组件是vue内置的一个抽象组件，用于缓存不活动的组件实例，而不是销毁它们。主要用于减少组件的创建和销毁，从而提升性能。

开启keep-alive 生命周期的变化

- 初次进入时： `onMounted> onActivated`
- 退出后触发 `deactivated`
- 再次进入：只会触发 `onActivated`
- 事件挂载的方法等，只执行一次的放在 `onMounted`中；组件每次进去执行的方法放在 `onActivated`中
```js
  <!-- 基本 -->
  <keep-alive>
    <component :is="view"></component>
  </keep-alive>
  
  <!-- 多个条件判断的子组件 -->
  <keep-alive>
    <comp-a v-if="a > 1"></comp-a>
    <comp-b v-else></comp-b>
  </keep-alive>
  
  <!-- 和 `<transition>` 一起使用 -->
  <transition>
    <keep-alive>
      <component :is="view"></component>
    </keep-alive>
  </transition>

```
**include 和 exclude**

include 和 exclude 允许组件有条件地缓存。二者都可以用逗号分隔字符串、正则表达式或一个数组来表示。
```js
  <!-- 以英文逗号分隔的字符串 -->
  <KeepAlive include="a,b">
    <component :is="view" />
  </KeepAlive>

  <!-- 正则表达式 (需使用 `v-bind`) -->
  <KeepAlive :include="/a|b/">
    <component :is="view" />
  </KeepAlive>

  <!-- 数组 (需使用 `v-bind`) -->
  <KeepAlive :include="['a', 'b']">
    <component :is="view" />
  </KeepAlive>
```
它会根据组件的 name 选项进行匹配，所以组件如果想要条件性地被 KeepAlive 缓存，就必须显式声明一个 name 选项。

在 3.2.34 或以上的版本中，使用 `<script setup>` 的单文件组件会自动根据文件名生成对应的 name 选项，无需再手动声明。

可以通过传入 max prop 来限制可被缓存的最大组件实例数。
## 自动引入插件
**unplugin-auto-import/vite**
1. 安装
   ```js
      npm i -D unplugin-auto-import
   ```
2. 配置
   ```js
    //vite.config.ts
    import { defineConfig } from 'vite'
    import vue from '@vitejs/plugin-vue'
    import VueJsx from '@vitejs/plugin-vue-jsx'
    import AutoImport from 'unplugin-auto-import/vite'
    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [vue(),VueJsx(),AutoImport({
        imports:['vue'],
        dts:"src/auto-import.d.ts"
      })]
    })
   ```