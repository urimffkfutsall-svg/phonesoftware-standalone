import subprocess
import sys

# Check all files for syntax errors
files = [
    'backend/server.py',
    'backend/auth.py',
    'backend/routers/phonesoftware/auth.py',
    'backend/routers/phonesoftware/tenants.py',
]
for f in files:
    result = subprocess.run([sys.executable, '-m', 'py_compile', f], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"OK: {f}")
    else:
        print(f"ERROR: {f} -> {result.stderr}")

# Check get_ps_current_user exists
with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
print("\nget_ps_current_user in auth.py:", 'get_ps_current_user' in c)

# Check tenants.py imports
with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
print("tenants imports:")
print(c[:600])
