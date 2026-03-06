# Docker部署指南

## 目录结构

```
device-warehouse-system/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/main/resources/
│       └── application-prod.properties
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── nginx.conf
├── mysql/
│   └── init/
│       └── 01-init.sql
├── docker-compose.yml
├── .env.example
└── uploads/
```

## 快速开始

### 1. 环境准备

确保已安装以下软件：
- Docker (>= 20.10)
- Docker Compose (>= 2.0)

验证安装：
```bash
docker --version
docker-compose --version
```

### 2. 配置环境变量

复制环境变量示例文件并修改：
```bash
cp .env.example .env
```

编辑 `.env` 文件，修改以下配置：
```env
# MySQL配置
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=warehouse
MYSQL_USER=warehouse
MYSQL_PASSWORD=your_password
MYSQL_PORT=3306

# 后端配置
BACKEND_PORT=8080

# 前端配置
FRONTEND_PORT=80

# Redis配置
REDIS_PASSWORD=your_redis_password
REDIS_PORT=6379
```

### 3. 构建和启动

**首次部署：**
```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

**后续更新：**
```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 或者只重启特定服务
docker-compose restart backend
docker-compose restart frontend
```

### 4. 访问应用

- 前端：http://localhost
- 后端API：http://localhost:8080/api
- MySQL：localhost:3306
- Redis：localhost:6379

## 常用命令

### 服务管理

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启所有服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]
```

### 单独构建

```bash
# 只构建后端
docker-compose build backend

# 只构建前端
docker-compose build frontend

# 只构建MySQL
docker-compose build mysql
```

### 数据管理

```bash
# 备份MySQL数据
docker exec warehouse-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} warehouse > backup.sql

# 恢复MySQL数据
docker exec -i warehouse-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} warehouse < backup.sql

# 查看MySQL日志
docker-compose logs mysql

# 进入MySQL容器
docker exec -it warehouse-mysql mysql -u root -p
```

### 清理

```bash
# 停止并删除容器、网络
docker-compose down

# 停止并删除容器、网络、数据卷
docker-compose down -v

# 删除所有未使用的镜像
docker image prune -a
```

## 生产环境部署

### 1. 安全配置

**修改默认密码：**
- 修改 `.env` 文件中的所有密码
- 使用强密码（至少16位，包含大小写字母、数字、特殊字符）

**配置防火墙：**
```bash
# 只开放必要端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2. HTTPS配置（推荐使用Nginx反向代理）

创建 `nginx/ssl.conf`：
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://warehouse-frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://warehouse-backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. 性能优化

**调整JVM参数：**
```yaml
# docker-compose.yml
backend:
  environment:
    JAVA_OPTS: -Xms1g -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200
```

**MySQL优化：**
```yaml
# docker-compose.yml
mysql:
  command:
    - --innodb-buffer-pool-size=1G
    - --max_connections=1000
    - --query-cache-size=0
    - --query-cache-type=0
```

### 4. 监控和日志

**查看资源使用：**
```bash
docker stats
```

**日志轮转：**
在 `docker-compose.yml` 中添加：
```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 故障排查

### 1. 容器无法启动

```bash
# 查看容器日志
docker-compose logs backend

# 查看容器状态
docker-compose ps

# 检查容器配置
docker inspect warehouse-backend
```

### 2. 数据库连接失败

```bash
# 检查MySQL是否启动
docker-compose ps mysql

# 查看MySQL日志
docker-compose logs mysql

# 测试数据库连接
docker exec -it warehouse-mysql mysql -u warehouse -p
```

### 3. 前端无法访问后端

```bash
# 检查网络
docker network ls
docker network inspect device-warehouse-system_warehouse-network

# 检查后端健康状态
curl http://localhost:8080/api/actuator/health
```

### 4. 重置环境

```bash
# 停止并删除所有容器、网络、数据卷
docker-compose down -v

# 删除所有镜像
docker rmi $(docker images -q device-warehouse-system_*)

# 重新构建
docker-compose up -d --build
```

## 备份和恢复

### 自动备份脚本

创建 `backup.sh`：
```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 备份MySQL
docker exec warehouse-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} warehouse > ${BACKUP_DIR}/mysql_${DATE}.sql

# 备份上传文件
tar -czf ${BACKUP_DIR}/uploads_${DATE}.tar.gz ./uploads

# 删除7天前的备份
find ${BACKUP_DIR} -type f -mtime +7 -delete
```

### 恢复

```bash
# 恢复MySQL
docker exec -i warehouse-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} warehouse < backup.sql

# 恢复上传文件
tar -xzf uploads_backup.tar.gz
```

## 更新应用

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 备份数据
./backup.sh

# 3. 重新构建并启动
docker-compose up -d --build

# 4. 检查服务状态
docker-compose ps
docker-compose logs -f
```

## 注意事项

1. **数据安全**：定期备份数据库和上传文件
2. **密码安全**：使用强密码，定期更换
3. **网络安全**：配置防火墙，只开放必要端口
4. **监控告警**：配置监控和告警系统
5. **日志管理**：定期清理日志文件
6. **资源限制**：根据服务器配置调整容器资源限制

## 技术支持

如有问题，请查看：
- 项目文档：README.md
- 问题反馈：GitHub Issues
- 日志文件：/app/logs/
