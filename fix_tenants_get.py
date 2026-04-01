with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Replace the import - remove log_audit dependency
c = c.replace(
    'from auth import hash_password, log_audit\nfrom .auth import get_ps_current_user',
    'from auth import hash_password\nimport jwt as _jwt\nimport os as _os\nimport database as _db_module'
)

# Replace the GET endpoint to use simple inline auth
old_get = 'async def get_all_ps_tenants(current_user: dict = Depends(get_ps_current_user)):'
new_get = '''async def get_all_ps_tenants(request: Request):
    # Manual token verification
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token mungon")
    token = auth_header.split(" ")[1]
    try:
        secret = _os.environ.get("JWT_SECRET", "phonesoftware_secret_key")
        payload = _jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
        user = await ps_users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            user = await _db_module.pos_users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        current_user = user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
    check_super_admin(current_user)'''

if old_get in c:
    c = c.replace(old_get, new_get)
    print("GET endpoint fixed!")
else:
    print("Pattern not found - searching...")
    idx = c.find('get_all_ps_tenants')
    print(repr(c[idx-50:idx+150]))

# Add Request import
c = c.replace(
    'from fastapi import APIRouter, HTTPException, Depends',
    'from fastapi import APIRouter, HTTPException, Depends, Request'
)

with open('backend/routers/phonesoftware/tenants.py', 'w', encoding='utf-8') as f:
    f.write(c)
print("Done!")
