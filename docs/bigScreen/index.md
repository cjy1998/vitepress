## 1、创建项目

```b
npm create vite@latest
```

node版本需要>=18

## 2、集成eslint、prettier

### 2.1 安装eslint相关依赖

```ba
npm i -D @typescript-eslint/eslint-plugin@7.10.0 @typescript-eslint/parser@7.10.0 eslint@8.57.0 eslint-plugin-vue@9.22.0 vite-plugin-eslint@1.8.1
```

### 2.2 新增eslint命令脚本

在package.json中新增命令脚本:

```bas
  "scripts": {
    "eslint": "eslint src --ext .js,.jsx,.ts,.tsx,.vue --ignore-path .gitignore .",
    "eslint:fix": "eslint --fix --ext .js,.jsx,.ts,.tsx,.vue --ignore-path .gitignore ."
  },
```

### 2.3 eslint配置

项目根目录下创建一个eslint配置文件.eslintrc.json：

```json
{
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    // 继承的eslint规则库
    "extends": [
      // vue规则
      "plugin:vue/vue3-recommended",
    // ts规则，后面定义的如果有相同规则名的话，后定义的会覆盖前面定义的
      "plugin:@typescript-eslint/recommended"
    ],
  // 添加vue文件解析器  解析template文件
  "parser": "vue-eslint-parser",
  // 使用ts的eslint解析器对最新模块语法进行检查
  "parserOptions": {
      "ecmaVersion": "latest",
      "parser": "@typescript-eslint/parser",
      "sourceType": "module"
  },
  // 应用的插件，对应了extends配置项中相应插件的规则库
  "plugins": [
      "@typescript-eslint",
      "vue"
  ],
  // 用户可以自己扩展的eslint检查规则，可覆盖extends中库定义的规则
  "rules": {
  }
}
```

vite服务集成eslint，以便vite执行构建时可以自动启用eslint，在vite.config.js中配置插件vite-plugin-eslint，调整内容如下：

```js
...
import eslintPlugin from 'vite-plugin-eslint'
...
export default defineConfig({
  plugins: [..., eslintPlugin({
      lintOnStart: true, // 启动时检查
      cache: false, // 每次启动都重新检查
      fix: true // 检查有错误自动修复
    })],
  ...
})

```

### 2.4 prettier配置

在根目录下创建配置文件，文件名为.prettierrc.cjs：

```js
module.exports = {
    // 一行最多多少个字符
    printWidth: 150,
    // 指定每个缩进级别的空格数
    tabWidth: 2,
    // 使用制表符而不是空格缩进行
    useTabs: false,
    // 在语句末尾是否需要分号
    semi: false,
    // 是否使用单引号
    singleQuote: true,
    // 更改引用对象属性的时间 可选值"<as-needed|consistent|preserve>"
    quoteProps: "as-needed",
    // 在JSX中使用单引号而不是双引号
    jsxSingleQuote: true,
    // 多行时尽可能打印尾随逗号。（例如，单行数组永远不会出现逗号结尾。） 可选值"<none|es5|all>"，默认none
    trailingComma: "none",
    // 在对象文字中的括号之间打印空格
    bracketSpacing: true,
    // jsx 标签的反尖括号需要换行
    jsxBracketSameLine: false,
    // 在单独的箭头函数参数周围包括括号 always：(x) => x \ avoid：x => x
    arrowParens: "always",
    // 这两个选项可用于格式化以给定字符偏移量（分别包括和不包括）开始和结束的代码
    rangeStart: 0,
    rangeEnd: Infinity,
    // 指定要使用的解析器，不需要写文件开头的 @prettier
    requirePragma: false,
    // 不需要自动在文件开头插入 @prettier
    insertPragma: false,
    // 使用默认的折行标准 always\never\preserve
    proseWrap: "preserve",
    // 指定HTML文件的全局空格敏感度 css\strict\ignore
    htmlWhitespaceSensitivity: "css",
    // Vue文件脚本和样式标签缩进
    vueIndentScriptAndStyle: false,
    //在 windows 操作系统中换行符通常是回车 (CR) 加换行分隔符 (LF)，也就是回车换行(CRLF)，
    //然而在 Linux 和 Unix 中只使用简单的换行分隔符 (LF)。
    //对应的控制字符为 "\n" (LF) 和 "\r\n"(CRLF)。auto意为保持现有的行尾
    // 换行符使用 lf 结尾是 可选值"<auto|lf|crlf|cr>"
    endOfLine: "auto"
}
```

