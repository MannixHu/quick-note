#!/bin/bash
# 服务器部署脚本
# 用法: ./deploy.sh [version]
# 示例: ./deploy.sh v1.0.0  或  ./deploy.sh latest

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

VERSION=${1:-latest}
COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Deploying quick-note version: $VERSION"

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "   Please copy .env.example to .env and fill in the values"
    exit 1
fi

# 加载环境变量
source .env

# 登录 GitHub Container Registry (首次需要)
if ! docker images | grep -q "ghcr.io/${GITHUB_REPO}"; then
    echo "📦 Logging in to GitHub Container Registry..."
    echo "   Run: echo \$GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin"
fi

# 拉取最新镜像
echo "📥 Pulling image: ghcr.io/${GITHUB_REPO}:${VERSION}"
docker pull "ghcr.io/${GITHUB_REPO}:${VERSION}"

# 更新 docker-compose 使用的镜像版本
export IMAGE_TAG=$VERSION

# 停止旧容器并启动新容器
echo "🔄 Restarting containers..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans
docker compose -f "$COMPOSE_FILE" up -d

# 等待服务启动
echo "⏳ Waiting for services to start..."
sleep 5

# 运行数据库迁移
echo "🗃️ Running database migrations..."
docker exec quick-note npx prisma migrate deploy --schema=/app/packages/db/prisma/schema.prisma || true

# 健康检查
echo "🏥 Health check..."
if curl -sf http://localhost:3366/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful! App is running at http://localhost:3366"
else
    echo "⚠️ App started but health check failed. Check logs with: docker logs quick-note"
fi

# 清理旧镜像
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 Done!"
