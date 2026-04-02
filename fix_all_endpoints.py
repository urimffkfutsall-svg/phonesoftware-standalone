with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Find all uses of Depends(get_ps_current_user) and replace with Request inline
import re

# Replace all endpoint signatures that use Depends(get_ps_current_user)
c = re.sub(
    r'async def (\w+)\(([^)]*?)current_user: dict = Depends\(get_ps_current_user\)([^)]*?)\):',
    lambda m: f'async def {m.group(1)}({m.group(2)}request: Request{m.group(3)}):\n    current_user = await _verify_super_admin(request)',
    c
)

# Add helper function before first @router
helper = """
async def _verify_super_admin(request: Request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token mungon")
    token = auth_header.split(" ")[1]
    try:
        secret = _os.environ.get("JWT_SECRET", "phonesoftware_secret_key")
        payload = _jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalid")
        user = await ps_users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            user = await _db_module.pos_users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.get("role") != "super_admin":
            raise HTTPException(status_code=403, detail="Super Admin only")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token error: {str(e)}")

"""

idx = c.find('\n@router')
c = c[:idx] + '\n' + helper + c[idx:]

with open('backend/routers/phonesoftware/tenants.py', 'w', encoding='utf-8') as f:
    f.write(c)

import subprocess, sys
r = subprocess.run([sys.executable, '-m', 'py_compile', 'backend/routers/phonesoftware/tenants.py'], capture_output=True, text=True)
print("Syntax:", "OK" if r.returncode == 0 else r.stderr)
