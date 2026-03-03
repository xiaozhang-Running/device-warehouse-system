import pandas as pd

df = pd.read_excel(r'C:\Users\Zhen\Desktop\库房设备总清单(新20260203).xlsx')
print('列名:', df.columns.tolist())
print('\n数据形状:', df.shape)
print('\n前5行数据:')
print(df.head())
print('\n数据类型:')
print(df.dtypes)
print('\n数据统计:')
print(df.describe(include='all'))