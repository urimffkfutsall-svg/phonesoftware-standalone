with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
# Find register endpoint
idx = c.find('async def register')
print(c[idx:idx+1500])
