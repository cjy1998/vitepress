# CI/CD

**CI/CD 是持续集成（Continuous Integration）和持续交付 / 部署（Continuous Delivery/Deployment）的简称。**

## 持续集成（Continuous Integration）

- **定义**：持续集成是一种软件开发实践，要求开发团队成员经常集中他们的代码。每次集成都通过自动化构建（包括编译、测试等）来验证，尽早发现集成错误。
- 工作流程：
  - **代码提交**：开发人员频繁的将代码更改提交到版本控制系统（如 Git）中。
  - **自动化构建**：提交触发构建服务器（如 Jenkins、GitLab CI 等）执行构建操作，包括编译代码、运行单元测试、代码检查等。例如，对于一个 Java 项目，构建过程会编译所有的.java 文件为.class 文件，并运行 JUnit 等单元测试框架编写的测试用例。
  - **快速反馈**：如果构建失败或者测试不通过，团队成员会立即收到通知，以便及时修复问题。这有助于保持代码库的健康，减少后期集成问题的复杂性。

## 持续交付（Continuous Delivery）

- **定义：**持续交付是在持续集成的基础上，确保软件可以随时发布到生产环境。它强调的是软件在整个生命周期内都保持可部署的状态。
- **工作流程：**
  - **在持续集成基础上：**在完成代码构建和测试后，持续交付会进一步确保软件通过了更全面的测试，包括集成测试、系统测试等。例如，对于一个 web 应用，会进行不同模块之间的集成测试，确保每个功能模块协同工作正常。
  - **部署准备：**软件的配置管理更加完善，确保在不同环境（开发、测试、生产等）中的配置正确。同时，会准备好部署脚本，以便能够自动化地将软件部部署到目标环境。
  - **手动发布决策：**虽然软件已经准备好发布，但发布过程可能仍然需要人工干预来决定合适的时间点，不过整个发布流程已经高度自动化和标准化。

## 持续部署（Continuous Deployment）

- **定义**：持续部署是持续交付的延伸，是指软件在通过所有的测试和质量检查后，自动部署到生产环境，无需人工干预。
- 工作流程：
  - **全自动化流程**：从代码提交、构建、测试到部署到生产环境，全部是自动化的。例如，在一个采用持续部署的云原生应用开发中，新的代码更改一旦通过了一系列的自动化测试和验证，就会自动地部署到生产环境中的容器集群中。
  - **快速迭代**：允许企业更快地向用户提供新功能和修复问题，快速响应市场变化。

> 如果是一般的项目，一般 CI / CD 是集成在一起， 当我们 Jenkins 检测到 github 的变化，我们就会开始 build，build 完成后，启动镜像，完成部署。

CI/CD 极大地提高了软件开发的效率和质量，缩短了开发周期，降低了软件开发过程中的风险，并且能够更快地响应客户需求和市场变化。

## CI/CD 的主要优势

- 减少人为错误

- 快速交付

- 提高开发效率

- 降低风险

- 持续获得反馈

## 常用的 CI/CD 工具包括：

- Jenkins

- GitLab CI

- GitHub Actions

- Travis CI

- Circle CI

## 安装 Jenkins

服务器使用的阿里云，操作系统是 Ubuntu 22.04。首先需要配置镜像源列表，否则可能会下载失败。

### 1. 配置镜像源

- 查看 Ubuntu 版本使用`lsb_release -a`命令。

- 常用的 Ubuntu 版本代号如下：

  - Ubuntu 22.04：jammy
  - Ubuntu 20.04：focal
  - Ubuntu 18.04：bionic
  - Ubuntu 16.04：xenial

- 常见源：

  - 阿里云

    ```bash
    deb http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse
    deb http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse
    deb http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse
    deb http://mirrors.aliyun.com/ubuntu/ focal-backports main restricted universe multiverse

    # deb-src http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse
    # deb-src http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse
    # deb-src http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse
    # deb-src http://mirrors.aliyun.com/ubuntu/ focal-backports main restricted universe multiverse

    ## Pre-released source, not recommended.
    # deb http://mirrors.aliyun.com/ubuntu/ focal-proposed main restricted universe multiverse
    # deb-src http://mirrors.aliyun.com/ubuntu/ focal-proposed main restricted universe multiverse

    ```

  - 清华源

    ```bash
    deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
    deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
    deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
    deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-security main restricted universe multiverse

    # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal main restricted universe multiverse
    # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-updates main restricted universe multiverse
    # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-backports main restricted universe multiverse
    # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-security main restricted universe multiverse

    ## Pre-released source, not recommended.
    # deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse
    # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ focal-proposed main restricted universe multiverse
    ```

    **将上述源中的`focal`替换为你对应版本的代号即可。**

- 备份原始的软件源文件，以防添加新镜像后出现问题。

  ```bash
  cd /etc/apt
  sudo cp sources.list sources.list.bak
  ```

- 编辑软件源文件

  ```bash
  sudo vim sources.list
  ```

- 更新软件源列表

  ```bash
  sudo apt-get update
  ```

### 2. 安装相关软件

- 安装`openjdk`

  ```bash
  sudo apt-get install openjdk-17-jdk
  ```

- 检查 java 版本

  ```bash
  java - version
  ```

- 添加 Jenkins 存储库

  ```bash
  echo deb http://pkg.jenkins.io/debian binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list
  ```

- 添加 Jenkins 公钥

  ```bash
  curl -fsSL https://pkg.jenkins.io/debian/jenkins.io.key | gpg --dearmor -o /etc/apt/trusted.gpg.d/jenkins.gpg
  ```

- 更新软件包列表

  ```bash
  sudo apt update
  ```

- 安装 Jenkins

  ```bash
  sudo apt install jenkins -y
  ```

