### 项目配置
详情请看: https://juejin.cn/post/7236383034559529017

### React18新特性
## 1. startTransition
- 作用: 用于标记低优先级的更新
- 用法: 
  ```js
  import { startTransition } from 'react';
  startTransition(() => {
    // 低优先级的更新
  });
  ```
- 场景: 当用户进行交互时，需要更新大量数据，此时可以使用startTransition来标记这些更新为低优先级，从而避免阻塞用户交互。

## 2. useId
- 作用: 生成唯一的id
- 用法: 
  ```js
  import { useId } from 'react';
  const id = useId();
  ```
- 场景: 在组件中需要生成唯一的id时，可以使用useId来避免id冲突。

## 3. Server Components
- 作用: 在服务器端渲染组件
- 用法: 
  ```jsx
  import { serverComponentRenderer } from 'react-server-dom-webpack';
  ```
- 场景: 在服务器端渲染React应用时，可以使用Server Components来提高性能和可维护性。

## 4. Server Components
- 作用: 在服务器端渲染组件
- 用法: 
  ```jsx
  import { serverComponentRenderer } from 'react-server-dom-webpack';
  ```
- 场景: 在服务器端渲染React应用时，可以使用Server Components来提高性能和可维护性。

### 常见Hook
## 1. useState
- 作用: 用于在函数组件中添加状态
- 用法: 
  ```js
  import { useState } from 'react';
  const [state, setState] = useState(initialState);
  ```
- 场景: 当需要在函数组件中管理状态时，可以使用useState。

## 2. useEffect
- 作用: 用于在函数组件中执行副作用操作
- 用法: 
  ```js
  import { useEffect } from 'react';
  useEffect(() => {
    // 副作用操作
  }, [dependencies]);
  ```
- 场景: 当需要在函数组件中执行副作用操作时，可以使用useEffect。

## 3. useContext
- 作用: 用于在函数组件中访问上下文
- 用法: 
  ```js
  import { useContext } from 'react';
  const context = useContext(MyContext);
  ```
- 场景: 当需要在函数组件中访问上下文时，可以使用useContext。

## 4. useReducer
- 作用: 用于在函数组件中管理复杂的状态逻辑
- 用法: 
  ```js
  import { useReducer } from 'react';
  const [state, dispatch] = useReducer(reducer, initialState);
  ```
- 场景: 当需要在函数组件中管理复杂的状态逻辑时，可以使用useReducer。

## 5. useCallback
- 作用: 用于在函数组件中缓存函数
- 用法: 
  ```js
  import { useCallback } from 'react';
  const memoizedCallback = useCallback(() => {
    // 函数逻辑
  }, [dependencies]);
  ```
- 场景: 当需要在函数组件中缓存函数时，可以使用useCallback。

## 6. useMemo
- 作用: 用于在函数组件中缓存计算结果
- 用法: 
  ```js
  import { useMemo } from 'react';
  const memoizedValue = useMemo(() => {
    // 计算逻辑
  }, [dependencies]);
  ```
- 场景: 当需要在函数组件中缓存计算结果时，可以使用useMemo。

## 7. useRef
- 作用: 用于在函数组件中访问DOM元素或保存可变值
- 用法: 
  ```js
  import { useRef } from 'react';
  const refContainer = useRef(initialValue);
  ```
- 场景: 当需要在函数组件中访问DOM元素或保存可变值时，可以使用useRef。

## 8. useImperativeHandle
- 作用: 用于在函数组件中自定义暴露给父组件的实例值
- 用法: 
  ```js
  import { useImperativeHandle } from 'react';
  useImperativeHandle(ref, () => ({
    // 暴露给父组件的实例值
  }), [dependencies]);
  ```
- 场景: 当需要在函数组件中自定义暴露给父组件的实例值时，可以使用useImperativeHandle。

## 9. useLayoutEffect
- 作用: 用于在函数组件中执行副作用操作，类似于componentDidMount和componentDidUpdate，但在所有DOM变更后同步触发
- 用法: 
  ```js
  import { useLayoutEffect } from 'react';
  useLayoutEffect(() => {
    // 副作用操作
  }, [dependencies]);
  ```
- 场景: 当需要在函数组件中执行副作用操作，并且需要在所有DOM变更后同步触发时，可以使用useLayoutEffect。

