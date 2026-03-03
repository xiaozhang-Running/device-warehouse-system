import pandas as pd
import sys
import os

try:
    file_path = r'C:\Users\Zhen\Desktop\库房设备总清单(新20260203).xlsx'
    print(f'尝试读取文件: {file_path}')
    print(f'文件是否存在: {os.path.exists(file_path)}')
    
    if os.path.exists(file_path):
        df = pd.read_excel(file_path)
        print('成功读取Excel文件')
        print('列名:', df.columns.tolist())
        print('\n前5行数据:')
        print(df.head())
        print('\n数据形状:', df.shape)
        print('\n数据类型:')
        print(df.dtypes)
        
        print('\n\n保存为CSV文件...')
        df.to_csv('device_data.csv', index=False, encoding='utf-8-sig')
        print('已保存为 device_data.csv')
    else:
        print('文件未找到，请检查路径是否正确')
except FileNotFoundError:
    print('文件未找到，请检查路径是否正确')
except Exception as e:
    print(f'错误: {type(e).__name__}: {e}')
    import traceback
    traceback.print_exc()