import base64
with open('tenants_b64.txt','r') as f:
    data = f.read().strip()
with open('backend/routers/phonesoftware/tenants.py','wb') as f:
    f.write(base64.b64decode(data))
import subprocess,sys
r=subprocess.run([sys.executable,'-m','py_compile','backend/routers/phonesoftware/tenants.py'],capture_output=True,text=True)
print('Syntax:','OK' if r.returncode==0 else r.stderr)
