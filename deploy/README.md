# 服务器 + FRPS 部署指南

## 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CI/CD 流程                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────┐    git push tag    ┌─────────────────┐                       │
│   │ 开发者    │ ─────────────────> │  GitHub Repo    │                       │
│   └──────────┘                     └────────┬────────┘                       │
│                                             │                                │
│                                             │ trigger                        │
│                                             ▼                                │
│                                    ┌─────────────────┐                       │
│                                    │ GitHub Actions  │                       │
│                                    │  (Build Image)  │                       │
│                                    └────────┬────────┘                       │
│                                             │                                │
│                          ┌──────────────────┼──────────────────┐             │
│                          │                  │                  │             │
│                          ▼                  ▼                  │             │
│                 ┌─────────────────┐ ┌─────────────────┐        │             │
│                 │  GHCR Registry  │ │   SSH Deploy    │        │             │
│                 │  (存储镜像)      │ │  (via FRPS)     │        │             │
│                 └────────┬────────┘ └────────┬────────┘        │             │
│                          │                   │                  │             │
└──────────────────────────┼───────────────────┼──────────────────┘             │
                           │                   │                                │
┌──────────────────────────┼───────────────────┼──────────────────────────────┐
│                          │    网络拓扑        │                              │
├──────────────────────────┼───────────────────┼──────────────────────────────┤
│                          │                   │                              │
│   ┌──────────────────────┼───────────────────┼────────────────────────┐     │
│   │                      │      公网          │                        │     │
│   │                      │                   │                        │     │
│   │                      ▼                   ▼                        │     │
│   │              ┌───────────────────────────────────┐                │     │
│   │              │         VPS (公网服务器)           │                │     │
│   │              │  ┌─────────────────────────────┐  │                │     │
│   │              │  │        FRPS Server          │  │                │     │
│   │              │  │  - TCP 端口: 7000 (控制)     │  │                │     │
│   │              │  │  - TCP 端口: 6000 (SSH转发)  │  │                │     │
│   │              │  │  - HTTP 端口: 80 (Web转发)   │  │                │     │
│   │              │  └─────────────────────────────┘  │                │     │
│   │              │  ┌─────────────────────────────┐  │                │     │
│   │              │  │    Nginx (可选, HTTPS)      │  │                │     │
│   │              │  │  - 443 -> localhost:80      │  │                │     │
│   │              │  └─────────────────────────────┘  │                │     │
│   │              └───────────────┬───────────────────┘                │     │
│   │                              │                                    │     │
│   └──────────────────────────────┼────────────────────────────────────┘     │
│                                  │ FRP Tunnel                               │
│   ┌──────────────────────────────┼────────────────────────────────────┐     │
│   │                              │      内网                           │     │
│   │                              ▼                                    │     │
│   │              ┌───────────────────────────────────┐                │     │
│   │              │       内网服务器 (运行 Docker)     │                │     │
│   │              │  ┌─────────────────────────────┐  │                │     │
│   │              │  │        FRPC Client          │  │                │     │
│   │              │  │  - 连接 VPS:7000            │  │                │     │
│   │              │  │  - 暴露 SSH (22->6000)      │  │                │     │
│   │              │  │  - 暴露 HTTP (3366->80)     │  │                │     │
│   │              │  └─────────────────────────────┘  │                │     │
│   │              │  ┌─────────────────────────────┐  │                │     │
│   │              │  │         Docker              │  │                │     │
│   │              │  │  ┌───────────────────────┐  │  │                │     │
│   │              │  │  │   quick-note (App)    │  │  │                │     │
│   │              │  │  │   Port: 3366          │  │  │                │     │
│   │              │  │  └───────────────────────┘  │  │                │     │
│   │              │  │  ┌───────────────────────┐  │  │                │     │
│   │              │  │  │   PostgreSQL (DB)     │  │  │                │     │
│   │              │  │  │   Port: 5432          │  │  │                │     │
│   │              │  │  └───────────────────────┘  │  │                │     │
│   │              │  └─────────────────────────────┘  │                │     │
│   │              └───────────────────────────────────┘                │     │
│   └──────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户访问流程                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────┐  HTTPS   ┌─────────┐  HTTP    ┌─────────┐  HTTP   ┌────────┐ │
│   │  用户     │ ───────> │  VPS    │ ───────> │  FRPS   │ ──────> │ 服务器  │ │
│   │  浏览器   │ <─────── │  Nginx  │ <─────── │ Tunnel  │ <────── │  App   │ │
│   └──────────┘          └─────────┘          └─────────┘         └────────┘ │
│                                                                              │
│   your-domain.com:443 -> VPS:443 -> FRPS:80 -> 内网服务器:3366              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 工作原理

