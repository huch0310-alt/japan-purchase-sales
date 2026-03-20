# 日本采销管理系统 - 容器化部署设计

## 概述

为日本采销管理系统构建完整的容器化部署方案，支持开发、测试、生产环境。

## 技术选型

| 组件 | 技术方案 | 理由 |
|------|----------|------|
| 容器引擎 | Docker | 最流行的容器技术 |
| 容器编排 | Docker Compose | 简单易用，适合本地开发和小规模部署 |
| 反向代理 | Nginx | 高性能HTTP服务器和反向代理 |
| 数据库 | PostgreSQL 14 | 项目指定的数据库 |
| 镜像构建 | Multi-stage Build | 减小镜像体积 |

## 架构设计

### 开发环境架构

```
┌─────────────────────────────────────────────┐
│                 Docker Compose              │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Backend  │  │ Web-Admin│  │  Nginx   │ │
│  │  :3001   │  │  :3000   │  │  :80     │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │             │        │
│  ┌────┴─────────────┴─────────────┴────┐  │
│  │           Shared Network            │  │
│  └────────────────────────────────────┘  │
│                                             │
│  ┌──────────┐  ┌──────────┐               │
│  │PostgreSQL│  │   PGAdmin │               │
│  │  :5432   │  │  :5050   │               │
│  └──────────┘  └──────────┘               │
└─────────────────────────────────────────────┘
```

### 生产环境架构

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  Load Balancer
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │Backend 1│       │Backend 2│       │Backend 3│
   │ :3001   │       │ :3001   │       │ :3001   │
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
   ┌────┴──────────────────┴──────────────────┴────┐
   │              PostgreSQL Cluster               │
   │                 (Primary + Replica)           │
   └───────────────────────────────────────────────┘
```

## 模块设计

### 1. Dockerfile - Backend

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/uploads ./uploads

EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### 2. Dockerfile - Web Admin

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose - 开发环境

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
    volumes:
      - ./backend:/app
      - /app/node_modules

  web-admin:
    build: ./web-admin
    ports:
      - "3000:80"

  postgres:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=japan_purchase_sales
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
```

### 4. Nginx 配置

- 静态文件服务
- API反向代理
- Gzip压缩
- 缓存配置

## 验收标准

1. 开发环境可以通过 `docker-compose up` 一键启动
2. 所有服务可以正常通信
3. 数据库数据持久化
4. 生产环境镜像大小 < 200MB
5. 支持环境变量配置
