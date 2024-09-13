# Docker
## Docker Desktop
### 安装
#### 1. 下载
[下载地址](https://www.docker.com/products/docker-desktop)
#### 2. 安装
#### 3. 配置镜像加速
```json
{
  "registry-mirrors": [
    "https://registry.docker-cn.com",
    "https://dockerhub.azk8s.cn",
    "https://mirror.ccs.tencent.com",
    "https://hub-mirror.c.163.com"
  ]
}
```
### 使用
#### 1. 拉取镜像
```shell
docker pull nginx
```