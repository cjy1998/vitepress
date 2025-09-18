# 网格布局

![](https://imgbed.cj.abrdns.com/file/1758078461282_grid01.png)

## Grid Container（容器）

![](https://imgbed.cj.abrdns.com/file/1758078448408_grid02.png)

### 1. 定义网格

#### 1.1 指定一个容器为网格布局

```css
display: grid/inline-grid;
```

#### 1.2 定义行和列

```css
.container {
  width: 100vw;
  height: 100vh;
  display: grid;
  /* 一个两列，四行的网格布局 */
  grid-template-columns: 100px 100px;
  grid-template-rows: 100px 100px 100px 100px;
  .item {
    background-color: green;
    color: #fff;
  }
}
```

💡 除了使用绝对单位，还可以使用百分比。

#### 1.3 grid-template-areas

grid-template-areas 用来**通过命名区域的方式定义网格布局**，让代码更直观。需要 `grid-area` 配合使用

- 基本语法

```css
.container {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 15% 80%;
  grid-template-rows: 10% 75% 10%;
  grid-template-areas:
    "header header"
    "nav main"
    "footer footer";
}
```

    - 每一个单词代表一个单元格，单词之间用空格隔开。
    - 相同的单词会合并成一个区域

- 结合 `grid-area` 使用

```css
.container {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 15% 80%;
  grid-template-rows: 10% 75% 10%;
  grid-template-areas:
    "header header"
    "nav main"
    "footer footer";
  .header {
    grid-area: header;
    background-color: rgb(245, 245, 245);
  }
  .nav {
    grid-area: nav;
    background-color: rgb(254, 243, 199);
  }
  .main {
    grid-area: main;
    background-color: rgb(217, 249, 157);
  }
  .footer {
    grid-area: footer;
    background-color: rgb(125, 211, 252);
  }
}
```

```html
<div class="container">
  <div class="header">header</div>

  <div class="nav">nav</div>

  <div class="main">main</div>

  <div class="footer">footer</div>
</div>
```

这样就可以得到一个三行两列布局：

- 第一行：header 占满整行
- 第二行：左侧 nav，右侧 main
- 第三行：footer 占满整行

![](https://imgbed.cj.abrdns.com/file/1758078444783_image.png)

💡 注意点

1. 每一行的单词数量必须和`grid-template-columns` 定义的列数一致。

2. "." 表示一个空白区域。

```css
grid-template-areas: "header header" "nav main" "footer .";
```

![](https://imgbed.cj.abrdns.com/file/1758078386279_image_1.png) 3. 一个区域必须是 **矩形**。 下述代码为错误示例：

```css
grid-template-areas: "header header" "header main" "footer .";
```

`grid-template-areas`** 就是给网格区域起名字，然后通过 **`grid-area`** 把元素放进去，就像画表格一样排版。**

#### 1.4 grid-template

grid-template 是以下三个属性的简写：

- `grid-template-rows`
- `grid-template-columns`
- `grid-template-areas`

语法

```css
grid-template: <grid-template-rows> / <grid-template-columns>;
grid-template: <grid-template-areas>;
grid-template: <grid-template-areas> <grid-template-rows> / <grid-template-columns>;
```

示例：

```css
grid-template: 10% 75% 10% / 15% 80%;
/* 等价于 */
grid-template-columns: 15% 80%;
grid-template-rows: 10% 75% 10%;
```

```css
grid-template:
  "header header"
  "nav main"
  "footer .";
/* 等价于 */
grid-template-areas:
  "header header"
  "nav main"
  "footer .";
```

```css
grid-template:
  "header header" 10%
  "nav main" 75%
  "footer ." 10%
  / 15% 80%;
/* 等价于 */
grid-template-areas:
  "header header"
  "nav main"
  "footer .";
grid-template-columns: 15% 80%;
grid-template-rows: 10% 75% 10%;
```

#### 1.5 grid

是一个更大范围的简写属性，同时可以设置以下属性：

- `grid-template-rows`
- `grid-template-columns`
- `grid-template-areas`
- `grid-auto-rows`
- `grid-auto-columns`
- `grid-auto-flow`

语法

```css
/* grid-template 简写 */
grid: <grid-template>;

/* 自动生成轨道简写 */
grid: <grid-auto-flow> <grid-auto-rows> / <grid-auto-columns>;
```

示例

```css
/*定义模板，等价于 grid-template 的写法*/
.container {
  display: grid;
  grid:
    "header header" 60px
    "sidebar main" 1fr
    "footer footer" 40px
    / 100px 1fr;
}
```

```css
/*定义自动布局*/
.container {
  display: grid;
  grid: auto-flow 100px / 1fr 1fr;
}
/*等价于*/
grid-auto-flow: row;
grid-auto-rows: 100px;
grid-template-columns: 1fr 1fr;
```

### 2. 间距控制

```css
grid-column-gap: 10px;
grid-row-gap: 5px;
/*或者  上边为早期命名版本*/
column-gap: 10px;
row-gap: 5px;
/*或同时设置 行 列*/
gap: 5px 10px;
```

> 规范的早期版本将此属性命名为  `grid-row-gap`，为了保持与旧网站的兼容性，浏览器仍然会将  `grid-row-gap`  视为  `row-gap`  的别名。（MDN）

### 3. 对齐方式

#### 对齐单元格内部的内容（items）

控制 `grid item` 在自己单元格中的对齐方式

1. `justify-items`

设置单元格内项目在 **水平方向** 的对齐方式。

2. `align-items`

设置单元格内项目在 **垂直方向** 的对齐方式。

3. `place-items` `justify-items` + `align-items` 的简写。

#### 对齐整个网格整体（content）

1. `justify-content`

在 **水平方向** 上对齐整个网格。

2. `align-content`

在 **垂直方向** 上对齐整个网格。

3.  `place-content` `justify-content` + `align-content` 的简写。

### 4. 自动生成规则

#### `grid-auto-rows`/ `grid-auto-columns`

定义**隐式网络轨道**的大小

显示网格：使用`grid-template-rows` / `grid-template-columns` 定义好的轨道。

隐式网格： 项目放置超出了定义的行/列时，浏览器“临时生成”的额外行/列。

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px; /* 显式定义 2 列 */
  grid-auto-rows: 80px; /* 隐式行高度 */
}
```

```html
<div class="container">
  <div>A</div>
  <div>B</div>
  <!-- C 会被放在第 2 行，生成隐式行 -->
  <div>C</div>
</div>
```

![](https://imgbed.cj.abrdns.com/file/1758089352003_image.png)

#### `grid-auto-flow`

定义没有指定位置的项目如何被摆放。

    1. row(默认)：先填充行，再换行。

显示网格是 2 列 3 行，刚好能放下 6 个元素。**grid-auto-flow 来决定第 7 个元素的位置。**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        width: 50%;
        display: grid;
        grid-template-columns: 50% 50%;
        grid-template-rows: repeat(3, 200px);
        grid-auto-flow: row;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="item">1</div>
      <div class="item">2</div>
      <div class="item">3</div>
      <div class="item">4</div>
      <div class="item">5</div>
      <div class="item">6</div>
      <div class="item">7</div>
    </div>
    <script>
      const items = document.querySelectorAll(".item");
      items.forEach((item, index) => {
        item.style.backgroundColor = `rgb(${index * 200},${index * 50},${
          index * 20
        })`;
        item.style.color = "green";
      });
    </script>
  </body>
</html>
```

![](https://imgbed.cj.abrdns.com/file/1758091345966_image.png)

    2. column：先填充列，再换列。

`grid-auto-flow: column;`

![](https://imgbed.cj.abrdns.com/file/1758091573773_image.png)

    3. row dense / column dense：表示紧凑模式，尽量把空隙填满。

例如：一个元素占了 2 列`，grid-auto-flow:row，则会有空隙。`

```html
<style>
  .container {
    width: 50%;
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: repeat(3, 200px);
    grid-auto-flow: row;
  }
</style>
<div class="container">
  <div class="item">1</div>
  <div class="item" style="grid-column: span 2">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
  <div class="item">7</div>
</div>
```

![](https://imgbed.cj.abrdns.com/file/1758091997290_image.png)  
grid-auto-flow:row dense，则不会有空隙。 **后面元素会“往前挤”，避免空隙 ，`dense` 模式牺牲了“顺序”，但更节省空间。 浏览器会尝试“回头补洞”**

![](https://imgbed.cj.abrdns.com/file/1758092140964_image.png)

## Grid Item（项目）

![](https://imgbed.cj.abrdns.com/file/1758094295702_image.png)

### grid-column-start 等

主要用来指定**网格项在网格中的位置和跨度。**

语法：

```html
grid-column-start:
<line
  >; grid-column-end:
  <line
    >; grid-row-start: <line>; grid-row-end: <line>;</line></line></line
  ></line
>
```

`<line>` 表示网格线编号，或者用 `span` 表示跨多少行/列。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        display: grid;
        grid-template-columns: repeat(3, 33%);
        grid-template-rows: repeat(2, 200px);
      }
      .item3 {
        grid-column-start: 1;
        grid-column-end: 3;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="item">1</div>
      <div class="item">2</div>
      <div class="item3">3</div>
      <div class="item">4</div>
      <div class="item">5</div>
      <div class="item">6</div>
      <div class="item">7</div>
    </div>
    <script>
      const items = document.querySelectorAll(".item");
      items.forEach((item, index) => {
        item.style.backgroundColor = `rgb(${index * 200},${index * 50},${
          index * 20
        })`;
        item.style.color = "green";
      });
    </script>
  </body>
</html>
```

![](https://imgbed.cj.abrdns.com/file/1758096812070_image.png)

表示 item3 这个元素区域是从第一条竖线到第三条竖线

### grid-column / grid-row

是上述 4 个属性的简写。

```css
.item {
  grid-column: 1 / 3; /* 相当于 start:1; end:3 */
  grid-row: 2 / 4;
}
```

```css
.item {
  grid-column: span 2; /* 跨两列 */
  grid-row: span 3; /* 跨三行 */
}
```

### grid-area

1. 指定区域名字（配合 grid-template-areas）
2. 指定位置的缩写

语法：`grid-area: <row-start> / <column-start> / <row-end> / <column-end>;`

```css
.item {
  grid-area: 2 / 1 / 4 / 3;
}
/* 相当于 */
grid-row-start: 2;
grid-column-start: 1;
grid-row-end: 4;
grid-column-end: 3;
```

### justify-self / align-self / place-self

用于 **单个子项的对齐方式**：

- `justify-self`：水平方向（x 轴，行内方向）的对齐方式
- `align-self`：垂直方向（y 轴，列方向）的对齐方式
- `place-self`：简写，语法是 `place-self: align-self justify-self`

## 进阶特性

### **fr**单位

可分配空间的比例单位

```css
display: grid;
grid-template-columns: 1fr 2fr 1fr;
grid-template-rows: 2fr 1fr;
```

![](https://imgbed.cj.abrdns.com/file/1758098485493_image.png)

上述表示把列的剩余空间分为 5 份，第 2 列占 2 份，把行的剩余空间分为 3 份，第 1 行占两份。

### repeat()

用于简化重复的网格轨道定义

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 200px);
}
/*相当于*/
grid-template-columns: 200px 200px 200px;
```

搭配`fr`实现等分：

```css
grid-template-columns: repeat(3, 1fr); /* 三等分 */
```

### minmax()

定义一个轨道的最小值和最大值。常用场景：防止元素在小屏幕挤成 0 。

```css
/*表示列宽 至少 150px，但最多占据剩余空间的一份。*/
grid-template-columns: minmax(150px, 1fr);
```

### auto-fill vs auto-fit

这两个和 `repeat()` + `minmax()` 一起用，常见于自适应布局：

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}
```

- **auto-fill**
  - 会尽可能多地生成轨道，哪怕没有内容。
  - 所以当容器变宽时，**右边留着空白的列轨道**。
- **auto-fit**
  - 会折叠掉没有内容的轨道。
  - 所以当容器变宽时，**已有的元素会被拉伸填满整个宽度**。

### 命名网格线

```css
.container {
  display: grid;
  grid-template-columns: [sidebar-start] 200px [sidebar-end content-start] 1fr [content-end];
}

.sidebar {
  grid-column: sidebar-start / sidebar-end;
}
.content {
  grid-column: content-start / content-end;
}
```

### 层叠效果

```css
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        padding: 50px;
        height: 60vh;
        font-size: 2rem;
        color: #fff;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
      .item1 {
        background-color: rgb(162, 192, 79);
        grid-area: 1 / 1 / 3 / 3;
        z-index: 1;
        border-radius: 15px;
      }
      .item2 {
        background-color: rgb(63, 63, 131);
        grid-area: 1 / 2 / 3 / 4;
        z-index: 2;
        border-radius: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="item1">1</div>
      <div class="item2">2</div>
    </div>
  </body>
</html>

```

![](https://imgbed.cj.abrdns.com/file/1758100455411_image.png)

## 实战案例

### 两栏/三栏自适应布局

#### 两栏布局

```css
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        padding: 50px;
        height: 60vh;
        font-size: 2rem;
        color: #fff;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        /*固定 + 自适应*/
        /* grid-template-columns: 200px 1fr;*/
      }
      .item1 {
        background-color: rgb(162, 192, 79);
        border-radius: 15px;
      }
      .item2 {
        background-color: rgb(63, 63, 131);
        border-radius: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="item1">1</div>
      <div class="item2">2</div>
    </div>
  </body>
</html>

```

#### 三栏布局

```css
grid-template-columns: repeat(3, 1fr);
/*固定 + 自适应*/
/* grid-template-columns: 200px 1fr 1fr;*/
```

### 卡片式响应式布局

```css
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

### 圣杯布局

```css
grid-template-columns: 200px 1fr 350px;
```
