GitHub Actions 是 GitHub 提供的**持续集成和持续交付 (CI/CD) 平台**，允许开发者自动化软件开发工作流程（如构建、测试、部署等）。它直接集成在 GitHub 仓库中，无需依赖第三方工具即可实现自动化操作。

## 核心概念

### 工作流 (Workflow)

- 一个自动化的流程，由 YAML 文件定义（存放在  .github/workflows/  目录下）。
- 可以响应特定事件（如代码推送、Pull Request、定时任务等）。

### 事件 (Event)

- 触发工作流的动作，例如：
  - push（代码推送）
  - pull_request（PR 创建或更新）
  - schedule（定时任务）
  - 手动触发 (workflow_dispatch)。

### 任务 (Job)

- 一个工作流包含多个任务，每个任务由一系列步骤组成。
- 任务可以并行或顺序执行，运行在指定的虚拟机或容器中。

### 步骤 (Step)

- 单个任务中的具体操作，可以是：
  - 运行命令（如  npm install）
  - 使用预定义的操作（如  actions/checkout@v4）。

### 操作 (Action)

- 可重用的代码单元，用于简化流程（如拉取代码、设置 Node.js 环境等）。
- 可以从 GitHub Marketplace 获取现成的 Action。

## 核心功能

### 自动化测试

- 代码提交后自动运行测试，确保代码质量。

### 自动部署

- 将应用部署到服务器、云平台（如 AWS、aliyun）或包仓库（如 npm）。

### 定时任务

- 定期执行清理数据、备份等操作。

### 多环境支持

- 支持 Linux、Windows、macOS 等操作系统。

### 丰富的生态系统

- 数千个预构建的 Action 可直接使用（如 Docker 构建、Slack 通知等）。

## 简单示例

以下是一个工作流文件，在每次代码推送到  main  分支时运行 Node.js 项目的测试：

```css
name: Node.js CI

on:
  push:
    branches: ["main"]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4      # 拉取代码
      - uses: actions/setup-node@v4    # 设置 Node.js 环境
        with:
          node-version: 20
      - run: npm install              # 安装依赖
      - run: npm test                 # 运行测试
```

## **工作流模板**

[GitHub Marketplace: tools to improve your workflow](https://github.com/marketplace)

![image.png](https://imgbed.cj.abrdns.com/file/1758186790530_image.png)
