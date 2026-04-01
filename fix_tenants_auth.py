# Fix 1: Revert PSAdmin URL back to correct route
with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace(
    '`${API_URL}/api/phonesoftware/admin/tenants`',
    '`${API_URL}/api/phonesoftware/tenants`'
)
with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("PSAdmin URL reverted!")

# Fix 2: tenants.py - replace main get_current_user with PS-specific check
with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Replace import
c = c.replace(
    'from auth import hash_password, get_current_user, log_audit',
    'from auth import hash_password, log_audit\nfrom .auth import get_ps_current_user'
)

# Replace all Depends(get_current_user) with Depends(get_ps_current_user)
c = c.replace(
    'Depends(get_current_user)',
    'Depends(get_ps_current_user)'
)

with open('backend/routers/phonesoftware/tenants.py', 'w', encoding='utf-8') as f:
    f.write(c)
print("tenants.py auth updated!")

# Fix 3: Add get_ps_current_user to auth.py
with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

if 'get_ps_current_user' not in c:
    inject = '''
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt as pyjwt

_bearer = HTTPBearer(auto_error=False)

async def get_ps_current_user(credentials: HTTPAuthorizationCredentials = Depends(_bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Token mungon")
    try:
        secret = os.environ.get("JWT_SECRET", "phonesoftware_secret_2024")
        payload = pyjwt.decode(credentials.credentials, secret, algorithms=["HS256"])
        user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalid")
        user = await ps_users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Perdoruesi nuk u gjet")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token invalid: {str(e)}")

'''
    # Insert after imports
    idx = c.find('\nasync def ')
    c = c[:idx] + inject + c[idx:]
    print("get_ps_current_user added!")
else:
    print("get_ps_current_user already exists!")

with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)
