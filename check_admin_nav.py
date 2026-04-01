with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
# Find navigate and error handling
idx = c.find('navigate')
while idx != -1:
    print(c[idx-50:idx+120])
    print("---")
    idx = c.find('navigate', idx+1)
