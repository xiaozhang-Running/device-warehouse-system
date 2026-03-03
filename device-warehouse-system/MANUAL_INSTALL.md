# 设备仓库管理系统 - 手动安装指南

由于在当前环境中无法直接完成安装程序的交互步骤，本指南将帮助您手动完成所有工具的安装。

## 1. 安装Java 17

### 步骤1：下载Java 17 JDK
- 访问Oracle官网：https://www.oracle.com/java/technologies/downloads/#java17
- 点击"Windows x64 Installer"下载
- 保存到本地（例如：`C:\Downloads`目录）

### 步骤2：运行安装程序
- 双击下载的`jdk-17.0.11_windows-x64_bin.exe`文件
- 按照安装向导的提示完成安装
- 选择默认安装路径（通常为`C:\Program Files\Java\jdk-17.0.11`）

### 步骤3：配置环境变量
1. 右键点击"此电脑" -> "属性" -> "高级系统设置" -> "环境变量"
2. 在"系统变量"中点击"新建"
   - 变量名：`JAVA_HOME`
   - 变量值：`C:\Program Files\Java\jdk-17.0.11`（根据实际安装路径调整）
3. 在"系统变量"中找到"Path"变量，点击"编辑"
4. 点击"新建"，输入：`%JAVA_HOME%\bin`
5. 点击"确定"保存所有更改

### 步骤4：验证安装
- 打开命令提示符（Win+R，输入`cmd`）
- 输入：`java -version`
- 应该看到类似输出：
  ```
  java version "17.0.11"
  Java(TM) SE Runtime Environment (build 17.0.11+9-LTS-201)
  Java HotSpot(TM) 64-Bit Server VM (build 17.0.11+9-LTS-201, mixed mode, sharing)
  ```

## 2. 安装Maven 3.8+

### 步骤1：下载Maven
- 访问Maven官网：https://maven.apache.org/download.cgi
- 下载`apache-maven-3.8.8-bin.zip`
- 保存到本地（例如：`C:\Downloads`目录）

### 步骤2：解压Maven
- 右键点击下载的zip文件，选择"解压到当前文件夹"
- 将解压后的文件夹移动到`C:\Program Files\Apache`目录（如果不存在，请创建）
- 重命名为`maven`（最终路径：`C:\Program Files\Apache\maven`）

### 步骤3：配置环境变量
1. 在"系统变量"中点击"新建"
   - 变量名：`MAVEN_HOME`
   - 变量值：`C:\Program Files\Apache\maven`
2. 在"Path"变量中点击"新建"，输入：`%MAVEN_HOME%\bin`
3. 点击"确定"保存所有更改

### 步骤4：验证安装
- 打开命令提示符
- 输入：`mvn -version`
- 应该看到Maven版本信息

## 3. 安装MySQL 8.0

### 步骤1：下载MySQL
- 访问MySQL官网：https://dev.mysql.com/downloads/mysql/
- 点击"Download"按钮下载MySQL Installer for Windows
- 保存到本地（例如：`C:\Downloads`目录）

### 步骤2：运行安装程序
- 双击下载的安装程序
- 选择"Developer Default"配置
- 按照安装向导的提示完成安装
- 设置root密码（请记住这个密码，后续配置需要使用）

### 步骤3：启动MySQL服务
- 打开"服务"管理器（Win+R，输入`services.msc`）
- 找到"MySQL80"服务，确保其状态为"正在运行"

### 步骤4：验证安装
- 打开命令提示符
- 输入：`mysql -u root -p`
- 输入设置的root密码
- 应该看到MySQL命令行提示符：`mysql>`

## 4. 安装Node.js和npm

### 步骤1：下载Node.js
- 访问Node.js官网：https://nodejs.org/
- 下载LTS版本的安装包（例如：`node-v18.18.0-x64.msi`）
- 保存到本地（例如：`C:\Downloads`目录）

### 步骤2：运行安装程序
- 双击下载的.msi文件
- 按照安装向导的提示完成安装
- 选择默认安装路径

### 步骤3：验证安装
- 打开命令提示符
- 输入：`node -version`
- 输入：`npm -version`
- 应该看到Node.js和npm的版本信息

## 5. 配置数据库

### 步骤1：创建数据库
- 打开命令提示符
- 输入：`mysql -u root -p`
- 输入root密码
- 输入以下SQL命令：
  ```sql
  CREATE DATABASE device_warehouse DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- 输入：`exit`退出MySQL

### 步骤2：配置数据库连接
- 编辑`backend/src/main/resources/application.properties`文件
- 修改数据库连接信息：
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/device_warehouse?useSSL=false&serverTimezone=UTC
  spring.datasource.username=root
  spring.datasource.password=your_password  # 替换为实际的MySQL密码
  ```

## 6. 运行系统

### 运行后端
1. 打开命令提示符
2. 进入后端目录：
   ```bash
   cd device-warehouse-system/backend
   ```
3. 编译并运行Spring Boot应用：
   ```bash
   mvn spring-boot:run
   ```
4. 后端服务将在`http://localhost:8080`启动

### 运行前端
1. 打开新的命令提示符
2. 进入前端目录：
   ```bash
   cd device-warehouse-system/frontend
   ```
3. 安装依赖：
   ```bash
   npm install
   ```
4. 启动开发服务器：
   ```bash
   npm run dev
   ```
5. 前端应用将在`http://localhost:3000`启动

## 7. 系统登录

- 打开浏览器，访问：`http://localhost:3000`
- 输入登录信息：
  - 用户名：`admin`
  - 密码：`admin123`

## 8. 故障排除

### 常见问题

1. **Java命令未找到**
   - 检查环境变量配置是否正确
   - 重启命令提示符后重试

2. **Maven命令未找到**
   - 检查环境变量配置是否正确
   - 重启命令提示符后重试

3. **MySQL连接失败**
   - 检查MySQL服务是否正在运行
   - 检查数据库连接配置是否正确
   - 检查root密码是否正确

4. **前端依赖安装失败**
   - 检查网络连接是否正常
   - 尝试使用`npm install --registry=https://registry.npmmirror.com`

5. **后端启动失败**
   - 检查数据库是否已创建
   - 检查数据库连接配置是否正确
   - 查看控制台错误日志

## 9. 联系方式

如果在安装过程中遇到问题，请参考本指南或联系开发团队获取帮助。