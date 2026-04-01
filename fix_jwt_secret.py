with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
c = c.replace(
    '"phonesoftware_secret_2024"',
    '"phonesoftware_secret_key"'
)
with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)
print("JWT secret fixed!")
