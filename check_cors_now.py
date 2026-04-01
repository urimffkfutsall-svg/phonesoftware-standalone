with open('backend/server.py', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('CORSMiddleware')
print(c[idx-10:idx+300])
