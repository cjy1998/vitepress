# webpack4
## webpack4

1. 为什么需要构建工具？
   - 转换ES6语法
   - 转换JSX
   - CSS前缀补全/预处理器
   - 压缩混淆
   - 图片压缩
2. 初识webpack

**配置文件名称**：webpaack.config.js 可以通过webpack --config指定配置文件。

**webpack配置组成**
```js
module.exports = {
    entry:''  //打包的入口文件
    output:' //打包的输出
    mode:''   //环境
    module:{
    rules:[   //loader配置
        {}
    ]
    },
    plugins:[    //插件配置
    new HtmlwebpackPlugin({
        template:""
    })
    ]
}
```
**Entry的用法**
```js
// 单入口
module.exports = {
    entry:'./src/main.js'  //打包的入口文件
}

// 多入口
module.exports = {
    entry:{
    app:'./src/main.js',
    adminApp:"...."
    } //打包的入口文件
}
```
**output的用法**
```js
// 单入口配置
module.exports = {
    entry:''  //打包的入口文件
    output:{
        filename:'..',
        path:__dirname+'/dist'
        } //打包的输出
    }
    // 多入口配置
    module.exports = {
        entry:{
            app:'./src/main.js',
            adminApp:"...."
        } //打包的入口文件
        output:{
            // 通过占位符确保文件名称的唯一
            filename:'[name].js',
            path:__dirname+'/dist'
        } //打包的输出
}
```
**loaders**

    webpack开箱即用只支持JS和JSON两种文件类型，通过loaders去支持其他文件类型并且把他们转换成
    有效的模块，并且可以添加到依赖图中。本身是一个函数，接受源文件作为参数，返回转换的结果。
**常见的Loaders:**
| loader       | 说明 | 
| :---     |    :----:   |  
| babel-loader | 转换ES6、ES7等JS新特性语法| 
| css-loader   | 支持.css文件的加载和解析     | 
| less-loader | 将less文件转换为css | 
| ts-loader   | 将TS转换为JS| 
| file-loader   | 进行图片、字体的打包 | 
| raw-loader   | 将文件以字符串的形式导入| 
| thread-loader   | 多进程打包JS和css | 

**Loaders的用法：**
```js
const path = require("path");
module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module:{
    rules:[
      // test指定匹配规则  use指定使用的loader名称
      {test:/\.txt$/,use:'raw-loader'}
    ]
  }
};
```
**Plugins**

插件用于bundle文件的优化，资源管理和环境变量注入，作用于整个构建过程。

**常见的plugins：**
| plugin       | 说明 | 
| :---     |    :----:   |  
| CommonsChunkPlugin | 将chunks相同的模块代码提取成公共js| 
| CleanWebpackPlugin   | 清理构建目录     | 
| ExtractTextWebpackPlugin | 将CSS从bunlde文件里提取成一个独立的css文件 | 
| CopyWebpackPlugin   | 将文件或者文件夹拷贝到构建的输出目录| 
| HtmlWebpackPlugin   | 创建html文件去承载输出的bundle | 
| UglifyjsWebpackPlugin   | 压缩JS | 
| ZipWebpackPlugin  | 将打包出的资源生成一个zip包 | 

**plugins的用法：**
```js
const path = require("path");
module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  plugins:[
    new HtmlWebpackPlugin({
      template:'./src/index.html'
    })
  ]
}
```
**Mode**
Mode用来指定当前的构建环境是：production、development还是none。设置mode可以使用webpack内置的函数，默认值为production。

**Mode的内置函数功能：**
| 选项       | 说明 | 
| :---     |    :----:   |  
| development | 设置process.env.NODE_ENV的值为development.开启NamedChunksPlugin和NamedModulesPlugin.| 
| production   | 会将 DefinePlugin 中 process.env.NODE_ENV 的值设置为 production。为模块和 chunk 启用确定性的混淆名称，FlagDependencyUsagePlugin，FlagIncludedChunksPlugin，ModuleConcatenationPlugin，NoEmitOnErrorsPlugin 和 TerserPlugin 。     | 
| none | 不使用任何默认优化选项 | 

- 使用babel-loader解析ES6
```js
 npm i @babel/core @babel/preset-env babel-loader -D
```
**配置文件.babelrc**
```js
{
    "presets": [
        "@babel/preset-env"
    ]
}
webpack.config.js
JavaScript
const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      // test指定匹配规则  use指定使用的loader名称
      { test: /.js$/, use: "babel-loader" },
    ],
  },
};
```
**解析React JSX**
```js
{
    "presets": [
        "@babel/preset-env",
        "@babel/preset-react"
    ]
}
```
**解析css和less**
css-loader用于加载.css文件，并且转换成commonjs对象。style-loader将样式通过