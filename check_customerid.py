with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
# Find where customer_id is set
import re
for m in re.finditer(r'customer_id[^\n]{0,100}', c):
    print(m.group())
    print("---")
