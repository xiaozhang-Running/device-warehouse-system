# 设备仓库管理系统 - 部署指南

## 📋 系统要求

### 服务器配置要求
- **CPU**: 2核及以上
- **内存**: 4GB及以上
- **磁盘**: 20GB及以上
- **操作系统**: Linux (推荐 Ubuntu 20.04/22.04) 或 Windows Server

### 软件环境
- **Java**: JDK 17+
- **Node.js**: 18+ (仅开发需要)
- **MySQL**: 8.0+
- **Nginx**: 1.18+ (生产环境推荐)
- **Docker**: 20.10+ (可选，使用Docker部署)
- **Docker Compose**: 1.29+ (可选)

---

## 🚀 部署方式

### 方式一：Docker部署（推荐）

#### 1. 安装Docker和Docker Compose

**Ubuntu:**
```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh

# 安装Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 启动Docker
sudo systemctl start docker
sudo systemctl enable docker
```

**Windows:**
- 下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)

#### 2. 准备部署文件

将以下文件上传到服务器：
```
deploy/
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
└── init.sql (可选，初始化数据)
```

#### 3. 配置环境变量

创建 `.env` 文件：
```bash
cd deploy
cat > .env << EOF
# MySQL配置
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_PASSWORD=your_warehouse_password

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password

# CORS配置（生产环境域名）
CORS_ORIGINS=http://your-domain.com
EOF
```

#### 4. 启动服务

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

#### 5. 访问系统

- 前端: http://localhost 或 http://服务器IP
- 后端API: http://localhost/api

---

### 方式二：传统部署

#### 1. 安装MySQL

**Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install mysql-server-8.0
sudo mysql_secure_installation
```

**创建数据库:**
```sql
CREATE DATABASE device_warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'warehouse'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON device_warehouse.* TO 'warehouse'@'%';
FLUSH PRIVILEGES;
```

#### 2. 部署后端

**上传JAR包:**
```bash
# 创建应用目录
mkdir -p /opt/warehouse/backend
mkdir -p /opt/warehouse/logs

# 上传JAR包
cp backend/target/warehouse-backend-1.0.0-SNAPSHOT.jar /opt/warehouse/backend/app.jar
```

**创建启动脚本:**
```bash
cat > /opt/warehouse/backend/start.sh << 'EOF'
#!/bin/bash
export SPRING_PROFILES_ACTIVE=prod
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_DATABASE=device_warehouse
export MYSQL_USER=warehouse
export MYSQL_PASSWORD=your_password
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=your_admin_password
export CORS_ORIGINS=http://your-domain.com

java -jar -Xmx1g -Xms512m \
  -Djava.security.egd=file:/dev/./urandom \
  -Dspring.profiles.active=prod \
  -Dlogging.file.path=/opt/warehouse/logs \
  app.jar
EOF

chmod +x /opt/warehouse/backend/start.sh
```

**创建Systemd服务:**
```bash
sudo cat > /etc/systemd/system/warehouse-backend.service << 'EOF'
[Unit]
Description=Warehouse Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=warehouse
WorkingDirectory=/opt/warehouse/backend
ExecStart=/opt/warehouse/backend/start.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable warehouse-backend
sudo systemctl start warehouse-backend
```

#### 3. 部署前端

**安装Nginx:**
```bash
sudo apt-get install nginx
```

**上传前端文件:**
```bash
mkdir -p /var/www/warehouse
cp -r frontend/dist/* /var/www/warehouse/
```

**配置Nginx:**
```bash
sudo cat > /etc/nginx/sites-available/warehouse << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/warehouse;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/warehouse /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 配置说明

### 后端配置 (application-prod.properties)

| 配置项 | 环境变量 | 默认值 | 说明 |
|-------|---------|-------|------|
| server.port | - | 8080 | 服务端口 |
| spring.datasource.url | MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE | localhost:3306/device_warehouse | 数据库连接 |
| spring.datasource.username | MYSQL_USER | warehouse | 数据库用户名 |
| spring.datasource.password | MYSQL_PASSWORD | - | 数据库密码 |
| spring.security.user.name | ADMIN_USERNAME | admin | 管理员账号 |
| spring.security.user.password | ADMIN_PASSWORD | admin123 | 管理员密码 |
| spring.web.cors.allowed-origins | CORS_ORIGINS | http://localhost:80 | 允许跨域域名 |

### 前端配置 (.env.production)

| 配置项 | 说明 |
|-------|------|
| VITE_API_BASE_URL | API基础路径，默认 `/api` |
| VITE_APP_TITLE | 应用标题 |
| VITE_APP_VERSION | 应用版本 |

---

## 🔒 安全建议

### 1. 修改默认密码
- 立即修改MySQL root密码
- 修改应用管理员默认密码
- 创建独立的数据库用户

### 2. 配置HTTPS
使用Let's Encrypt免费证书：
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. 配置防火墙
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 4. 定期备份
```bash
# 数据库备份脚本
mysqldump -u warehouse -p device_warehouse > backup_$(date +%Y%m%d).sql

# 添加到crontab，每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

---

## 📊 监控和维护

### 查看日志
```bash
# Docker部署
docker-compose logs -f backend
docker-compose logs -f frontend

# 传统部署
sudo journalctl -u warehouse-backend -f
tail -f /opt/warehouse/logs/warehouse.log
```

### 性能监控
- 使用Spring Boot Actuator（已集成）
- 访问: http://localhost:8080/api/actuator/health

### 数据库优化
```sql
-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log';

-- 优化表
OPTIMIZE TABLE device;
OPTIMIZE TABLE inbound_order;
```

---

## 🐛 常见问题

### 1. 数据库连接失败
- 检查MySQL服务是否运行
- 检查数据库用户名密码是否正确
- 检查防火墙是否放行3306端口

### 2. 前端无法访问API
- 检查CORS配置是否正确
- 检查Nginx代理配置
- 查看浏览器控制台错误信息

### 3. 内存不足
- 调整JVM参数: `-Xmx2g -Xms1g`
- 增加服务器内存
- 启用Swap分区

### 4. 端口冲突
- 修改后端端口: 在application-prod.properties中修改server.port
- 修改Nginx端口: 在nginx.conf中修改listen端口

---

## 📞 技术支持

如有问题，请检查：
1. 日志文件中的错误信息
2. 各服务是否正常运行
3. 网络连接是否正常
4. 配置文件是否正确

---

**部署完成！** 🎉
