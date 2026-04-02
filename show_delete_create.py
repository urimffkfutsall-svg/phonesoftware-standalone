with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
# Show delete endpoint
idx = c.find('async def delete_ps_tenant')
print(c[idx:idx+400])
print("\n---CREATE---")
idx2 = c.find('async def create_ps_tenant')
print(c[idx2:idx2+500])
