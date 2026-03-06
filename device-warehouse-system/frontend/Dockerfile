# 前端Dockerfile - 多阶段构建

# 阶段1: 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制package.json并安装依赖（利用Docker缓存）
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# 复制源代码并构建
COPY . .
RUN npm run build

# 阶段2: 生产阶段 - 使用Nginx
FROM nginx:alpine

# 安装curl用于健康检查
RUN apk add --no-cache curl

# 删除默认的nginx配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建nginx缓存目录
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
