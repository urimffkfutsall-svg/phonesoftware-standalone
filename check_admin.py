with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('loadTenants') 
print(c[idx:idx+300])
idx2 = c.find('/api/phonesoftware/admin')
print(c[idx2-20:idx2+200])
