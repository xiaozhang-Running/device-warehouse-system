import csv

input_file = r'c:\Users\Zhen\Documents\trae_projects\DEVICE\device-warehouse-system\专用计时记分设备.csv'
output_file = r'c:\Users\Zhen\Documents\trae_projects\DEVICE\device-warehouse-system\专用计时记分设备_清理后.csv'

with open(input_file, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    headers = next(reader)
    
    valid_rows = []
    empty_rows = 0
    
    for row in reader:
        # 检查是否是空行（设备名称和设备编号都为空）
        if len(row) >= 3 and row[1].strip() and row[2].strip():
            valid_rows.append(row)
        else:
            empty_rows += 1

with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(valid_rows)

print(f"清理完成！")
print(f"原数据行数: {len(valid_rows) + empty_rows}")
print(f"有效数据行数: {len(valid_rows)}")
print(f"空行数: {empty_rows}")
print(f"清理后文件: {output_file}")