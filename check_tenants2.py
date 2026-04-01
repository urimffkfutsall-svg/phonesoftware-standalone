with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
# Show the GET endpoint
idx = c.find('@router.get("")')
print(c[idx:idx+400])
print("\n\n---imports---")
print(c[:500])
