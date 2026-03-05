-- 清空数据库所有数据（保留表结构）
-- 按照外键依赖顺序删除数据

SET FOREIGN_KEY_CHECKS = 0;

-- 删除入库单明细
DELETE FROM inbound_order_item;

-- 删除入库单
DELETE FROM inbound_order;

-- 删除出库单明细
DELETE FROM outbound_order_item;

-- 删除出库单
DELETE FROM outbound_order;

-- 删除设备
DELETE FROM device;

-- 删除通用设备
DELETE FROM accessory;

-- 删除耗材
DELETE FROM consumable;

-- 删除物料
DELETE FROM material;

-- 删除公司
DELETE FROM company;

-- 删除仓库
DELETE FROM warehouse;

-- 删除用户（保留管理员账户）
-- 如果需要删除所有用户，取消下面这行的注释
-- DELETE FROM user;

SET FOREIGN_KEY_CHECKS = 1;

-- 重置自增ID
ALTER TABLE inbound_order_item AUTO_INCREMENT = 1;
ALTER TABLE inbound_order AUTO_INCREMENT = 1;
ALTER TABLE outbound_order_item AUTO_INCREMENT = 1;
ALTER TABLE outbound_order AUTO_INCREMENT = 1;
ALTER TABLE device AUTO_INCREMENT = 1;
ALTER TABLE accessory AUTO_INCREMENT = 1;
ALTER TABLE consumable AUTO_INCREMENT = 1;
ALTER TABLE material AUTO_INCREMENT = 1;
ALTER TABLE company AUTO_INCREMENT = 1;
ALTER TABLE warehouse AUTO_INCREMENT = 1;
