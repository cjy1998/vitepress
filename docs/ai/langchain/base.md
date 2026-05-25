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
  //
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
