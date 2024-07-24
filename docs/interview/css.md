# CSS
## 1. BFC
块级格式化上下文（Block Formatting Context，BFC）是Web页面的可视化CSS渲染的一部分，是布局过程中生成块级盒子的区域，也是浮动元素与其他元素交互的区域。

BFC具有以下特性：

1. BFC内的元素不会与浮动元素重叠。
2. BFC内的元素垂直方向上的外边距会发生重叠。
3. BFC内的元素可以包含浮动元素。
4. BFC可以阻止外边距折叠。

创建BFC的方法有：

1. 设置元素的`overflow`属性为`auto`、`hidden`或`scroll`。
2. 设置元素的`display`属性为`inline-block`、`table-cell`、`table-caption`、`flex`或`grid`。
3. 设置元素的`position`属性为`absolute`或`fixed`。
4. 设置元素的`float`属性为`left`或`right`。
## 2. 盒子模型
盒子模型（Box Model）是Web页面布局的基础，它定义了元素的内容、内边距、边框和外边距。

盒子模型有三种类型：

1. 标准盒子模型（W3C盒子模型）：元素的宽度和高度只包含内容区域，不包括内边距、边框和外边距。
2. IE盒子模型（怪异盒子模型）：元素的宽度和高度包含内容区域、内边距和边框，但不包括外边距。
3. CSS3盒子模型：元素的宽度和高度包含内容区域、内边距和边框，但不包括外边距。
可以通过设置元素的`box-sizing`属性来选择使用哪种盒子模型：

1. `box-sizing: content-box`：使用标准盒子模型。
2. `box-sizing: border-box`：使用IE盒子模型。
3. `box-sizing: inherit`：继承父元素的`box-sizing`属性。
## 3. Flex布局
Flex布局（Flexible Box Layout）是一种布局模型，它允许容器内的元素在容器内灵活地排列和调整大小。

Flex布局的主要概念包括：

1. 容器（Flex Container）：包含子元素的容器元素，使用`display: flex`或`display: inline-flex`属性来启用Flex布局。
2. 项目（Flex Item）：容器内的子元素，它们会按照Flex布局的规则进行排列和调整大小。
3. 主轴（Main Axis）：Flex布局的主轴方向，可以是水平方向（默认）或垂直方向（通过设置`flex-direction`属性为`column`或`column-reverse`）。
4. 交叉轴（Cross Axis）：与主轴垂直的轴，可以是水平方向或垂直方向。
5. 对齐方式（Alignment）：Flex布局中元素的对齐方式，包括水平对齐（通过设置`justify-content`属性）和垂直对齐（通过设置`align-items`属性）。
Flex布局的主要属性包括：

1. `display`：设置容器的显示类型为`flex`或`inline-flex`。
2. `flex-direction`：设置主轴的方向为水平（默认）或垂直。
3. `justify-content`：设置主轴上的对齐方式，包括`flex-start`、`flex-end`、`center`、`space-between`、`space-around`等。
4. `align-items`：设置交叉轴上的对齐方式，包括`flex-start`、`flex-end`、`center`、`baseline`、`stretch`等。
5. `flex-wrap`：设置子元素是否换行，包括`nowrap`（默认）、`wrap`、`wrap-reverse`等。
6. `flex-grow`、`flex-shrink`、`flex-basis`：设置子元素的扩展、收缩和基准大小。
7. `align-self`：设置子元素在交叉轴上的对齐方式，可以覆盖容器的`align-items`属性。
## 4. CSS选择器
CSS选择器用于选择HTML元素，以便为其应用样式。以下是一些常用的CSS选择器：

1. 元素选择器：根据元素名称选择元素，例如`p`、`div`、`h1`等。
2. 类选择器：根据元素的类属性选择元素，例如`.class-name`。
3. ID选择器：根据元素的ID属性选择元素，例如`#id-name`。
4. 属性选择器：根据元素的属性和属性值选择元素，例如`[type="text"]`。
5. 伪类选择器：根据元素的状态或位置选择元素，例如`:hover`、`:active`、`:first-child`等。
6. 伪元素选择器：选择元素的特定部分，例如`::before`、`::after`。
7. 组合选择器：将多个选择器组合在一起，例如`div p`、`.class-name #id-name`。
8. 通用选择器：选择所有元素，例如`*`。
