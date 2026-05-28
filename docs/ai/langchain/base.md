![image.png](https://imgbed.cj.abrdns.com/file/1779775339088_image.png)

## 项目初始化

1. 使用`bun`创建一个空项目

```bash
bun init
```

2. 安装依赖

```bash
 pnpm  add zod langchain @langchain/openai @langchain/core
```

3. 创建环境变量 `.env`

```bash
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_API_BASE_URL=
```

4. 校验环境变量
```ts
// types/env.ts
import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_BASE_URL: z.url().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1),
});

// 解析环境变量
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    z.treeifyError(parsedEnv.error),
  );
  process.exit(1);
}

export const settings = {
  openai_api_base_url: parsedEnv.data.OPENAI_API_BASE_URL,
  openai_api_key: parsedEnv.data.OPENAI_API_KEY,
  openai_model: parsedEnv.data.OPENAI_MODEL,
};

```
在程序入口文件引入
```ts
// index.ts
import "./types/env.ts";  
```

## 模型抽象层ChatOpenAI

### ChatOpenAI的简单使用
[详细参数与方法](https://reference.langchain.com/javascript/langchain-openai/ChatOpenAI)
```ts
// src/chat.ts
export const chatOpenAI = new ChatOpenAI({
  model: settings.openai_model,
  apiKey: settings.openai_api_key,
  // 随机性和创造性 越接近0越保守
  temperature: 0.7,
  // 超时时间
  timeout: 60000,
  // 最大重试次数
  maxRetries: 3,
  // 最大令牌数
  maxTokens: 4096,
  // 配置
  configuration: {
    baseURL: settings.openai_api_base_url,
  },
});
export default async function main() {
  const result = await chatOpenAI.invoke("你好");
  console.log(result);
}
```
返回接口是一个AIMessage
[详细参数](https://reference.langchain.com/javascript/langchain/browser/AIMessage)
```json
AIMessage {
  "id": "chatcmpl-e6c0d8d7-6600-94c1-a857-a1a1bb56208d",
  "content": "你好！很高兴见到你。有什么我可以帮你的吗？",
  "additional_kwargs": {
    "reasoning_content": ""
  },
  "response_metadata": {
    "tokenUsage": {
      "promptTokens": 10,
      "completionTokens": 13,
      "totalTokens": 23
    },
    "finish_reason": "stop",
    "model_provider": "openai",
    "model_name": "kimi-k2.6"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "output_tokens": 13,
    "input_tokens": 10,
    "total_tokens": 23,
    "input_token_details": {
      "cache_read": 0
    },
    "output_token_details": {}
  }
}
```
![image.png](https://imgbed.cj.abrdns.com/file/1779775724897_image.png)

## Message

![image.png](https://imgbed.cj.abrdns.com/file/1779776948268_image.png)

### SystemMessage vs HumanMessage vs AIMessage

它们都继承自 `BaseMessage`，核心区别在于 **角色定位** 和 **对模型行为的控制力**：

| | `SystemMessage` | `HumanMessage` |
|---|---|---|
| **角色** | 系统指令/设定 | 用户输入/提问 |
| **作用** | 定义 AI 的行为规则、人格、约束 | 提出具体问题或需求 |
| **谁说的** | 开发者（不是最终用户） | 最终用户 |
| **模型对待方式** | 视为不可违背的指令，优先级最高 | 视为需要回应的内容 |
| **典型位置** | 消息列表的开头，通常只有一条 | 紧随 SystemMessage 之后，可多条 |

结合代码来理解：

```ts
const messages = [
  // 1️⃣ SystemMessage：设定 AI 的"人设"和行为规则
  new SystemMessage(
    "你是一个代码助手，每次回答后，都需要提示用户，'该回答由AI产生，请仔细检查！'"
  ),
  // 2️⃣ HumanMessage：用户的实际提问
  new HumanMessage("列举一下ts中不经常用到的方法或者API"),
];
```

- **SystemMessage** 告诉模型："你是代码助手" + "每次回答后必须加免责提示"——这是**强约束**，模型会在整个对话中遵守。
- **HumanMessage** 是用户的具体问题，模型会据此生成回答内容。

简单类比——把模型想象成一个客服：

- `SystemMessage` = **公司给客服的培训手册**："你是技术客服，回答完必须说'仅供参考'"
- `HumanMessage` = **客户打来的电话**："TypeScript 有哪些冷门 API？"

客服会按照手册的规则来回答客户的问题，但手册本身不是客户看到的回答内容。

`AIMessage` 代表**模型的历史回复**。在多轮对话中，消息列表通常是这样的结构：

```ts
const messages = [
  new SystemMessage("你是一个代码助手..."),   // 系统设定
  new HumanMessage("第一个问题"),              // 第1轮 - 用户
  new AIMessage("第一个回答"),                 // 第1轮 - AI
  new HumanMessage("第二个问题"),              // 第2轮 - 用户
];
```

这样模型就能理解完整的对话上下文，实现多轮对话。

除了以上三种，LangChain 还提供了其他类型的消息，如 `FunctionMessage` 和 `ToolMessage`，用于处理函数调用和工具使用场景。

也支持字典模式`{ role: "system", content: "你是一个代码助手..." }`


### 聊天模式

1. 多回合对话

    聊天模型其实并不会记住之前的消息，需要在每次对话中传递完整的消息列表。

    ![image.png](https://imgbed.cj.abrdns.com/file/1779783815832_image.png)

    ```ts
  
      import { createModel } from "../utils/index.ts";
      import { AIMessage, HumanMessage, SystemMessage } from "langchain";
      
      export default async function multiTurn() {
        const baseMessages: (AIMessage | HumanMessage | SystemMessage)[] = [
          new SystemMessage("你是个海盗。所有问题都要用'Oh！Man'开头回答。"),
        ];
      
        const model = createModel();
      
        async function chatLoop() {
          // bun的prompt函数
          const userInput = prompt(
            `🧠：我是你的ai助手，你有什么想问的吗？（直接回车退出）：\n`,
          );
          if (!userInput || !userInput.trim()) {
            console.log("👋 对话结束");
            return;
          }
      
          baseMessages.push(new HumanMessage(userInput));
          const result = await model.invoke(baseMessages);
          console.log(`🧠: ${result.content}\n`);
          baseMessages.push(new AIMessage(result.content));
          // 递归：继续下一轮对话
          await chatLoop();
        }
      
        await chatLoop();
      }

    ```
2. 保持上下文
3. 流式输出
    ```ts
      import { createModel } from "../utils/index.ts";
      import { AIMessage, HumanMessage, SystemMessage } from "langchain";
      
      export default async function streaming() {
        const model = createModel();
        const messages = [
          new SystemMessage("你是一个温柔的人？"),
          new HumanMessage(
            "对比一下python、java、go,对比元素需要加入中国国内招聘市场的岗位数量、热度",
          ),
        ];
        const result = await model.stream(messages);
        for await (const chunk of result) {
          const content = typeof chunk.content === "string" ? chunk.content : "";
          //这是Node.js / Bun 内置的进程 I/O API，作用是把内容直接写入终端（标准输出），不带换行符。
          process.stdout.write(content);
        }
      }

    ```
4. 调整行为

### 流式输出深入理解

#### `process.stdout.write` 类型报错与语法说明

`chunk.content` 的类型定义是 `string | (ContentBlock | Text)[]`，TypeScript 不允许直接把可能是数组的值传给 `process.stdout.write()`。

修复方式：先做类型收窄，只写入字符串部分。

```ts
for await (const chunk of result) {
  const content = typeof chunk.content === "string" ? chunk.content : "";
  process.stdout.write(content);
}
```

`process.stdout.write(data)` 是 **Node.js / Bun 内置的进程 I/O API**，作用是把内容直接写入终端（标准输出），**不带换行符**。

| | `process.stdout.write()` | `console.log()` |
|---|---|---|
| **换行** | 不换行 | 自动加 `\n` |
| **性能** | 更底层，更快 | 内部调用 `.write()` + 格式化 |
| **适用场景** | 流式逐字输出、进度条 | 普通日志打印 |

在流式输出中，AI 的回复是一块一块（chunk）回来的。用 `process.stdout.write` 能实现**打字机效果**，所有 chunk 在同一行拼接显示；如果用 `console.log`，每一块都会换行。

#### `for await...of` 与异步迭代器

`for await...of` 是遍历**异步可迭代对象（AsyncIterable）**的语法。

```ts
const result = await model.stream(messages);
for await (const chunk of result) {
  process.stdout.write(content);
}
```

JavaScript 引擎会自动把它展开成类似这样的代码：

```ts
const iterator = result[Symbol.asyncIterator]();

while (true) {
  const { value, done } = await iterator.next();
  if (done) break;
  process.stdout.write(value.content);
}
```

`next()` 立即返回一个 **Promise**，不会阻塞主线程。但 Promise 内部的网络请求可能还没完成。**真正的"暂停"是 `await` 造成的**：

1. `await iterator.next()` 遇到 pending Promise，**把当前函数的执行权交还给事件循环**
2. 当模型服务端推送新的 chunk 过来，Promise resolve，`await` 恢复执行
3. 循环体执行完，再次 `await iterator.next()`，重复直到 `done: true`

| | 同步 `Symbol.iterator` | 异步 `Symbol.asyncIterator` |
|---|---|---|
| `next()` 返回 | `{ value, done }` | `Promise<{ value, done }>` |
| 数据等待 | 立即拿到，CPU 计算 | 需要 I/O（网络/文件） |
| 语法 | `for...of` | `for await...of` |
| 是否会"暂停" | 不会 | 会（`await` Promise） |

#### 流式输出时收集完整内容

可以边流边拼接到一个变量中，循环结束后就得到了完整回答：

```ts
let fullContent = "";

for await (const chunk of result) {
  const content = typeof chunk.content === "string" ? chunk.content : "";
  process.stdout.write(content); // 实时输出到终端
  fullContent += content;        // 同步拼接到完整字符串
}

console.log("\n--- 完整内容 ---");
console.log(fullContent);
```

两者不冲突：流式体验保留，完整内容也能拿到。常见用途包括做二次处理、计算 token 数、保存到数据库等。
### token使用追踪

#### usage收集的两种方式

1. 非流式

```ts
import { createModel } from "../utils/index";

export default async function trackTokenUsage() {
  const model = createModel({ modelName: "qwen3.7-max-2026-05-17" });
  const result = await model.invoke("TUI框架是什么？");
  const usage = result.usage_metadata;
  console.log(`\n 输入token: ${usage?.input_tokens}`);
  console.log(`\n 输出token: ${usage?.output_tokens}`);
  console.log(`\n 总token: ${usage?.total_tokens}`);
}
```

2. 流式
一般在最后一个chunk返回usage
```ts
import { createModel } from "../utils/index";
import { AIMessageChunk } from "@langchain/core/messages";

export default async function trackTokenUsage() {
  const model = createModel({ modelName: "qwen3.7-max-2026-05-17" });
  let finalChunk: AIMessageChunk | undefined;
  const result = await model.stream("TUI框架是什么？");
  for await (const chunk of result) {
    process.stdout.write(chunk.content as string);
    finalChunk = chunk;
  }
  const usage = finalChunk?.usage_metadata;
  console.log(`\n 输入token: ${usage?.input_tokens}`);
  console.log(`\n 输出token: ${usage?.output_tokens}`);
  console.log(`\n 总token: ${usage?.total_tokens}`);
}
```
#### 降低成本的简单方法
1. 使用`maxTokens`限制响应长度
2. 压缩对话记录
```ts
const recentMessages = messages.slice(-10);
const response = await model.invoke(recentMessages);
```
## Templates

### Messages vs Templates

```ts
  import { createModel } from "../utils/index";
  import { HumanMessage, SystemMessage } from "langchain";
  import { ChatPromptTemplate } from "@langchain/core/prompts";
  
  export default async function messagesVsTemplates() {
    const model = createModel();
    //messages
    const messages = [
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage("把今天天气怎么样翻译成英文?"),
    ];
    const result = await model.invoke(messages);
    console.log(`messages result: ${result.content}`);
    // templates
    const template = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful translator."],
      ["human", "Translate '{text}' to {language}"],
    ]);
    const templateChain = template.pipe(model);
    const templateResult = await templateChain.invoke({
      text: "今天天气怎么样",
      language: "日语",
    });
    console.log(`template result: ${templateResult.content}`);
  }

```
| | `Messages` | `Templates` |
|---|---|---|
| **本质** | 手动拼接，硬编码 | 可复用的"模板函数" |
| **变量替换** | 不支持（字符串拼接 | 支持 `{变量名}` 插值 |
| **复用性** | 差，每次写一套 | 好，一次定义多处调用 |
| **适合场景** | Agent、动态工作流、多步推理、工具集成 | RAG、复用提示、变量替换、一致性 |
| **链式调用** | 不行 | 支持 `.pipe(model) |

### pip

.pipe()` 就像管道符 `|`，把前一个组件的输出作为后一个组件的输入。链一旦建好，你就把它当**一个整体**来调用，不需要手动处理中间转换。

```ts
const template = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful translator."],
  ["human", "Translate '{text}' to {language}"],
]);

// 用 .pipe() 把 template 和 model 串联成链
const templateChain = template.pipe(model);

```
现在 `templateChain` 是一个**统一的可调用对象**，可以直接 `.invoke()`：

```ts
const result = await templateChain.invoke({
  text: "今天天气怎么样",
  language: "英文",
});
```
为什么叫"可调用的链"？

`.pipe()` 返回的是 `Runnable` 对象，它有一套统一的调用接口：

| 方法 | 作用 |
|---|---|
| `.invoke(input)` | 单次调用 |
| `.stream(input)` | 流式输出 |
| `.batch(inputs)` | 批量调用 |
| `.pipe(next)` | 继续拼接下一个组件 |

链可以继续拼接

```ts
import { StringOutputParser } from "@langchain/core/output_parsers";

// template → model → outputParser
const templateChain = template
  .pipe(model)
  .pipe(new StringOutputParser()); // 把 AIMessage 转成纯字符串

const text = await templateChain.invoke({
  text: "你好",
  language: "英文",
});
console.log(text); // 纯字符串，不是 AIMessage 对象
```

### ChatPromptTemplate 与 PromptTemplate

两者的核心区别在于**输出格式**和**目标模型类型**：

| | `ChatPromptTemplate` | `PromptTemplate` |
|---|---|---|
| **输出类型** | `BaseMessage[]`（消息数组） | `string`（纯字符串） |
| **目标模型** | **聊天模型**（Chat Models）如 gpt-4, ChatOpenAI | **文本补全模型**（LLMs）如 text-davinci-003 |
| **能否设置 System 角色** | ✅ 可以，明确区分 system/human/ai | ❌ 不行，只有一个字符串模板 |
| **现代推荐度** | ⭐ **首选**，所有聊天场景都用它 | 仅用于特定旧模型或纯字符串场景

```ts
  import { createModel } from "../utils";
  import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
  export default async function TemplateFormat() {
    // ChatPromptTemplate
    const chatPrompt = ChatPromptTemplate.fromMessages([
      {
        role: "system",
        content: "你是一个以{style}风格并用{language}回答问题的{role}",
      },
      {
        role: "human",
        content: "{question}",
      },
    ]);
    const model = createModel();
    const result = await chatPrompt.pipe(model).invoke({
      role: "pirate",
      style: "dramatic",
      language: "中文",
      question: "什么是 TypeScript?",
    });
    console.log(result.content);
  
    console.log("\n2️⃣  PromptTemplate:\n");
    // PromptTemplate
    const stringTemplate = PromptTemplate.fromTemplate(
      "用{style}风格写一段{topic}的开头，用{language}回答",
    );
    const prompt = await stringTemplate.format({
      style: "幽默",
      language: "中文",
      topic: "今天周三",
    });
  
    console.log(prompt + "\n");
  
    const result2 = await model.invoke(prompt);
    console.log(result2.content);
  }

```
| | `.format()` | `.pipe(model).invoke()` |
|---|---|---|
| **做什么** | 仅渲染模板 | 渲染模板 + 调用模型 |
| **返回值** | `string` 或 `BaseMessage[]` | `AIMessage`（模型回复） |
| **消耗 Token** | ❌ 不消耗 | ✅ 消耗 |
| **灵活性** | 高，可以拿到 prompt 做其他事 | 低，直接出结果 |
| **代码量** | 需要再写一行 `model.invoke(prompt)` | 一步完成

什么时候用 `.format()`？

想**查看、调试或二次处理**生成的 prompt 时：

```ts
const prompt = await template.format({...});
console.log("实际发给模型的内容：", prompt); // 调试
await saveToDB(prompt);                      // 存日志
const result = await model.invoke(prompt);   // 再手动调用
```