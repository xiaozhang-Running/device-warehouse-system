#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
通用设备数据导入脚本
从Excel文件导入通用设备数据到MySQL数据库
"""

import pandas as pd
import mysql.connector
from datetime import datetime

def import_accessories():
    # 读取Excel文件
    excel_path = 'C:/Users/Zhen/Downloads/通用设备清单.xlsx'
    print(f"正在读取Excel文件: {excel_path}")
    
    df = pd.read_excel(excel_path)
    print(f"读取到 {len(df)} 条数据")
    print(f"列名: {df.columns.tolist()}")
    
    # 连接数据库
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='1234',
        database='device_warehouse',
        charset='utf8mb4'
    )
    
    cursor = conn.cursor()
    
    # 清空现有数据
    print("清空现有通用设备数据...")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    cursor.execute("TRUNCATE TABLE accessory")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    
    # 准备插入语句
    insert_sql = """
    INSERT INTO accessory (
        seq_no, accessory_name, accessory_code, sn_code, brand, 
        model_spec, quantity, unit, other_accessories, 
        status, usage_status, remark, image_url,
        in_use_quantity, remaining_quantity,
        created_at, updated_at
    ) VALUES (
        %s, %s, %s, %s, %s, 
        %s, %s, %s, %s, 
        %s, %s, %s, %s,
        %s, %s,
        %s, %s
    )
    """
    
    # 当前时间
    now = datetime.now()
    
    # 统计
    success_count = 0
    error_count = 0
    
    # 逐行插入数据
    for index, row in df.iterrows():
        try:
            # 处理数据
            seq_no = int(row['序号']) if pd.notna(row['序号']) else None
            accessory_name = str(row['名称']).strip() if pd.notna(row['名称']) else None
            accessory_code = str(row['设备编号（*）']).strip() if pd.notna(row['设备编号（*）']) else None
            sn_code = str(row['SN码']).strip() if pd.notna(row['SN码']) else None
            brand = str(row['品牌']).strip() if pd.notna(row['品牌']) else None
            model_spec = str(row['型号规格']).strip() if pd.notna(row['型号规格']) else None
            quantity = int(row['数量']) if pd.notna(row['数量']) else 1
            unit = str(row['单位']).strip() if pd.notna(row['单位']) else '个'
            other_accessories = str(row['配件']).strip() if pd.notna(row['配件']) else None
            status = str(row['设备状态']).strip() if pd.notna(row['设备状态']) else '正常'
            usage_status = str(row['使用状态']).strip() if pd.notna(row['使用状态']) else '未使用'
            remark = str(row['备注']).strip() if pd.notna(row['备注']) else None
            image_url = str(row['图片']).strip() if pd.notna(row['图片']) else None
            
            # 如果设备状态为空，设置为正常
            if not status or status == 'nan':
                status = '正常'
            
            # 如果使用状态为空，设置为未使用
            if not usage_status or usage_status == 'nan':
                usage_status = '未使用'
            
            # 计算使用中和剩余数量
            in_use_quantity = 0
            remaining_quantity = quantity
            
            # 插入数据
            cursor.execute(insert_sql, (
                seq_no, accessory_name, accessory_code, sn_code, brand,
                model_spec, quantity, unit, other_accessories,
                status, usage_status, remark, image_url,
                in_use_quantity, remaining_quantity,
                now, now
            ))
            
            success_count += 1
            
            if (index + 1) % 100 == 0:
                print(f"已处理 {index + 1} 条数据...")
                
        except Exception as e:
            print(f"第 {index + 1} 行数据插入失败: {e}")
            print(f"数据: {row.to_dict()}")
            error_count += 1
    
    # 提交事务
    conn.commit()
    
    # 验证结果
    cursor.execute("SELECT COUNT(*) FROM accessory")
    total_count = cursor.fetchone()[0]
    
    print(f"\n导入完成!")
    print(f"成功: {success_count} 条")
    print(f"失败: {error_count} 条")
    print(f"数据库总记录数: {total_count} 条")
    
    # 关闭连接
    cursor.close()
    conn.close()

if __name__ == '__main__':
    import_accessories()
