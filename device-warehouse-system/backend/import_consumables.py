import pandas as pd
import mysql.connector
from datetime import datetime

# 读取 Excel 文件
df = pd.read_excel(r'C:\Users\Zhen\Downloads\耗材清单.xlsx')

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
    # 生成耗材编号
    consumable_code = f"CON-{datetime.now().strftime('%Y%m%d')}-{str(index + 1).zfill(3)}"
    
    # 处理 NaN 值
    seq_no = int(row['序号']) if pd.notna(row['序号']) else None
    consumable_name = str(row['名称']) if pd.notna(row['名称']) else None
    brand = str(row['品牌']) if pd.notna(row['品牌']) else None
    model_spec = str(row['型号规格']) if pd.notna(row['型号规格']) else None
    
    # 处理原始总数，可能是数字或文本
    original_quantity = 0
    if pd.notna(row['原始总数']):
        try:
            original_quantity = int(row['原始总数'])
        except (ValueError, TypeError):
            original_quantity = 100  # 默认值
    
    # 处理已使用数
    used_quantity = 0
    if pd.notna(row['已使用数']):
        try:
            used_quantity = int(row['已使用数'])
        except (ValueError, TypeError):
            used_quantity = 0
    
    # 处理剩余数量
    remaining_quantity = original_quantity
    if pd.notna(row['剩余数量']):
        try:
            remaining_quantity = int(row['剩余数量'])
        except (ValueError, TypeError):
            remaining_quantity = original_quantity
    
    unit = str(row['单位']) if pd.notna(row['单位']) else None
    company = str(row['所属公司']) if pd.notna(row['所属公司']) else None
    location = str(row['所在仓库']) if pd.notna(row['所在仓库']) else None
    remark = str(row['备注']) if pd.notna(row['备注']) else None
    image_url = str(row['图片']) if pd.notna(row['图片']) else None
    
    # 插入数据
    sql = """
    INSERT INTO consumable (
        seq_no, consumable_code, consumable_name, brand, model_spec,
        original_quantity, used_quantity, remaining_quantity, quantity,
        unit, company, location, remark, image_url,
        status, created_at, updated_at
    ) VALUES (
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        'normal', NOW(), NOW()
    )
    """
    
    values = (
        seq_no, consumable_code, consumable_name, brand, model_spec,
        original_quantity, used_quantity, remaining_quantity, remaining_quantity,
        unit, company, location, remark, image_url
    )
    
    cursor.execute(sql, values)
    print(f"已插入: {consumable_name} - {consumable_code}")

# 提交事务
conn.commit()
print(f"\n成功导入 {len(df)} 条耗材数据")

# 关闭连接
cursor.close()
conn.close()
