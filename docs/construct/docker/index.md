# Docker 配置文件

## 一、Dockerfile

Dockerfile 是一个文本文件，包含了一系列用于构建 Docker 镜像的指令。它允许开发者通过简单的指令集定义镜像的构建过程，实现自动化、可重复的镜像构建。
基本结构
一个典型的 Dockerfile 包含以下部分：

1. 基础镜像定义
2. 维护者信息（可选）
3. 镜像构建指令
4. 容器启动时执行的命令

### 常用指令

#### 基础指令

- FROM：指定基础镜像，AS 是指将这个构建阶段命名为 build (相当于配置开发环境，例如运行前端项目需要 node，后端项目 Java 需要 JDK)
  FROM node:20-alpine3.20 AS build
- LABEL：添加元数据
  LABEL maintainer="your.email@example.com"

#### 构建指令

- RUN：执行命令并创建新的镜像层(相当于开发环境中在终端运行的命令行)
  RUN npm build
- COPY：复制文件/目录到镜像中
  COPY --from=build /app/dist /usr/share/nginx/html
  1. --from=build：指定从名为 "build" 的构建阶段（前一阶段）复制文件，而不是从主机文件系统复制。
  2. /app/dist：这是源路径，指的是在 "build" 阶段容器中的  /app/dist  目录，/app 是使用 WORKDIR /app 指定的根目录
  3. /usr/share/nginx/html：这是目标路径，将文件复制到当前构建阶段的这个目录（这是 Nginx 默认的静态文件服务目录）。
- ADD：类似 COPY，但支持 URL 和解压压缩文件
  ADD https://example.com/file.tar.gz /tmp/
- WORKDIR：设置工作目录
  WORKDIR /app

#### 环境配置

- ARG：构建时的变量
- ARG VITE_APP_BASE_API=/api
- ENV：设置环境变量
- ENV VITE_APP_BASE_API=${VITE_APP_BASE_API}
  注意：一般是打包过程中需要的环境变量这样配置，运行过程中需要的敏感环境变量不可以这样配置，例如数据库密码。数据库密码等敏感数据存储在服务器文件中，使用 docker-compose 指定。
  env_file - /app/config/backend.env

#### 运行时配置

- EXPOSE：声明容器运行时监听的端口
- EXPOSE 8080
- CMD：容器启动时执行的默认命令
- command: ["yarn", "start:prod"]
- ENTRYPOINT：配置容器启动时运行的命令
- ENTRYPOINT ["/bin/bash"]

示例：

```bash
# 构建阶段

FROM node:20-alpine3.20 AS build

# 安装 pnpm

RUN corepack enable && corepack prepare pnpm@latest --activate

# 声明构建参数（可设置默认值）

# ARG VITE_APP_TITLE="管理系统"

# ARG VITE_APP_ENV=production

# ARG VITE_APP_BASE_API=/api

# ARG VITE_BUILD_COMPRESS=gzip


# 将构建参数设置为环境变量（供构建过程使用）

# ENV VITE_APP_TITLE=${VITE_APP_TITLE}

# ENV VITE_APP_ENV=${VITE_APP_ENV}

# ENV VITE_APP_BASE_API=${VITE_APP_BASE_API}

# ENV VITE_BUILD_COMPRESS=${VITE_BUILD_COMPRESS}

# 设置工作目录（当前阶段根目录）
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

#- 将 `/react-ui`（即 `docker build` 的上下文目录）下的 所有文件和子目录（除
#.dockerignore排除的）复制到 镜像的工作目录/app。

COPY . .

RUN pnpm build



# 调试：确认构建输出

RUN echo "构建输出验证:" && \

    ls -l && \

    [ -d "dist" ] && echo "dist 目录存在" || echo "错误: dist 目录不存在!" && \

    ls -l dist

# 最终阶段 - 使用Nginx

FROM nginx:alpine

# 移除默认配置

RUN rm -rf /etc/nginx/conf.d/default.conf

# 复制自定义配置

COPY nginx.conf /etc/nginx/conf.d/default.conf

# 确保目标目录存在

RUN mkdir -p /usr/share/nginx/html



# 复制构建产物 把build阶段的产物  复制到  nginx里面

COPY --from=build /app/dist /usr/share/nginx/html

# 验证文件复制

RUN echo "Nginx 文件验证:" && \

    ls -l /usr/share/nginx/html && \

    ls -l /etc/nginx/conf.d


# 该容器运行在容器内的80端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

```

## 二、docker-compose

Docker Compose 是一个用于定义和运行多容器 Docker 应用程序的工具。允许使用 YAML 文件来配置应用程序的服务，然后通过一个简单的命令就能创建和启动所有服务。
**相当于客户端下载好镜像了需要点击运行，然后需要一些配置，该文件就是配置项。**

```bash
version: "3.8" # 指定使用的 compose 文件版本

services:  # 定义服务

  frontend: # 服务名称

    image: ${ACR_REGISTRY}/${ACR_NAMESPACE}/ui:$TAG  # 使用的镜像

    container_name: frontend-container  # 容器名称

    ports: # 端口映射 把容器内的端口映射到服务器端口

      - "80:80"

    restart: always

  backend:

    image: ${ACR_REGISTRY}/${ACR_NAMESPACE}/server:$TAG

    container_name: backend-container

    ports:

      - "3000:3000"

    volumes:  #数据卷 主机路径:容器路径  相当于数据持久化，把容器中的数据挂载到服务器目录

      - /server/data/backend:/data

    restart: always

    env_file:  # 环境变量

      - /app/config/backend.env

    # 如果镜像中没有启动命令，这里需要明确启动命令

    command: ["yarn", "start:prod"]

```

### 常用配置项

1.  build: 指定构建镜像的 Dockerfile 路径

```bash
    build: ./dir
    build:
      context: ./dir
      dockerfile: Dockerfile-alternate
      args:
        buildno: 1

```

2. ports: 端口映射

```bash
ports:
  - "8000:8000"  # 主机端口:容器端口
  - "5000-5010:5000-5010"  # 端口范围

```

3. volumes: 数据卷

```bash
volumes:
  - /var/lib/mysql  # 匿名卷
  - ./data:/var/lib/mysql  # 主机路径:容器路径
  - db-data:/var/lib/mysql  # 命名卷
```

4. environment: 环境变量

```bash
    environment:
      RACK_ENV: development
      SHOW: 'true'
```

5. networks: 网络配置

```bash
networks:
  front-tier:
    driver: bridge
```

6. 服务依赖

   用于定义服务间启动依赖关系的配置项，它控制服务启动的先后顺序，确保某些服务在其他服务启动之后才启动。

- 控制启动顺序：比如  backend  依赖  db，那么  db  会先启动，backend  后启动。
- 不保证服务已就绪：它只确保依赖的服务容器已运行，但不检查服务是否真正可用（例如 MySQL 可能已启动但尚未完成初始化）。

```bash
depends_on:
  - db
  - redis
```

7. restart: always: 容器重启策略

   当容器意外停止（如进程崩溃、Docker 守护进程重启、系统重启）时，Docker 会自动重新启动该容器。
