with open('frontend/src/pages/phonesoftware/PSLayout.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
# Find admin route
idx = c.find('admin')
while idx != -1:
    print(c[idx:idx+100])
    print("---")
    idx = c.find('admin', idx+1)
    if idx > 5000:
        break
