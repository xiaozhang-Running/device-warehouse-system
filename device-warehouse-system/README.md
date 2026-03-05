# 设备仓库管理系统

一个基于 Spring Boot + React 的设备仓库管理系统，用于管理专用设备、通用设备、耗材、物料等的入库、出库和库存管理。

## 技术栈

### 后端
- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0
- **ORM**: Spring Data JPA
- **安全**: Spring Security
- **构建工具**: Maven
- **Java版本**: Java 17

### 前端
- **框架**: React 18
- **UI组件库**: Ant Design 5.x
- **构建工具**: Vite
- **路由**: React Router 6
- **HTTP客户端**: Axios

## 功能特性

### 设备管理
- 专用设备管理（带SN码）
- 通用设备管理
- 耗材管理（支持数量累加）
- 物料管理
- 办公用品管理

### 入库管理
- 采购入库
- 归还入库
- 项目入库
- 物料入库
- 入库单打印

### 出库管理
- 设备出库
- 物料出库
- 出库单打印
- 设备流转

### 库存管理
- 实时库存查询
- 库存预警
- 库存统计

### 系统管理
- 用户管理（管理员、操作员、游客）
- 公司管理
- 仓库管理
- 数据导入

## 项目结构

```
device-warehouse-system/
├── backend/                          # 后端项目
│   ├── src/main/java/com/device/warehouse/
│   │   ├── config/                   # 配置类
│   │   ├── controller/               # 控制器
│   │   ├── service/                  # 业务逻辑
│   │   ├── repository/               # 数据访问
│   │   ├── entity/                   # 实体类
│   │   └── dto/                      # 数据传输对象
│   ├── src/main/resources/
│   │   └── application.properties    # 配置文件
│   └── pom.xml                       # Maven配置
├── frontend/                         # 前端项目
│   ├── src/
│   │   ├── pages/                    # 页面组件
│   │   ├── App.jsx                   # 主应用
│   │   └── main.jsx                  # 入口文件
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 快速开始

### 环境要求
- Java 17+
- MySQL 8.0+
- Node.js 18+
- Maven 3.6+

### 数据库配置
1. 创建数据库：
```sql
CREATE DATABASE device_warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 修改 `backend/src/main/resources/application.properties` 中的数据库连接信息：
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/device_warehouse?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 启动后端
```bash
cd backend
mvn spring-boot:run
```

后端服务将运行在：http://localhost:8080/api

### 启动前端
```bash
cd frontend
npm install
npm run dev
```

前端服务将运行在：http://localhost:5173

### 默认账号
- 管理员：admin / admin123
- 操作员：operator / operator123
- 游客：guest / guest123

## 核心业务逻辑

### 入库逻辑
1. **专用设备/通用设备**：如果设备已存在（同名称、品牌、型号），提示用户修改数据，不允许重复入库
2. **耗材**：如果耗材已存在，自动累加数量到现有库存
3. **新设备**：生成唯一编码后创建新记录

### 出库逻辑
1. 检查库存是否充足
2. 更新设备使用状态为"使用中"
3. 扣减耗材/物料库存
4. 记录出库明细

### 归还逻辑
1. 更新设备状态为"未使用"
2. 增加耗材/物料库存
3. 记录归还明细

## 编码规则

### 专用设备
格式：`YD-{设备名称}-{序号}`
示例：`YD-ALGE终点摄像-001`

### 通用设备
格式：`TY-{设备名称}-{序号}`
示例：`TY-交换机-001`

### 耗材
格式：`HC-{耗材名称}-{序号}`
示例：`HC-香蕉头-001`

## 安全说明

- 系统使用 Spring Security 进行安全控制
- 密码使用 BCrypt 加密存储
- 支持三种角色：管理员、操作员、游客
- 管理员拥有所有权限
- 操作员可以执行日常操作
- 游客只能查看数据

## 开发规范

### 后端
- 使用 Lombok 简化代码
- 使用 JPA 进行数据库操作
- 使用 @Transactional 管理事务
- 使用 SLF4J 记录日志

### 前端
- 使用函数式组件和 Hooks
- 使用 Ant Design 组件库
- 使用 Axios 进行 HTTP 请求
- 使用 React Router 进行路由管理

## 日志配置

系统使用 SLF4J + Logback 记录日志，日志文件位于：
- 控制台：实时输出
- 文件：`logs/application.log`

## 注意事项

1. 首次启动会自动创建默认用户
2. 数据库表结构会自动创建（`spring.jpa.hibernate.ddl-auto=update`）
3. 生产环境建议修改 `ddl-auto` 为 `validate` 或 `none`
4. 建议定期备份数据库

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

如有问题或建议，请提交 Issue 或联系项目维护者。

---

**版本**: 1.0.0  
**最后更新**: 2026-03-05
