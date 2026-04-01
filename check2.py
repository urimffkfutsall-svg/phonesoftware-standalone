# Check PSLogin href
with open('frontend/src/pages/phonesoftware/PSLogin.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('register')
print('PSLogin register link:')
print(c[idx-20:idx+60])

# Check auth.py super_admin fix
with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('super_admin')
print('\nauth.py super_admin check:')
print(c[idx-10:idx+200])
