with open('frontend/src/pages/phonesoftware/PSLayout.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
# Find auth/token check
idx = c.find('ps_token')
while idx != -1:
    print(c[idx-30:idx+150])
    print("---")
    idx = c.find('ps_token', idx+1)
