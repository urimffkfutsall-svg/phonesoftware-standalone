# Fix auth.py - remove duplicate empty if on line 74
with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    lines = f.read().replace('\r\n', '\n').split('\n')

# Remove line 74 (index 73) - the duplicate empty if
del lines[73]

content = '\n'.join(lines)
with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(content)

import subprocess, sys
r = subprocess.run([sys.executable, '-m', 'py_compile', 'backend/routers/phonesoftware/auth.py'], capture_output=True, text=True)
print("auth.py syntax:", "OK" if r.returncode == 0 else r.stderr)
