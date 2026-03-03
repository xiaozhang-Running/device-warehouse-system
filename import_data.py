import urllib.request
import urllib.parse
import json
import csv

csv_file = r'c:\Users\Zhen\Documents\trae_projects\DEVICE\device-warehouse-system\专用计时记分设备.csv'
base_url = 'http://localhost:8080/api'

success_count = 0
error_count = 0

try:
    with open(csv_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        headers = next(reader)
        
        for row in reader:
            if len(row) < 3:
                continue
            
            try:
                device_data = {
                    'seqNo': int(row[0]) if row[0] else None,
                    'deviceName': row[1] if len(row) > 1 else '',
                    'deviceCode': row[2] if len(row) > 2 else '',
                    'snCode': row[3] if len(row) > 3 else '',
                    'brand': row[4] if len(row) > 4 else '',
                    'modelSpec': row[5] if len(row) > 5 else '',
                    'quantity': int(row[6]) if len(row) > 6 and row[6] else 1,
                    'unit': row[7] if len(row) > 7 else '',
                    'otherAccessories': row[8] if len(row) > 8 else '',
                    'status': row[9] if len(row) > 9 else '',
                    'usageStatus': row[10] if len(row) > 10 else '',
                    'remark': row[11] if len(row) > 11 else '',
                    'imageUrl': row[12] if len(row) > 12 else ''
                }
                
                json_data = json.dumps(device_data).encode('utf-8')
                req = urllib.request.Request(f'{base_url}/devices', data=json_data, 
                                          headers={'Content-Type': 'application/json'})
                
                with urllib.request.urlopen(req) as response:
                    if response.status == 200:
                        success_count += 1
                        if success_count % 100 == 0:
                            print(f"已导入 {success_count} 条数据...")
            except Exception as e:
                error_count += 1
                print(f"导入失败: {row[1] if len(row) > 1 else ''}, 错误: {e}")
    
    print(f"\n导入完成！")
    print(f"成功导入: {success_count} 条")
    print(f"失败: {error_count} 条")
    
except Exception as e:
    print(f"发生错误: {e}")
    import traceback
    traceback.print_exc()