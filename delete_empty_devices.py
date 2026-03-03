import urllib.request
import json

base_url = 'http://localhost:8080/api'

try:
    # 先查询有多少条设备名称为空的数据
    print("正在查询设备名称为空的数据...")
    req = urllib.request.Request(f'{base_url}/devices/empty-name')
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        if result.get('success'):
            count = result.get('count', 0)
            print(f"找到 {count} 条设备名称为空的数据")
            
            if count > 0:
                # 删除这些数据
                print("正在删除...")
                delete_req = urllib.request.Request(f'{base_url}/devices/empty-name', method='DELETE')
                
                with urllib.request.urlopen(delete_req) as delete_response:
                    delete_result = json.loads(delete_response.read().decode('utf-8'))
                    if delete_result.get('success'):
                        print(f"✅ {delete_result.get('message')}")
                    else:
                        print(f"❌ 删除失败: {delete_result.get('message')}")
            else:
                print("没有需要删除的数据")
        else:
            print(f"❌ 查询失败: {result.get('message')}")
            
except Exception as e:
    print(f"发生错误: {e}")
    import traceback
    traceback.print_exc()