对eslint的配置文件`.eslintrc.json`增加``的配置项

```json
{
  ...
  "extends": [
    ...,
    // 告诉 ESLint 关闭与 Prettier 格式化规则冲突的任何规则，需写在最后，会覆盖前面的配置
    "plugin:prettier/recommended"
  ],
  ...
  "plugins": [
    ...,
    // 将 Prettier 的格式化功能集成到 ESLint 中。会应用Prettier的配置
    "prettier"
  ],
  ...
}
```

## 3、配置scss

### 3.1 安装scss

```bas
npm install --save-dev sass-loader
npm install -D sass
```

### 3.2 创建全局变量文件

创建文件/assets/style/mixin.scss

```scss
///assets/style/mixin.scss
$back:rgb(253, 24, 24);
```

### 3.3 vite.config.js配置

```js
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    // css预处理器
    preprocessorOptions: {
      scss: {
        // 引入 mixin.scss 这样就可以在全局中使用 mixin.scss中预定义的变量了
        // 给导入的路径最后加上 ; 
        additionalData: '@import "@/assets/style/mixin.scss";'
      }
    }
  }
})
```

## 4、 配置项目内组件和API自动引入

### 4.1 安装插件

```bash
npm i unplugin-vue-components -D
npm i -D unplugin-auto-import
```

### 4.2 在vite.config.js进行配置

```js

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // 自动导入插件
    AutoImport({
      // 需要去解析的文件
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/ // .md
      ],
      // imports 指定自动引入的包位置（名）
      imports: ['vue', 'pinia', 'vue-router'],
      // 生成相应的自动导入json文件。
      eslintrc: {
        // 启用
        enabled: true,
        // 生成自动导入json文件位置
        filepath: './.eslintrc-auto-import.json',
        // 全局属性值
        globalsPropValue: true
      }
    }),
    Components({
      // imports 指定组件所在目录，默认为 src/components
      dirs: ['src/components/', 'src/view/'],
      // 需要去解析的文件
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/]
    })
  ],
})

```

## 5、适配方案

**vw+vh**

- 实现方式：按照设计稿的尺寸，将px按比例计算转为vw和vh。
- 优点：可以动态计算图表的宽高，字体等，灵活性较高；当屏幕比例和UI稿不一致时，不会出现两边留白情况。
- 缺点：每个图表都需要单独做字体、间距、位移的适配，比较麻烦。

**实现思路**

```js
假设设计稿尺寸为 1920*1080（做之前一定问清楚 ui 设计稿的尺寸）

即：
网页宽度=1920px
网页高度=1080px

我们都知道
网页宽度=100vw
网页宽度=100vh

所以，在 1920px*1080px 的屏幕分辨率下

1920px = 100vw

1080px = 100vh

这样一来，以一个宽 300px 和 200px 的 div 来说，其所占的宽高，以 vw 和 vh 为单位，计算方式如下:

vwDiv = (300px / 1920px ) * 100vw
vhDiv = (200px / 1080px ) * 100vh

所以，就在 1920*1080 的屏幕分辨率下，计算出了单个 div 的宽高

当屏幕放大或者缩小时，div 还是以 vw 和 vh 作为宽高的，就会自动适应不同分辨率的屏幕

```

**utils.scss**

```scss
// 使用 scss 的 math 函数，https://sass-lang.com/documentation/breaking-changes/slash-div
@use "sass:math";

// 默认设计稿的宽度
$designWidth: 1920;
// 默认设计稿的高度
$designHeight: 1080;

// px 转为 vw 的函数
@function vw($px) {
  @return math.div($px, $designWidth) * 100vw;
}

// px 转为 vh 的函数
@function vh($px) {
  @return math.div($px, $designHeight) * 100vh;
}
```

**在vite.config.js中进行配置**

```js
// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // 引入 mixin.scss 这样就可以在全局中使用 mixin.scss中预定义的变量了
        // 给导入的路径最后加上 ;
        additionalData: `@import "@/assets/style/mixin.scss";`
      }
    }
  }
})
```

配置完成后就可以全局直接使用 vw 和 vh 函数了。

