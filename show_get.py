with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Find and show the GET endpoint
idx = c.find('async def get_all_ps_tenants')
print(c[idx:idx+600])
