with open('backend/server.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace entire CORS middleware block
import re
cors_pattern = r'app\.add_middleware\(\s*CORSMiddleware,.*?\)'
cors_new = '''app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)'''
c = re.sub(cors_pattern, cors_new, c, flags=re.DOTALL)
with open('backend/server.py', 'w', encoding='utf-8') as f:
    f.write(c)
print('server.py CORS fixed!')
print('\nVerification:')
idx = c.find('CORSMiddleware')
print(c[idx-5:idx+150])
