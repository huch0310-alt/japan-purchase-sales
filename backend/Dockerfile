# 日本采销管理系统 - 后端Dockerfile
# 使用多阶段构建优化镜像大小

# ==================== 构建阶段 ====================
FROM node:18-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache python3 make g++

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖 (使用 npm install 而非 npm ci 以避免锁文件问题)
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# ==================== 运行阶段 ====================
FROM node:18-alpine AS runner

# 设置工作目录
WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 复制构建产物
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/uploads ./uploads

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 切换到非root用户
USER nodejs

# 启动应用
CMD ["node", "dist/main.js"]
