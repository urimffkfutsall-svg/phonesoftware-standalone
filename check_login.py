with open('frontend/src/pages/phonesoftware/PSLogin.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
idx = c.find('async')
print(c[idx:idx+600])
