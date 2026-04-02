# Fix IndentationError - add pass after empty if blocks
with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

import re
# Replace empty if blocks with pass
c = re.sub(r'(if [^\n]+:\n)(\n)', r'\1    pass\n\2', c)

# Also simply remove the email_verified check differently - just comment it out
c = c.replace(
    'if not email_verified and not admin_verified:',
    'if False:  # email verification disabled'
)

with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)

import subprocess, sys
r = subprocess.run([sys.executable, '-m', 'py_compile', 'backend/routers/phonesoftware/auth.py'], capture_output=True, text=True)
print("auth.py syntax:", "OK" if r.returncode == 0 else r.stderr)

# Find tenant action buttons in PSAdmin
with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    a = f.read()
a = a.replace('\r\n', '\n')

# Find the tenant list buttons (edit/delete icons in list)
idx = a.find('verifyTenant')
print("\nVERIFY FUNCTION:")
print(a[idx:idx+300])
idx2 = a.find('suspendTenant') if 'suspendTenant' in a else a.find('updateTenantStatus')
print("\nSUSPEND/STATUS FUNCTION:")
print(a[idx2:idx2+300])
