# 常用命令

## ssh 连接

```
ssh -p [端口号] [用户名]@[IP地址]

```

## 用户与权限管理

### 切换与确认身份

- 切换到 root

```
sudo -i
```

```
sudo su -

```

- 以 root 身份执行单条命令

```
sudo [command]
```

- 查看当前用户

```
whoami
```

- 查看用户 UID/组信息

```
id [用户名]
```

- 查看当前用户所属组

```
groups
```

### 用户管理

- 修改当前用户密码

```
passwd [用户名]
```

- 新建用户

```
adduser [用户名]
```

- 删除用户(包括家目录)

```
userdel -r 用户名
```

- 把用户加入某个组

```
usermod -aG 组名 用户名
```

- 锁定/解锁用户

```
usermod -L 用户名 # 锁定用户
usermod -U 用户名 # 解锁用户
```

- 切换到其他用户

```
su - 用户名
```

### 登录情况查看

- 查看当前登录用户

```
w
```

- 最近登录记录

```
last
```

## 系统管理

- 查看内核和系统信息

```
uname -a
```

- 查看系统版本

```
cat /etc/os-release
```

- 查看运行时间与负载

```
uptime
```

- 查看主机名

```
hostname
```

- 查看磁盘使用情况

```
df -h
```

- 查看某目录大小

```
du -sh 目录路径
```

- 查看内存使用情况

```
free -h
```

- 实时查看 cpu/内存/进程

```
top
```

- 更友好的查看进程

```
htop
```

- 查看 cup 信息

```
lscpu
```

- 查看磁盘结构

```
lsblk
```

- 查看系统时间与时区

```
date
```

```
timedatectl
```

- 查看系统上次启动时间

```
who -b
```

## 文件与目录操作

- 列出目录

```
ls -lh
```

- 切换目录

```
cd 目录路径
```

- 查看当前路径

```
pwd
```

- 创建目录

```
mkdir -p 目录名
```

- 删除目录

```
rm -rf 目录
```

- 复制文件或者目录

```
cp -r 源目录/文件 目标目录/文件
```

- 移动/重命名

```
mv 源目录/文件 目标目录/文件
```

- 新建空文件

```
touch 文件名
```

### 文件内容查看

- 查看文件内容

```
cat 文件名
```

- 分页查看

```
less 文件名
```

- 查看文件开头/结尾

```
head -n 10 文件名
tail -n 10 文件名
```

- 查找文件

```
find 目录 -name "文件名"
```

- 搜索文件内容

```
grep "搜索内容" 文件名
```

## 网络与端口

- 测试连通性

```
ping 目标IP
```

- 查看 http 响应头

```
curl -I url
```

- 下载文件

```
wget url
```

- 查看端口占用

```
ss -tulnp
```

- DNS 查询

```
dig  域名
```

- 查看网络接口

```
ip addr
```

- 查看公网 ip

```
curl ifconfig.me
```

### 端口测试

- 测试端口是否开放

```
nc -zv 主机 端口
```

- 简单连接测试

```
telnet 主机 端口
```

## 软件管理

### Debian/Ubuntu

```
apt update
apt upgrade -y
apt install 软件名
apt remove 软件名
apt autoremove -y
dpkg -l
apt search 软件名
```

### CentOS/RHEL

```
yum update -y
yum install 软件名
yum remove 软件名
rpm -qa
yum search 软件名
```

## 服务与进程管理

- 查看服务状态

```
systemctl status 服务名
```

- 启动/停止/重启服务

```
systemctl start 服务名
systemctl stop 服务名
systemctl restart 服务名
```

- 开机自启/取消自启

```
systemctl enable 服务名
systemctl disable 服务名
```

- 查看进程

```
ps aux
```

- 结束进程

```
kill -9 进程号
```
