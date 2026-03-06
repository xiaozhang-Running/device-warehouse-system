-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS warehouse DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE warehouse;

-- 创建用户并授权（如果用户不存在）
CREATE USER IF NOT EXISTS 'warehouse'@'%' IDENTIFIED BY 'warehouse123456';
GRANT ALL PRIVILEGES ON warehouse.* TO 'warehouse'@'%';
FLUSH PRIVILEGES;

-- 设置时区
SET GLOBAL time_zone = '+8:00';
