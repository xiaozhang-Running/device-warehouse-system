@echo off
chcp 65001 >nul
echo ==========================================
echo    设备仓库管理系统 - 快速启动脚本
echo ==========================================
echo.

:: 检查Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Docker，请先安装Docker
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

:: 检查Docker Compose
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Docker Compose
    pause
    exit /b 1
)

:: 检查.env文件
if not exist .env (
    echo [提示] 创建默认环境配置文件...
    (
        echo # MySQL配置
        echo MYSQL_ROOT_PASSWORD=warehouse123
        echo MYSQL_PASSWORD=warehouse123
        echo.
        echo # 管理员账号
        echo ADMIN_USERNAME=admin
        echo ADMIN_PASSWORD=admin123
        echo.
        echo # CORS配置
        echo CORS_ORIGINS=http://localhost:80
    ) > .env
    echo [完成] 已创建.env文件，请根据需要修改配置
    echo.
)

echo [1/4] 正在拉取最新代码...
cd ..
git pull
cd deploy

echo.
echo [2/4] 正在构建应用...
docker-compose build --no-cache

echo.
echo [3/4] 正在启动服务...
docker-compose up -d

echo.
echo [4/4] 等待服务启动...
timeout /t 10 /nobreak >nul

:: 检查服务状态
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo    ✅ 部署成功！
    echo ==========================================
    echo.
    echo 📱 访问地址:
    echo    前端: http://localhost
    echo    后端: http://localhost/api
    echo.
    echo 🔧 管理命令:
    echo    查看日志: docker-compose logs -f
    echo    停止服务: docker-compose down
    echo    重启服务: docker-compose restart
    echo.
    echo 👤 默认账号:
    echo    用户名: admin
    echo    密码: admin123
    echo.
    echo ==========================================
) else (
    echo.
    echo [错误] 服务启动失败，请检查日志:
    echo    docker-compose logs
)

pause
