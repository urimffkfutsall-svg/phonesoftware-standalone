with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
# Show all async def functions
import re
for m in re.finditer(r'async def \w+\([^)]*\):', c):
    print(m.group())
    print("---")
