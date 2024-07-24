# css
## BEM
BEM（Block Element Modifier）是一种CSS命名方法，旨在提高代码的可读性和可维护性。BEM通过将CSS类名分为三个部分来组织代码：块（Block）、元素（Element）和修饰符（Modifier）。

**Block（块）：**
- 代表一个独立的功能单元或组件，可以是页面的主要部分，如导航栏、表单、按钮等。
- 每个块都有明确的功能和职责，是代码组织的基本单位。

**Element（元素）：**
- 是块中的子元素，它们是构成块的具体部分。
- 例如，按钮中的文本、图标等都是元素。
- 元素依赖于其所属的块，并从属于它。
  
**Modifier（修饰符）：**
- 用于表示块或元素的特定状态或变体。
- 可以是样式上的变化，如颜色、大小、状态等，也可以是行为上的改变。
- 修饰符使得同一个块或元素能够呈现出多种不同的形式。

**BEM 的优点包括：**
-  **命名规范的一致性：**通过使用特定的命名约定，开发者能够很容易地识别出不同的组件及其属性，提高代码的可读性和可理解性。
-  **模块化设计：**将界面拆分成独立的模块，每个模块都有自己的命名空间，这种模块化的设计使得代码更易于维护和扩展，同时也减少了代码之间的耦合度。
-  **清晰的结构：**帮助建立起清晰的代码结构，使得各个组件之间的关系一目了然，这不仅便于开发者在项目中快速定位和理解代码，也有利于团队协作和代码交接。
-  **强调可复用性：**鼓励开发可复用的组件，通过定义明确的块、元素和修饰符，相同的组件可以在不同的地方被重复使用，提高了开发效率。
```html
    <button class="button button--primary">Primary Button</button>
```
在这个例子中，"button" 是块，"button--primary" 是修饰符，表示按钮的主要状态。
### 在Vue项目使用
1. 首先安装sass预处理器
   ``` 
      npm install -D sass
    ```
2. 新建全局样式文件
   ```scss
      //src/assets/styles/global.scss
        $namespace:'cjy' !default;
        $block-sel:'-' !default;
        $elem-sel:'__' !default;
        $mod-sel:'--' !default;

        @mixin b($block){
        $B:#{$namespace + $block-sel + $block};
        .#{$B}{
        @content
        }
        }

        @mixin e($el){
        $selector:&;
        @at-root {
            #{$selector+$elem-sel+$el}{
            @content
            }
        }

        }

        @mixin m($m){
        $selector:&;
        @at-root {
            #{$selector+$mod-sel+$m}{
            @content
            }
        }

        }
    ```
3. 在vite.config.js中配置全局样式文件
   ```js
      import { defineConfig } from 'vite'
      import vue from '@vitejs/plugin-vue'
      import path from 'path'
      // https://vitejs.dev/config/
      export default defineConfig({
        plugins: [vue()],
        css: {
          preprocessorOptions: {
            scss: {
              additionalData: `@import "@/assets/styles/global.scss";`
            }
          }
        }
      })
    ```
4. 在组件中使用
   ```vue
        <template>
        <div class="cjy-test">
            block
            <div class="cjy-test__inner">el</div>
            <div class="cjy-test--success">test</div>
        </div>
        </template>

        <style lang="scss">
        @include b(test){
        color: aquamarine;
        @include e(inner){
            color: antiquewhite;
        }
        @include m(success){
            color: blue;
        }
        }
        </style>
    ```