# Nextjs 基础中的注解

## React 中的 SuspenseAPI 实现原理

React 的 `Suspense` API 的核心原理是通过协调（**reconciliation**）和时间切片（**time slicing**），让 React 在渲染期间暂停和恢复特定组件的渲染，以优化用户体验。以下是其实现原理的核心机制：

### 1. **关键理念：协调（Reconciliation）**

- React 的 Fiber 架构支持在更新组件时将任务分成可中断的小块。
- 当组件内部某些部分需要更多时间才能准备好时，`Suspense` 会通知 React 暂停该部分的渲染，而优先完成其他已经准备好的部分。
- 这种暂停不会阻塞整个渲染树。

### 2. **`Suspense` 的核心流程**

#### **1. 组件抛出 Promise**

- 在 `Suspense` 的子组件中，当 React 渲染到需要数据的部分时，通常会通过一个异步数据源（如 `fetch`、`axios` 或自定义 hooks）触发数据加载。
- 如果数据尚未就绪，这些组件会抛出一个 Promise，通知 React "还没准备好"。

#### **2. 捕获 Promise 并暂停渲染**

- React 在 Fiber 树中捕获该 Promise，暂停当前子树的渲染。
- `Suspense` 会显示备用 UI（`fallback` 属性定义的内容），直到 Promise 解决（resolve）。

#### **3. 恢复渲染**

- 当 Promise 完成时，React 重新触发渲染，恢复暂停的子树，并更新最终的 UI。

### 3. **基于 Fiber 的工作原理**

- **Fiber 调度**：React 的 Fiber 架构允许对渲染任务进行优先级管理。当一个任务（如组件渲染）被暂停，React 会将其标记为低优先级并调度其他任务。
- **时间切片**：React 使用 `requestIdleCallback` 或 `MessageChannel` 等机制切片渲染任务，确保界面不会长时间卡住。

### 4. **`Suspense` 与并发模式**

- 在并发模式（Concurrent Mode）下，Suspense 的功能更强大：
  - React 能够提前开始渲染任务，并在后台完成准备。
  - 使用 `Suspense`，React 可以在等待异步数据时优雅地回退到 `fallback`，确保用户界面流畅。
  - 多个 `Suspense` 可以协同工作，确保用户不会看到不完整的界面。

### 5. **应用场景**

- **数据加载**：等待异步数据加载，例如与 `React.lazy` 或数据获取库（如 React Query）结合使用。
- **代码分割**：动态加载组件时，通过 `React.lazy` 实现按需加载。
- **流式渲染**：配合 React 服务器组件（React Server Components）和流式 HTML 响应实现更快的加载体验。

### 6. **限制**

- `Suspense` 只能捕获抛出的 Promise，开发者需要确保数据加载函数遵循该模式。
- 当前仅支持部分场景，复杂异步流（如多个嵌套数据源）需要额外管理。

总结：`Suspense` 本质上通过捕获组件抛出的 Promise，结合 Fiber 的任务调度和优先级管理，实现了渲染的暂停与恢复，使用户在数据未就绪时能够看到优雅的过渡状态，而非不完整的界面。

## React 中的 use 函数

React 的 `use` 函数是一种实验性 API，用于处理异步操作或 React 服务器组件（Server Components）中的数据加载。它允许你直接在组件中调用异步函数，并以同步的方式获取结果，而无需显式管理状态或副作用。

### **核心功能**

1. **同步读取异步数据：**
   - `use` 函数会自动等待传入的 Promise 完成，并返回解析后的数据。
   - 如果 Promise 尚未完成，React 会暂停渲染，直到数据就绪。
2. **与 Suspense 搭配：**
   - 当 `use` 遇到未完成的 Promise，会触发 `Suspense` 的暂停机制，并显示备用的 `fallback` UI。

### **语法**

```tsx
const result = use(promise);
```

- **参数：**
  - `promise`：一个表示异步操作的 Promise。
- **返回值：**
  - Promise 完成后解析的值。

### **使用场景**

#### 1. **在 Server Components 中使用**

Server Components 可以直接读取异步数据，例如从数据库或 API 获取数据。

```jsx
import { use } from "react";
async function fetchData() {
  const response = await fetch("https://api.example.com/data");
  return response.json();
}

export default function Component() {
  const data = use(fetchData());
  return <div>{data.title}</div>;
}
```

#### 2. **在 Client Components 中使用（实验性）**

在客户端组件中，`use` 也可以简化异步数据的管理。

```jsx
import { use } from "react";
function getUserData() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ name: "Alice" }), 1000);
  });
}

export default function Profile() {
  const user = use(getUserData()); // 等待数据完成
  return <div>{user.name}</div>;
}
```

