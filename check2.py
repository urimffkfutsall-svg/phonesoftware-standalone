with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
# Find any login function
import re
for m in re.finditer(r'def \w*login\w*|def \w*Login\w*|email_verified|is_verified', c):
    idx = m.start()
    print(f"Found '{m.group()}' at {idx}:")
    print(c[idx:idx+300])
    print("---")

with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    a = f.read()
a = a.replace('\r\n', '\n')
for m in re.finditer(r'delete|Delete|status|suspend|Suspend|verify|Verify', a):
    idx = m.start()
    print(f"Found '{m.group()}' at {idx}:")
    print(a[idx:idx+100])
    print("---")
    break
