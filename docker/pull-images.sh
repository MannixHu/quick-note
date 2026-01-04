#!/bin/bash
# Docker 镜像预拉取脚本
# 用于预先拉取 docker-compose.yml 中使用的所有镜像
#
# 使用国内镜像源加速：
# 方法1: 配置 Docker daemon 镜像加速器（推荐）
#   - macOS/Windows: Docker Desktop -> Settings -> Docker Engine -> 添加 registry-mirrors
#   - Linux: 编辑 /etc/docker/daemon.json 添加 registry-mirrors 配置
#
# 方法2: 使用国内镜像仓库地址（见下方注释）

echo "开始拉取 Docker 镜像..."

# PostgreSQL Database
echo "拉取 postgres:16-alpine..."
docker pull postgres:16-alpine

# Redis
echo "拉取 redis:7-alpine..."
docker pull redis:7-alpine

# Adminer (Database management UI)
echo "拉取 adminer:latest..."
docker pull adminer:latest

# MailHog (Email testing)
# 如果配置了 Docker daemon 镜像加速器，会自动使用国内源
# 或者可以使用国内镜像仓库（如果可用）：
# docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/mailhog:latest
echo "拉取 mailhog/mailhog:latest..."
docker pull mailhog/mailhog:latest

echo "所有镜像拉取完成！"

