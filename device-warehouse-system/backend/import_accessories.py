import pandas as pd
import mysql.connector
from datetime import datetime

# 读取 Excel 文件
df = pd.read_excel(r'C:\Users\Zhen\Downloads\通用设备清单.xlsx')

# 连接数据库
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='1234',
    database='device_warehouse'
)
cursor = conn.cursor()

# 遍历每一行数据
for index, row in df.iterrows():
    # 处理 NaN 值
    seq_no = int(row['序号']) if pd.notna(row['序号']) else None
    accessory_name = str(row['名称']) if pd.notna(row['名称']) else None
    accessory_code = str(row['设备编号（*）']) if pd.notna(row['设备编号（*）']) else None
    sn_code = str(row['SN码']) if pd.notna(row['SN码']) else None
    brand = str(row['品牌']) if pd.notna(row['品牌']) else None
    model_spec = str(row['型号规格']) if pd.notna(row['型号规格']) else None
    quantity = int(row['数量']) if pd.notna(row['数量']) else 1
    unit = str(row['单位']) if pd.notna(row['单位']) else None
    other_accessories = str(row['配件']) if pd.notna(row['配件']) else None
    status = str(row['设备状态']) if pd.notna(row['设备状态']) else '正常'
    usage_status = str(row['使用状态']) if pd.notna(row['使用状态']) else '未使用'
    company = str(row['所属公司']) if pd.notna(row['所属公司']) else None
    location = str(row['所在仓库']) if pd.notna(row['所在仓库']) else None
    remark = str(row['备注']) if pd.notna(row['备注']) else None
    image_url = str(row['图片']) if pd.notna(row['图片']) else None
    
    # 插入数据
    sql = """
    INSERT INTO accessory (
        seq_no, accessory_code, accessory_name, sn_code, brand, model_spec,
        quantity, unit, other_accessories, status, usage_status,
        company, location, remark, image_url,
        in_use_quantity, remaining_quantity,
        created_at, updated_at
    ) VALUES (
        %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s,
        0, %s,
        NOW(), NOW()
    )
    ON DUPLICATE KEY UPDATE
        accessory_name = VALUES(accessory_name),
        sn_code = VALUES(sn_code),
        brand = VALUES(brand),
        model_spec = VALUES(model_spec),
        quantity = VALUES(quantity),
        unit = VALUES(unit),
        other_accessories = VALUES(other_accessories),
        status = VALUES(status),
        usage_status = VALUES(usage_status),
        company = VALUES(company),
        location = VALUES(location),
        remark = VALUES(remark),
        image_url = VALUES(image_url),
        remaining_quantity = VALUES(quantity),
        updated_at = NOW()
    """
    
    values = (
        seq_no, accessory_code, accessory_name, sn_code, brand, model_spec,
        quantity, unit, other_accessories, status, usage_status,
        company, location, remark, image_url,
        quantity
    )
    
    cursor.execute(sql, values)
    
    # 每100条打印一次进度
    if (index + 1) % 100 == 0:
        print(f"已导入 {index + 1}/{len(df)} 条数据")

# 提交事务
conn.commit()
print(f"\n成功导入 {len(df)} 条通用设备数据")

# 关闭连接
cursor.close()
conn.close()
