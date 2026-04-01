with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('send_verification_email')
print(repr(c[idx:idx+400]))
