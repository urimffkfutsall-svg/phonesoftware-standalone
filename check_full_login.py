with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
idx = c.find('async def ps_login')
print(c[idx:idx+1200])
