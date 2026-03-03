-- 清空所有设备数据脚本
-- 注意：执行前请确保已备份重要数据

USE warehouse_db;

-- 1. 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 2. 清空出库单明细
TRUNCATE TABLE outbound_order_item;

-- 3. 清空出库单
TRUNCATE TABLE outbound_order;

-- 4. 清空设备图片
TRUNCATE TABLE device_image;

-- 5. 清空专用设备
TRUNCATE TABLE device;

-- 6. 清空通用设备
TRUNCATE TABLE accessory;

-- 7. 清空耗材
TRUNCATE TABLE consumable;

-- 8. 清空物料
TRUNCATE TABLE material;

-- 9. 启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 验证清空结果
SELECT '专用设备' as 类型, COUNT(*) as 数量 FROM device
UNION ALL
SELECT '通用设备', COUNT(*) FROM accessory
UNION ALL
SELECT '耗材', COUNT(*) FROM consumable
UNION ALL
SELECT '物料', COUNT(*) FROM material
UNION ALL
SELECT '出库单', COUNT(*) FROM outbound_order
UNION ALL
SELECT '出库单明细', COUNT(*) FROM outbound_order_item;

SELECT '所有设备数据已清空完成！' as 结果;
