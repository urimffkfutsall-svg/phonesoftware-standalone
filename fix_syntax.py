with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Remove the badly injected code
bad_inject = '''
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
c = c.replace(bad_inject, '')

# Now add it correctly at the END of the file (before last export if any)
good_inject = '''

from fastapi.security import HTTPBearer as _HTTPBearer, HTTPAuthorizationCredentials as _HTTPCreds

_ps_bearer = _HTTPBearer(auto_error=False)

async def get_ps_current_user(credentials: _HTTPCreds = Depends(_ps_bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Token mungon")
    try:
        import jwt as pyjwt
        secret = os.environ.get("JWT_SECRET", "phonesoftware_secret_2024")
        payload = pyjwt.decode(credentials.credentials, secret, algorithms=["HS256"])
        user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalid")
        user = await ps_users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Perdoruesi nuk u gjet")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token invalid: {str(e)}")
'''

if 'get_ps_current_user' not in c:
    c = c + good_inject
    print("Added at end!")
else:
    print("Already exists - just cleaned!")

with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)
print("auth.py fixed!")
