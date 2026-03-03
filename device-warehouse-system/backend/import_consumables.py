import pandas as pd
import mysql.connector
from datetime import datetime
import math

# 读取Excel文件
file_path = 'C:/Users/Zhen/Downloads/耗材清单.xlsx'
print(f"正在读取Excel文件: {file_path}")

df = pd.read_excel(file_path)
print(f"读取到 {len(df)} 条数据")
print(f"列名: {df.columns.tolist()}")

# 数据库连接配置
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'device_warehouse'
}

# 连接数据库
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

# 清空现有数据
print("清空现有耗材数据...")
cursor.execute("DELETE FROM consumable")
conn.commit()

# 插入数据
insert_sql = """
INSERT INTO consumable (
    seq_no, consumable_name, consumable_code, brand, model_spec, 
    original_quantity, used_quantity, remaining_quantity, quantity,
    unit, remark, image_url,
    created_at, updated_at
) VALUES (
    %s, %s, %s, %s, %s, 
    %s, %s, %s, %s,
    %s, %s, %s,
    %s, %s
)
"""

success_count = 0
error_count = 0

for index, row in df.iterrows():
    try:
        # 处理NaN值
        seq_no = int(row['序号']) if pd.notna(row['序号']) else (index + 1)
        consumable_name = str(row['名称']) if pd.notna(row['名称']) else None
        # 生成耗材编码：HC-序号
        consumable_code = f"HC-{seq_no:04d}"
        brand = str(row['品牌']) if pd.notna(row['品牌']) else None
        model_spec = str(row['型号规格']) if pd.notna(row['型号规格']) else None
        original_quantity = int(row['原始总数']) if pd.notna(row['原始总数']) else 0
        used_quantity = int(row['已使用数']) if pd.notna(row['已使用数']) else 0
        remaining_quantity = int(row['剩余数量']) if pd.notna(row['剩余数量']) else original_quantity
        unit = str(row['单位']) if pd.notna(row['单位']) else None
        remark = str(row['备注']) if pd.notna(row['备注']) else None
        image_url = str(row['图片']) if pd.notna(row['图片']) else None
        
        # 如果没有剩余数量，计算剩余数量
        if remaining_quantity == 0 and original_quantity > 0:
            remaining_quantity = original_quantity - used_quantity
        
        # 当前数量使用剩余数量
        quantity = remaining_quantity
        
        now = datetime.now()
        
        cursor.execute(insert_sql, (
            seq_no, consumable_name, consumable_code, brand, model_spec,
            original_quantity, used_quantity, remaining_quantity, quantity,
            unit, remark, image_url,
            now, now
        ))
        
        success_count += 1
        
        if (index + 1) % 10 == 0:
            print(f"已处理 {index + 1} 条数据...")
            
    except Exception as e:
        error_count += 1
        print(f"第 {index + 1} 行数据插入失败: {e}")
        print(f"数据: {row.to_dict()}")

# 提交事务
conn.commit()

# 验证导入结果
cursor.execute("SELECT COUNT(*) FROM consumable")
total_count = cursor.fetchone()[0]

print(f"\n导入完成!")
print(f"成功: {success_count} 条")
print(f"失败: {error_count} 条")
print(f"数据库总记录数: {total_count} 条")

# 关闭连接
cursor.close()
conn.close()
