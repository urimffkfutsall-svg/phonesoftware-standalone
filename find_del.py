with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    a = f.read()
a = a.replace('\r\n', '\n')

idx = a.find('handleDelete(tenant.id)')
if idx > 0:
    print("CONTEXT:")
    print(a[idx-400:idx+200])
else:
    print("Not found - searching variants...")
    import re
    for m in re.finditer(r'handleDelete', a):
        print(f"At {m.start()}:", a[m.start()-50:m.start()+100])
        print("---")
