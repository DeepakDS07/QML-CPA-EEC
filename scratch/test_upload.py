import requests

url = "http://127.0.0.1:8000/upload-dataset"
csv_data = """InvoiceNo,StockCode,Description,Quantity,InvoiceDate,UnitPrice,CustomerID,Country
536365,85123A,WHITE HANGING HEART T-LIGHT HOLDER,6,2010-12-01 08:26:00,2.55,17850,United Kingdom
536365,71053,WHITE METAL LANTERN,6,2010-12-01 08:26:00,3.39,17850,United Kingdom
536367,84029G,KNITTED UNION FLAG FLANNEL,6,2010-12-01 08:34:00,3.39,13047,United Kingdom
"""

files = {'file': ('sample.csv', csv_data, 'text/csv')}
data = {'simulator_type': 'ideal'}

res = requests.post(url, files=files, data=data)
print("Status Code:", res.status_code)
if res.status_code == 200:
    json_data = res.json()
    print("Status:", json_data.get("status"))
    print("Total Customers Analyzed:", json_data.get("summary", {}).get("total_customers"))
    print("Revenue at Risk ($):", json_data.get("summary", {}).get("potential_revenue_at_risk_usd"))
    print("Top at risk customers:", len(json_data.get("top_at_risk_customers", [])))
else:
    print("Error output:", res.text)
