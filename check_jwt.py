with open('backend/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
idx = c.find('create_token')
print(c[idx:idx+400])
idx2 = c.find('SECRET')
print(c[idx2-10:idx2+100])
