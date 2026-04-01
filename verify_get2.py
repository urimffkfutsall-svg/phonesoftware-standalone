with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
start = c.find('async def get_all_ps_tenants')
print(c[start:start+800])
