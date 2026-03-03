import pandas as pd
import sys

# 读取Excel文件
file_path = r'C:\Users\Zhen\Desktop\南京学习借用出库单-20260228.xlsx'
df = pd.read_excel(file_path, sheet_name=None)

print('=== Excel文件包含的工作表 ===')
for sheet_name in df.keys():
    print(f'- {sheet_name}')

# 读取第一个工作表
first_sheet = list(df.keys())[0]
data = df[first_sheet]

print(f'\n=== 工作表: {first_sheet} ===')
print(f'行数: {len(data)}')
print(f'列数: {len(data.columns)}')
print('\n=== 前30行数据 ===')
print(data.head(30).to_string())

print('\n=== 列名 ===')
print(data.columns.tolist())

print('\n=== 数据类型 ===')
print(data.dtypes)