#### 3. **与 Suspense 结合**

当 Promise 尚未完成时，`use` 会暂停渲染，并显示 `Suspense` 的 fallback。

```jsx
import { Suspense, use } from "react";
async function fetchData() {
  const response = await fetch("/api/data");
  return response.json();
}

function Content() {
  const data = use(fetchData());
  return <div>Data: {data.content}</div>;
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
}
```

### **特点与优势**

1. **同步代码风格：**
   - 通过 `use`，开发者可以像处理同步代码一样处理异步数据。
2. **简化状态管理：**
   - 不需要显式使用 `useState` 和 `useEffect` 管理异步操作状态。
3. **与 Suspense 无缝集成：**
   - 当数据未就绪时，自动触发 Suspense。

### **注意事项**

1. **实验性 API：**
   - `use` 目前是 React 的实验性功能，仅在特定版本（如 React 18+）中有效。
   - 需要开启 `Concurrent Rendering` 才能使用。
2. **只能处理 Promise：**
   - `use` 仅支持捕获标准的 Promise，不支持回调或其他异步模式。
3. **依赖 Suspense：**
   - 必须与 `Suspense` 一起使用，否则无法暂停渲染。

## React 的 Error Boundary功能

React 的 **Error Boundary**（错误边界）是一种用于捕获组件树中渲染错误的机制，它可以防止 JavaScript 错误导致整个应用崩溃。错误边界不会修复错误，但它能捕获错误并提供备用的 UI。

### **关键功能**

1. **捕获错误**：
   - 捕获组件树中子组件的渲染、生命周期方法或构造函数中的 JavaScript 错误。
2. **隔离错误**：
   - 防止错误影响整个应用，只影响出现错误的组件子树。
3. **展示备用 UI**：
   - 在错误发生时显示自定义的错误提示 UI。

### **实现 Error Boundary**

Error Boundary 必须是类组件，因为它依赖生命周期方法。示例代码如下：

```jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // 捕获错误并更新状态
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // 可用于记录错误日志
  componentDidCatch(error, info) {
    console.error("Error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      // 渲染备用 UI
      return <h1>发生错误，请稍后再试。</h1>;
    }
    // 正常渲染子组件
    return this.props.children;
  }
}

export default ErrorBoundary;
```

### **使用 Error Boundary**

将 `ErrorBoundary` 包裹在可能发生错误的组件外层：

```jsx
import ErrorBoundary from "./ErrorBoundary";
import MyComponent from "./MyComponent";

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### **Error Boundary 的特性**

1. **捕获范围**：

   - **捕获**：渲染阶段、生命周期方法、子组件的构造函数中的错误。

   - 不捕获

     ：以下场景无法捕获：

     - 事件处理器中的错误（需手动 try-catch）。
     - 异步代码（如 `setTimeout` 或 `Promise`）。
     - 服务端渲染（SSR）。
     - 错误边界自身抛出的错误。

2. **类组件特有**：

   - 目前只有类组件可以实现错误边界，函数组件无法直接作为错误边界，但可以通过 hooks 和外部库（如 `react-error-boundary`）间接实现类似功能。

### **扩展用法**

#### **1. 显示更详细的错误信息**

```jsx
render() {
  if (this.state.hasError) {
    return (
      <div>
        <h1>发生错误</h1>
        <p>{this.state.error?.toString()}</p>
      </div>
    );
  }
  return this.props.children;
}
```

#### **2. 捕获事件处理器的错误**

事件处理器错误不会被 Error Boundary 捕获，需要手动处理：

```jsx
function MyComponent() {
  const handleClick = () => {
    try {
      throw new Error("按钮出错了！");
    } catch (error) {
      console.error("事件错误:", error);
    }
  };

  return <button onClick={handleClick}>点我出错</button>;
}
```

#### **3. 多个错误边界**

为不同的部分使用独立的错误边界，隔离错误影响：

```jsx
<ErrorBoundary>
  <ComponentA />
</ErrorBoundary>
<ErrorBoundary>
  <ComponentB />
</ErrorBoundary>
```

### **注意事项**

1. **只捕获子组件的错误**：
   - Error Boundary 无法捕获其自身的错误。如果边界组件内部出错，React 会向上查找最近的父边界。
2. **尽量局部化**：
   - 将错误边界限制在特定区域，避免用一个全局边界包裹整个应用。
3. **记录错误**：
   - 在 `componentDidCatch` 中结合日志服务（如 Sentry）记录错误信息，方便排查问题。
