import pandas as pd
import sys

excel_file = r'C:\Users\Zhen\Downloads\设备总清单.xlsx'
sheet_name = '专用计时记分设备'

try:
    df = pd.read_excel(excel_file, sheet_name=sheet_name, header=0)
    print(f"成功读取工作表: {sheet_name}")
    print(f"数据行数: {len(df)}")
    print(f"列名: {list(df.columns)}")
    print("\n前10行数据:")
    print(df.head(10))
    
    csv_file = r'C:\Users\Zhen\Documents\trae_projects\DEVICE\device-warehouse-system\专用计时记分设备.csv'
    df.to_csv(csv_file, index=False, encoding='utf-8-sig')
    print(f"\n数据已保存到: {csv_file}")
except Exception as e:
    print(f"错误: {e}")
    sys.exit(1)