## 10. useDebugValue
- 作用: 用于在React DevTools中显示自定义hook的标签
- 用法: 
  ```js
  import { useDebugValue } from 'react';
  useDebugValue(value);
  ```
- 场景: 当需要在React DevTools中显示自定义hook的标签时，可以使用useDebugValue。

### 项目场景代码

## 1 组件传参
- 父组件向子组件传参
  ```js
  // 父组件
  <ChildComponent prop1={value1} prop2={value2} />

  // 子组件
  const ChildComponent = (props) => {
    const { prop1, prop2 } = props;
    // 使用 prop1 和 prop2
  };
  ```
- 子组件向父组件传参
  ```js
  // 子组件
  const ChildComponent = (props) => {
    const { onChildClick } = props;
    const handleClick = () => {
      onChildClick('child value');
    };
    return <button onClick={handleClick}>Click me</button>;
  };

  // 父组件
  const ParentComponent = () => {
    const handleChildClick = (value) => {
      console.log(value); // 输出 'child value'
    };
    return <ChildComponent onChildClick={handleChildClick} />;
  };
  ```
- 父组件向子组件传参，子组件向父组件传参
  ```js
  // 父组件
  const ParentComponent = () => {
    const handleChildClick = (value) => {
      console.log(value); // 输出 'child value'
    };
    return <ChildComponent onChildClick={handleChildClick} />;
  };

  // 子组件
  const ChildComponent = (props) => {
    const { onChildClick } = props;
    const handleClick = () => {
      onChildClick('child value');
    };
    return <button onClick={handleClick}>Click me</button>;
  };
  ```

## 2 事件处理
- 事件处理函数
  ```js
  const handleClick = (event) => {
    console.log('Button clicked');
  };
  ```

## 3 条件渲染
- 条件渲染
  ```js
  const isTrue = true;
  return (
    <div>
      {isTrue && <p>This will only be rendered if isTrue is true</p>}
    </div>
  );
  ```

## 4 列表渲染
- 列表渲染
  ```js
  const items = ['Item 1', 'Item 2', 'Item 3'];
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
  ```

## 5 状态提升
作用: 当多个组件需要共享状态时，可以将状态提升到它们共同的父组件中，并通过props将状态和修改状态的方法传递给子组件。
- 状态提升
  ```js
  const [sharedState, setSharedState] = useState('');

  const ParentComponent = () => {
    return (
      <div>
        <ChildComponent1 sharedState={sharedState} />
        <ChildComponent2 sharedState={sharedState} />
      </div>
    );
  };

  const ChildComponent1 = (props) => {
    const { sharedState } = props;
    }

  const ChildComponent2 = (props) => {
    const { sharedState } = props;
  };

  ```
  ## 受控组件和非受控组件
  - 受控组件
    ```js
    const [inputValue, setInputValue] = useState('');

    const handleChange = (event) => {
      setInputValue(event.target.value);
    };

    return (
      <input type="text" value={inputValue} onChange={handleChange} />
    );
    ```

  - 非受控组件
    ```js
    return (
      <input type="text" defaultValue="Hello" />
    );
    ```

##  高阶组件
作用: 高阶组件是一个函数，它接受一个组件作为参数，并返回一个新的组件。高阶组件可以用于代码复用、逻辑抽象和组件增强。
- 高阶组件
  ```js
  const withHOC = (WrappedComponent) => {
    return (props) => {
      return (
        <div>
          <WrappedComponent {...props} />
        </div>
      );
    };
  };

  const MyComponent = (props) => {
    return <div>{props.message}</div>;
  };

  const EnhancedComponent = withHOC(MyComponent);

  <EnhancedComponent message="Hello, World!" />
  ```

##  自定义Hook
作用: 自定义Hook是一个函数，它使用React的Hook API来封装可重用的逻辑。自定义Hook可以用于状态管理、副作用处理和组件间通信。
- 自定义Hook
  ```js
  const useCustomHook = () => {
    const [count, setCount] = useState(0);

    const increment = () => {
      setCount(count + 1);
    };

    return { count, increment };
  };

  const MyComponent = () => {
    const { count, increment } = useCustomHook();

    return (
      <div>
        <p>Count: {count}</p>
        <button onClick={increment}>Increment</button>
      </div>
    );
  };
  ```