### 3. 启动 Jenkins

- 安装完成后，启动 Jenkins 服务并设置为开机自启：

  ```bash
  sudo systemctl start jenkins
  sudo systemctl enable jenkins
  ```

- 检查 Jenkins 状态

  ```bash
  sudo systemctl status jenkins
  ```

  ![Jenkins状态](../../public/Snipaste_2024-10-28_16-03-38.png)

- 访问 Jenkins

  ```bash
  http://your_server_ip:8080
  ```

- 解锁 Jenkins

  首次访问时，需要输入解锁密钥。可以通过以下命令找到密钥：

  ```bash
  sudo cat /var/lib/jenkins/secrets/initialAdminPassword
  ```

  ![解锁密钥](../../public/Snipaste_2024-10-28_16-02-42.png)

- 安装插件，因为是第一次安装不熟悉，所以选择推荐安装。

## Jenkins 集成 GitHub

- 新建 Item，输入项目名称后，勾选 Freestyle project，点击 ok 创建应用。

- 配置 Github 仓库地址，Github 账户私钥，以及分支匹配规则。

![配置Github仓库地址](../../public/Snipaste_2024-10-28_16-18-29.png)

- 配置 Github 仓库地址，选择 SSH。

- Github 账户公钥私钥设置。

  - 生成 SSH 密钥对

    使用以下命令生成新的 SSH 密钥对。请根据提示选择文件路径（默认情况下，密钥将保存在`~/.ssh/id_rsa`），并设置可选的密码短语以增加安全性。

    ```bash
    ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
    ```

  - 按`Enter`键，或自己配置路径和密码。

  - 添加 SSH 公钥到 SSH 代理

    ```bash
    # 启动SSH代理
    eval "$(ssh-agent -s)"

    # 添加私钥
    ssh-add ~/.ssh/id_rsa
    ```

  - 复制 SSH 公钥

    ```bash
    cat ~/.ssh/id_rsa.pub
    ```

  - 在 GitHub 上添加 SSH 公钥

  - 测试连接

    ```bash
    ssh -T git@github.com
    ```

    出现下述消息代表成功：

    > Hi username! You've successfully authenticated, but GitHub does not provide shell access.

- 点击 Credentials 的 Add 按钮，将私钥添加进去。打开后选择 Kind 为 SSH,id 和 description，username 自行填写。最后添加 Private Key，Private Key 就是我们生成的私钥。

  ![SSH](../../public/Snipaste_2024-10-28_16-47-01.png)

- 点击 Credentials 的 Add 按钮，将私钥添加进去。打开后选择 Kind 为 SSH,id 和 description，username 自行填写。最后添加 Private Key，Private Key 就是我们生成的私钥。

## 部署 Nextjs 项目进行测试

- 编写 project build 流程

  继续在 project configure 界面中配置 build steps, 主要是 build 镜像，然后再启动当前容器。

  ```bash
  docker -v
  node -v
  npm -v
  //构建一个标签为jenkins-test的Docker镜像，. 表示Dockerfile在当前目录下
  docker build -t jenkins-test .
  docker stop jenkins-test || true
  docker rm jenkins-test || true
  //创建并运行一个新的Docker容器,-d 表示以分离模式（后台）运行容器
  //-p 3005:80 将容器的80端口映射到宿主机的3005端口
  //jenkins-test:latest 指定要运行的镜像
  docker run -d --name jenkins-test -p 3005:80 jenkins-test:latest
  ```

- 更换 docker 镜像源为国内可用镜像源

  ```bash
  sudo vim  /etc/docker/daemon.json
  ```

  再该文件中添加

  ```bash
  {
    "registry-mirrors": ["https://docker.rainbond.cc","https://hub.xdark.top"]
  }
  ```

  重新加载 json 配置文件：

  ```bash
  sudo systemctl daemon-reload
  ```

  重启 docker 服务：

  ```bash
  sudo systemctl restart docker
  ```

  检查更换的镜像源是否生效：

  ```bash
  docker info
  ```

  如果在输出的日志中**registry-mirrors：**下看到你配置的镜像源，就代表成功了。

- 然后在项目中编写 nginx.conf 和 Dockerfile、.dockerignore

  ```json
  //nginx/nginx.conf
  events {
      worker_connections 1024;
  }

  http {
      include mime.types;
      default_type application/octet-stream;

      sendfile on;
      keepalive_timeout 65;

      server {
      //指定Nginx监听80端口（HTTP）
          listen 80;
          server_name _;

          location / {
      //指定文档根目录为/usr/share/nginx/html，即Nginx将从这个目录提供静态文件。
              root /usr/share/nginx/html;
              index index.html index.htm;
          }

          error_page 500 502 503 504 /50x.html;
          location = /50x.html {
              root /usr/share/nginx/html;
          }
      }
  }
  ```

  ```json
  //Dockerfile
  FROM node:18-alpine AS builder

  WORKDIR /app
  COPY package*.json ./
  RUN npm install

  COPY . .

  RUN npm run build
  # 检查输出目录内容
  RUN ls -al /app/out

  FROM nginx:stable-alpine

  COPY --from=builder /app/out /usr/share/nginx/html
  COPY --from=builder /app/nginx/nginx.conf /etc/nginx/nginx.conf
  # 暴露 Nginx 的默认端口
  EXPOSE 80

  # 启动 Nginx
  CMD ["nginx", "-g", "daemon off;"]
  ```

  ```json
  //.dockerignore
  Dockerfile.dockerignore;
  node_modules;
  npm - debug.log;
  README.md.next.git;
  ```

  可以先在本地使用 Docker 打包试试，没有问题提交代码，在 Jenkins 点击构建，然后访问 http://[ip 地址]:3005，云服务器记得编辑安全组，放行 3005 端口。
