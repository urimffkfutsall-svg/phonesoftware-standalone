with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
idx = c.find('def login')
if idx == -1:
    idx = c.find('/login')
print(c[idx:idx+800])
