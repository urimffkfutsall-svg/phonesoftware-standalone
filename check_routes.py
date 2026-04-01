with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
# Find register
idx = c.find('async def register')
print(c[idx:idx+600])
print("\n\n---TENANTS ROUTE---")
idx2 = c.find('/tenants')
print(c[idx2-100:idx2+200])
