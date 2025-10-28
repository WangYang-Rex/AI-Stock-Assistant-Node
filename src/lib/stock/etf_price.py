import requests

def get_etf_data(etf_code):
    # 构造API请求参数（上交所ETF代码前缀为1.，深交所为0.）
    url = "https://push2.eastmoney.com/api/qt/stock/get"
    params = {
        "secid": f"1.{etf_code}",  # 588080属于上交所
        "fields": "f43,f44,f45,f46,f47,f58,f60",  # 常用字段集合
        "ut": "fa5fd1943c7b386f172d6893dbfba10b",
        "invt": "2",
    }
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": "https://fund.eastmoney.com/"
    }

    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()  # 检查请求状态
        
        data = response.json().get("data", {})
        
        if not data:
            print("未获取到有效数据")
            return None

        # 提取并转换数据（价格单位转换为元）
        return {
            "ETF名称": data.get("f58", "N/A"),
            "最新价(元)": round(data.get("f43", 0)/1000, 3),    # 最新价（收盘价）
            "开盘价(元)": round(data.get("f46", 0)/1000, 3),   # 开盘价
            "最高价(元)": round(data.get("f44", 0)/1000, 3),   # 最高价
            "最低价(元)": round(data.get("f45", 0)/1000, 3),   # 最低价
            "成交量(手)": data.get("f47", 0),                   # 成交量（手）
            "昨收价(元)": round(data.get("f60", 0)/1000, 3)    # 昨日收盘价
        }

    except Exception as e:
        print(f"获取数据失败: {str(e)}")
        return None

# 使用示例
etf_data = get_etf_data("588080")
if etf_data:
    for key, value in etf_data.items():
        print(f"{key}: {value}")