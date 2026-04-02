# Fix 1: Remove email verification check from login
with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

import re
# Remove all email_verified/admin_verified blocks
c = re.sub(
    r'\s*email_verified = user\.get\("email_verified", False\)\s*\n\s*admin_verified = user\.get\("admin_verified", False\)\s*\n\s*if not email_verified and not admin_verified:\s*\n\s*raise HTTPException\(status_code=403[^\n]+\)\s*\n',
    '\n',
    c
)

with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)

import subprocess, sys
r = subprocess.run([sys.executable, '-m', 'py_compile', 'backend/routers/phonesoftware/auth.py'], capture_output=True, text=True)
print("auth.py syntax:", "OK" if r.returncode == 0 else r.stderr)
