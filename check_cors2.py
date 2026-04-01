with open('backend/server.py', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('add_middleware')
print(c[idx-5:idx+300])
