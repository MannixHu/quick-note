# Docker 镜像加速配置

## 方法一：配置 Docker Daemon 镜像加速器（推荐）

配置后，所有 `docker pull` 命令都会自动使用国内镜像源。

### macOS/Windows (Docker Desktop)

1. 打开 Docker Desktop
2. 进入 **Settings** → **Docker Engine**
3. 在 JSON 配置中添加以下内容：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

4. 点击 **Apply & Restart**

### Linux

```bash
# 创建或编辑 daemon.json
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF

# 重启 Docker 服务
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
docker info | grep -A 10 "Registry Mirrors"
```

## 方法二：使用国内镜像仓库（临时方案）

如果无法配置 daemon，可以使用国内镜像仓库地址：

```bash
# MailHog - 使用阿里云镜像（如果可用）
docker pull registry.cn-hangzhou.aliyuncs.com/mailhog/mailhog:latest
docker tag registry.cn-hangzhou.aliyuncs.com/mailhog/mailhog:latest mailhog/mailhog:latest
```

## 验证镜像加速是否生效

```bash
docker pull mailhog/mailhog:latest
# 观察下载速度，如果明显加快说明配置成功
```

## 常用国内镜像源

- 中科大：`https://docker.mirrors.ustc.edu.cn`
- 网易：`https://hub-mirror.c.163.com`
- 百度云：`https://mirror.baidubce.com`
- 阿里云：需要登录后获取个人加速地址
- 腾讯云：需要登录后获取个人加速地址


