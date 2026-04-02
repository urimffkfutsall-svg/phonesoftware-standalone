with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
# Find all axios calls
import re
for m in re.finditer(r'axios\.(post|put|delete|get)\([^)]+\)', c):
    print(m.group())
    print("---")
