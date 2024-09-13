# npm相关知识
## 一、npm镜像源查看与切换
镜像源链接切换
```bash
// 全局切换镜像源
npm config set registry http://registry.npm.taobao.org
// 查看镜像源使用状态
npm get registry
// 全局切换官方镜像源
npm config set registry http://www.npmjs.org
```
**使用nrm管理镜像源**
```bash
// 全局下载nrm
npm install -g nrm
// 查看可切换的镜像源
nrm ls
// 切换镜像源 例切换淘宝源
nrm use taobao
//查看当前源
nrm current
//添加源
nrm add <registry> <url>
//例如
nrm add cpm http://192.168.22.11:8888/repository/npm-public/
// 删除源
nrm del <registry>
// 测试源速度
nrm test npm
```
## 二、nvm的使用
1. 下载

    下载地址：`https://github.com/coreybutler/nvm-windows/releases`
打开cmd面板，输入nvm,查看是否安装成功。
2. 常用命令
- nvm arch：显示node是运行在32位还是64位。
- nvm install `<version> [arch]` ：安装node， version是特定版本也可以是最新稳定版本latest。可选参数arch指定安装32位还是64位版本，默认是系统位数。可以添加--insecure绕过远程服务器的SSL。
- nvm list `[available] `：显示已安装的列表。可选参数available，显示可安装的所有版本。list可简化为ls。
- nvm on ：开启node.js版本管理。
- nvm off ：关闭node.js版本管理。
- nvm proxy` [url]` ：设置下载代理。不加可选参数url，显示当前代理。将url设置为none则移除代理。
- nvm node_mirror `[url]` ：设置node镜像。默认是`https://nodejs.org/dist/`。如果不写url，则使用默认url。设置后可至安装目录settings.txt文件查看，也可直接在该文件操作。
- nvm npm_mirror` [url] `：设置npm镜像。`https://github.com/npm/cli/archive/`。如果不写url，则使用默认url。设置后可至安装目录settings.txt文件查看，也可直接在该文件操作。
- nvm uninstall `<version>` ：卸载指定版本node。
- nvm use `[version] [arch]` ：使用制定版本node。可指定32/64位。
- nvm root `[path] `：设置存储不同版本node的目录。如果未设置，默认使用当前目录。
- nvm version ：显示nvm版本。version可简化为v。

## 三、--save、--save-dev、-S、-D的区别
- --save等同于-S（添加到 package.json 文件的 dependencies）
   生产环境中实际运行所需要的依赖包。 
- --save-dev和-D（添加到 package.json 文件的 devDependencies）
   开发过程中所需的工具和库，但是生产环境中不需要。通常用于安装开发工具、测试框架、构建工具等。比如，代码检查工具（如 ESLint）、测试框架（如 Jest）、构建工具（如 Webpack）等。
  