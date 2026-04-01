with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('<DialogContent')
print(c[idx:idx+4000])