### 1. CI/CD 流程 (Tag 触发)

```
开发者本地                    GitHub                       内网服务器
   │                           │                             │
   │  git tag v1.0.0          │                             │
   │  git push origin v1.0.0  │                             │
   │ ─────────────────────────>│                             │
   │                           │                             │
   │                           │  触发 GitHub Actions        │
   │                           │  ┌─────────────────────┐    │
   │                           │  │ 1. checkout 代码     │    │
   │                           │  │ 2. build Docker     │    │
   │                           │  │ 3. push to GHCR     │    │
   │                           │  │ 4. SSH 到内网服务器  │────│───> 拉取镜像
   │                           │  │    (via FRPS)       │    │     重启容器
   │                           │  └─────────────────────┘    │     数据库迁移
   │                           │                             │
```

### 2. FRPS 内网穿透原理

```
内网服务器 (192.168.1.100)                  VPS (公网: 1.2.3.4)
      │                                            │
      │  FRPC 主动连接 (长连接)                     │
      │ ──────────────────────────────────────────>│
      │                                            │
      │  保持心跳                                   │
      │ <─────────────────────────────────────────>│
      │                                            │
      │                                            │
      │  当有请求到 VPS:6000 (SSH)                 │
      │ <──────────────────────────────────────────│ 外部 SSH 请求
      │  FRPC 转发到 localhost:22                  │
      │                                            │
      │  当有请求到 VPS:80 (HTTP)                  │
      │ <──────────────────────────────────────────│ 用户 HTTP 请求
      │  FRPC 转发到 localhost:3366                │
      │                                            │
```

### 3. GitHub Actions SSH 部署详解

**核心问题：GitHub Actions 如何连接到没有公网 IP 的内网服务器？**

**解决方案：通过 FRPS 隧道转发 SSH 连接**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      GitHub Actions SSH 部署流程                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐                                                         │
│  │ GitHub Actions │                                                         │
│  │ Runner (云端)  │                                                         │
│  └───────┬────────┘                                                         │
│          │                                                                   │
│          │ 1. SSH 连接到 VPS_HOST:VPS_SSH_PORT                              │
│          │    (例如: ssh admin@1.2.3.4 -p 6000)                             │
│          ▼                                                                   │
│  ┌────────────────────────────────────────────────────────┐                 │
│  │                    VPS (公网)                           │                 │
│  │  ┌──────────────────────────────────────────────────┐  │                 │
│  │  │ FRPS Server                                       │  │                 │
│  │  │                                                   │  │                 │
│  │  │ 收到 TCP 连接请求 (端口 6000)                      │  │                 │
│  │  │         │                                         │  │                 │
│  │  │         ▼                                         │  │                 │
│  │  │ 查找配置: 6000 -> 内网服务器:22                    │  │                 │
│  │  │         │                                         │  │                 │
│  │  │         ▼                                         │  │                 │
│  │  │ 2. 通过 FRP 隧道转发流量                          │  │                 │
│  │  └─────────┼─────────────────────────────────────────┘  │                 │
│  └────────────┼────────────────────────────────────────────┘                 │
│               │ FRP 隧道 (长连接)                                             │
│               ▼                                                               │
│  ┌────────────────────────────────────────────────────────┐                 │
│  │                 内网服务器 (192.168.1.100)              │                 │
│  │  ┌──────────────────────────────────────────────────┐  │                 │
│  │  │ FRPC Client                                       │  │                 │
│  │  │                                                   │  │                 │
│  │  │ 收到转发请求                                       │  │                 │
│  │  │         │                                         │  │                 │
│  │  │         ▼                                         │  │                 │
│  │  │ 3. 转发到 localhost:22 (SSH 服务)                 │  │                 │
│  │  └─────────┼─────────────────────────────────────────┘  │                 │
│  │            ▼                                            │                 │
│  │  ┌──────────────────────────────────────────────────┐  │                 │
│  │  │ SSH Server (端口 22)                              │  │                 │
│  │  │                                                   │  │                 │
│  │  │ 认证成功后执行部署脚本:                            │  │                 │
│  │  │ - docker pull ghcr.io/xxx/quick-note:latest      │  │                 │
│  │  │ - docker compose up -d                           │  │                 │
│  │  │ - npx prisma migrate deploy                      │  │                 │
│  │  └──────────────────────────────────────────────────┘  │                 │
│  └────────────────────────────────────────────────────────┘                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**具体步骤说明：**

