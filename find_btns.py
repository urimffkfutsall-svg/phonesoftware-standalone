with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    a = f.read()
a = a.replace('\r\n', '\n')
import re
# Find all onClick patterns with tenant actions
for m in re.finditer(r'onClick=\{[^}]*[Tt]enant[^}]*\}', a):
    print(m.group())
    print("---")
