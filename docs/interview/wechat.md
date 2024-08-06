# 微信小程序面试题
## 请简述微信小程序主要目录和文件的作用？
- project.config.json：微信开发者工具的项目配置文件，包含项目的基本信息和开发者工具的一些设置。开启https校验、scss、appid。
- app.js：小程序的入口文件，包含小程序的生命周期函数（如 onLaunch、onShow）和全局数据。
- app.json：包括小程序的页面路径、窗口表现、导航栏、底部 tab 等配置。
- app.wxss：小程序的全局样式文件，定义全局的样式规则。
- pages目录：存放小程序的所有页面，每个页面通常包含四个文件：.js（逻辑层）、.wxml（结构层）、.wxss（样式层）、.json（配置文件）。
    - index.json：配置当前页面标题和引入组件
## 请谈谈wxml与标准的html的异同？
**相同点：**
1. 基础结构：
   - wxml和html都是标记语言，用于描述页面的结构。
   - 两者都使用标签来定义元素，并支持嵌套结构。
2. 基本概念：
   - 都有类似的标签结构，如`div` 和 `view`用于定义容器元素。
   - 支持属性定义，如`class`、`id`等。
**不同点：**
1. 标签名称：
   - WXML 使用了一些与 HTML 不同的标签名称。例如，WXML 中的` <view> `相当于 HTML 中的 `<div>`，`<text> `相当于 `<span>`。
   - WXML 中有一些专有的组件标签，如 `<button>`、`<input>`、`<navigator>`，这些标签在微信小程序环境中有特定的功能。
2. 数据绑定：
   - WXML 支持数据绑定，使用双大括号 `{{}}` 语法，可以将逻辑层的数据直接绑定到视图层。
   - HTML 本身不支持数据绑定，需要借助框架如 Angular、React、Vue.js 来实现数据绑定功能。
3. 事件处理：
   - WXML 中事件处理使用 bind 或 catch 前缀，如 bindtap、catchtap，用于绑定点击事件。
   - HTML 中事件处理使用 on 前缀，如 onclick。
4. 模板与条件渲染：
   - WXML 支持模板语法和条件渲染，可以使用 `<template>` 标签定义可复用的模板，并通过 wx:if、wx:for 等指令进行条件渲染和循环渲染。
   - HTML 本身不支持这些功能，需要借助 JavaScript 或模板引擎（如 Handlebars、Mustache）来实现。
5. 平台特性：
   - WXML 是为微信小程序量身定制的，只能在微信小程序环境中运行，依赖于微信的运行时环境。
   - HTML 是通用的标记语言，可以在各种浏览器中运行，是构建 Web 页面的基础。
   - 小程序运行在JS Core内，没有DOM树和windiw对象，小程序中无法使用window对象和document对象。
## 小程序页面之间有哪些（传值）传递数据的方法？
1. **通过页面路由传递参数**
   通过 wx.navigateTo、wx.redirectTo、wx.reLaunch 等方法跳转页面时，可以在 url 中附带参数。这些参数可以在目标页面的 onLoad 方法中通过 options 对象获取。
   ```js
    // 页面A中跳转到页面B并传递参数
        wx.navigateTo({
            url: '/pages/B/B?key=value'
            });

        // 页面B中获取参数
        Page({
            onLoad: function(options) {
                console.log(options.key); // 输出 "value"
            }
            });
   ```
2. **通过全局变量传递**
   利用全局变量传递数据，可以将需要共享的数据存储在 App 实例中。
   ```js
   // 在app.js中定义全局数据
    App({
        globalData: {
            sharedData: null
            }
        });

    // 页面A中设置全局数据
    getApp().globalData.sharedData = "some data";

    // 页面B中获取全局数据
    Page({
    onLoad: function() {
        const app = getApp();
        console.log(app.globalData.sharedData); // 输出 "some data"
    }
    });
   ```
3. **通过本地存储传递**
   可以使用微信小程序提供的本地存储API（如 wx.setStorage、wx.getStorage）来传递数据。
   ```js
    // 页面A中设置本地存储
        wx.setStorage({
        key: 'key',
        data: 'some data'
        });

        // 页面B中获取本地存储的数据
        wx.getStorage({
        key: 'key',
        success: function(res) {
            console.log(res.data); // 输出 "some data"
        }
        });
   ```
4. **通过事件传递**
   可以使用事件订阅/发布机制，在不同页面之间传递数据。这可以借助第三方库如 eventemitter2，或者自己实现一个简单的事件总线。
   ```js
    // event.js (简单的事件总线实现)
    const eventBus = {};

    eventBus.on = function(event, callback) {
    if (!this.events) {
        this.events = {};
    }
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
    };

    eventBus.emit = function(event, data) {
    if (this.events && this.events[event]) {
        this.events[event].forEach(callback => callback(data));
    }
    };

    module.exports = eventBus;

    // 页面A中发布事件
    const eventBus = require('../../utils/event');
    eventBus.emit('dataChanged', 'some data');

    // 页面B中订阅事件
    const eventBus = require('../../utils/event');
    eventBus.on('dataChanged', function(data) {
    console.log(data); // 输出 "some data"
    });
   ```
5. **通过自定义组件传递**
   如果数据传递发生在父子组件之间，可以通过自定义组件的属性和事件来传递数据。
   ```js
    // 子组件 child.js
    Component({
    properties: {
        propData: String
    },
    methods: {
        triggerEvent() {
        this.triggerEvent('myevent', { data: 'some data' });
        }
    }
    });

    // 父组件 parent.wxml
    <child propData="{{parentData}}" bind:myevent="handleEvent" />

    // 父组件 parent.js
    Page({
    data: {
        parentData: 'data from parent'
    },
    handleEvent(e) {
        console.log(e.detail.data); // 输出 "some data"
    }
    });
   ```