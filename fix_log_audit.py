with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Remove all log_audit calls
import re
c = re.sub(r'\s*await log_audit\([^)]+\)\s*', '\n', c)
c = re.sub(r'\s*log_audit\([^)]+\)\s*', '\n', c)

with open('backend/routers/phonesoftware/tenants.py', 'w', encoding='utf-8') as f:
    f.write(c)

import subprocess, sys
r = subprocess.run([sys.executable, '-m', 'py_compile', 'backend/routers/phonesoftware/tenants.py'], capture_output=True, text=True)
print("Syntax:", "OK" if r.returncode == 0 else r.stderr)
print("Done!")