| 步骤 | 位置 | 说明 |
|------|------|------|
| 1 | GitHub Actions | 使用 `appleboy/ssh-action` 发起 SSH 连接到 `VPS_HOST:VPS_SSH_PORT` |
| 2 | VPS (FRPS) | FRPS 收到 6000 端口连接，通过隧道转发给 FRPC |
| 3 | 内网服务器 (FRPC) | FRPC 收到流量，转发给本地 SSH 服务 (localhost:22) |
| 4 | 内网服务器 (SSH) | SSH 服务验证密钥，执行部署脚本 |

**关键配置对应关系：**

```yaml
# GitHub Actions workflow
- uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.VPS_HOST }}      # VPS 公网 IP: 1.2.3.4
    port: ${{ secrets.VPS_SSH_PORT }}  # FRPS 转发端口: 6000
    username: ${{ secrets.SERVER_USER }}    # 内网服务器用户名
    key: ${{ secrets.SERVER_SSH_KEY }}      # 内网服务器 SSH 私钥
```

```ini
# 内网服务器 frpc.ini
[ssh-server]
type = tcp
local_ip = 127.0.0.1
local_port = 22        # 本地 SSH 端口
remote_port = 6000     # VPS 上暴露的端口 (对应 VPS_SSH_PORT)
```

**简化理解：**
- GitHub Actions 认为自己在连接 `VPS:6000`
- 实际上流量被 FRPS 透明转发到 `内网服务器:22`
- 对于 GitHub Actions 来说，就像直接 SSH 到内网服务器一样

---

## 一、首次配置

### 1. 服务器准备

```bash
# SSH 到服务器，创建部署目录
mkdir -p /docker/quick-note
cd /docker/quick-note

# 复制配置文件
# 将 deploy/docker-compose.prod.yml 和 deploy/.env.example 上传到此目录
cp .env.example .env

# 编辑环境变量
vim .env
```

### 2. FRPC 配置 (内网服务器端)

在 frpc.ini 添加 SSH 转发：

```ini
[ssh-server]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = 6000  # VPS 上的端口，对应 GitHub Secrets 的 VPS_SSH_PORT

[quick-note-http]
type = http
local_port = 3366
custom_domains = your-domain.com
```

### 3. FRPS 配置 (VPS 端)

确保 frps.ini 允许转发：

```ini
[common]
bind_port = 7000
vhost_http_port = 80
```

### 4. GitHub Secrets 配置

