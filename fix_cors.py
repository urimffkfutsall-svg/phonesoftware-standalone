with open('backend/server.py', 'r', encoding='utf-8') as f:
    c = f.read()

old = '''app.add_middleware(
CORSMiddleware,
allow_origins=["*"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)'''

new = '''app.add_middleware(
CORSMiddleware,
allow_origins=[
    "https://phonesoftware-frontend.onrender.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "*"
],
allow_credentials=False,
allow_methods=["*"],
allow_headers=["*"],
)'''

c = c.replace(old, new)
with open('backend/server.py', 'w', encoding='utf-8') as f:
    f.write(c)
print('server.py fixed!')