在仓库 Settings -> Secrets and variables -> Actions 添加：

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `VPS_HOST` | VPS 公网 IP 或域名 | `123.45.67.89` |
| `VPS_SSH_PORT` | FRPS 转发的 SSH 端口 (对应 frpc.ini 的 remote_port) | `6000` |
| `SERVER_USER` | **内网服务器**用户名 (不是 VPS 用户名!) | `admin` |
| `SERVER_SSH_KEY` | **内网服务器** SSH 私钥 (不是 VPS 私钥!) | `-----BEGIN OPENSSH...` |
| `GHCR_TOKEN` | GitHub PAT (需要 `read:packages` 权限) | `ghp_xxxx` |

**注意：** `SERVER_USER` 和 `SERVER_SSH_KEY` 是内网服务器的凭证，不是 VPS 的！
因为实际 SSH 连接是被 FRPS 转发到内网服务器的。

### 5. 生成 GitHub PAT

1. 访问 https://github.com/settings/tokens
2. Generate new token (classic)
3. 勾选 `read:packages`
4. 复制 token 到 `GHCR_TOKEN`

### 6. 测试 SSH 连接

在本地测试是否能通过 FRPS 连接到内网服务器：

```bash
# 假设 VPS IP 是 1.2.3.4，FRPS 转发端口是 6000
ssh admin@1.2.3.4 -p 6000

# 如果成功，说明：
# 1. FRPS 在 VPS 上正常运行
# 2. FRPC 在内网服务器上正常运行并已连接到 FRPS
# 3. SSH 端口映射正确 (6000 -> 22)
```

---

## 二、部署方式

### 自动部署 (推荐)

```bash
# 打 tag 自动触发
git tag v1.0.0
git push origin v1.0.0

# 或手动触发
# GitHub -> Actions -> Build and Deploy -> Run workflow
```

### 手动部署 (服务器本地)

```bash
cd /docker/quick-note
./deploy.sh v1.0.0
# 或
./deploy.sh latest
```

---

## 三、共享基础服务

如果需要多个项目共用 PostgreSQL 和 Redis，可以先部署共享基础服务：

```bash
# 1. 上传 shared-infra 目录到服务器
mkdir -p /docker/shared-infra
cd /docker/shared-infra

# 2. 配置环境变量
cp .env.example .env
vim .env

# 3. 启动共享服务
docker compose up -d

# 4. (可选) 启动 pgAdmin
docker compose --profile tools up -d
```

然后各项目通过 `shared-network` 网络连接共享服务。

---

## 四、常用命令

```bash
# 查看日志
docker logs -f quick-note

# 查看状态
docker compose -f docker-compose.prod.yml ps

# 重启服务
docker compose -f docker-compose.prod.yml restart

# 进入容器
docker exec -it quick-note sh

# 数据库迁移
docker exec quick-note npx prisma migrate deploy --schema=/app/packages/db/prisma/schema.prisma

# 数据库备份
docker exec shared-postgres pg_dump -U quicknote quicknote > backup_$(date +%Y%m%d).sql
```

---

## 五、域名配置

### 方案 A: VPS Nginx 反向代理

VPS 上配置 nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:80;  # FRPS vhost_http_port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 方案 B: 直接使用 FRPS HTTPS

frps.ini:
```ini
[common]
vhost_https_port = 443
```

---

## 六、故障排查

```bash
# 检查容器状态
docker ps -a

# 检查网络
docker network ls

# 检查镜像
docker images | grep quick-note

# 清理所有
docker compose -f docker-compose.prod.yml down -v
docker system prune -af
```

### 常见问题

**Q: GitHub Actions 部署失败，提示连接超时**
- 检查 VPS 上的 FRPS 是否运行
- 检查内网服务器上的 FRPC 是否连接到 FRPS
- 检查 VPS 防火墙是否允许 6000 端口

**Q: SSH 连接成功但部署脚本执行失败**
- 检查内网服务器上是否安装了 Docker
- 检查 `/docker/quick-note` 目录是否存在
- 检查 `.env` 文件是否配置正确
