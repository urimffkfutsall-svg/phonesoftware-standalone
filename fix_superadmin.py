# Fix 1: get_ps_current_user - check both collections
with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

old_func = '''async def get_ps_current_user(credentials: _HTTPCreds = Depends(_ps_bearer)):
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
        raise HTTPException(status_code=401, detail=f"Token invalid: {str(e)}")'''

new_func = '''async def get_ps_current_user(credentials: _HTTPCreds = Depends(_ps_bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Token mungon")
    try:
        import jwt as pyjwt
        import database as db_module
        secret = os.environ.get("JWT_SECRET", "phonesoftware_secret_2024")
        payload = pyjwt.decode(credentials.credentials, secret, algorithms=["HS256"])
        user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalid")
        # Check ps_users first, then pos_users (super_admin)
        user = await ps_users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            user = await db_module.pos_users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Perdoruesi nuk u gjet")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token invalid: {str(e)}")'''

if old_func in c:
    c = c.replace(old_func, new_func)
    print("get_ps_current_user fixed!")
else:
    print("Pattern not found - appending fix...")
    c = c.replace(
        'user = await ps_users.find_one({"id": user_id}, {"_id": 0})\n        if not user:\n            raise HTTPException(status_code=401, detail="Perdoruesi nuk u gjet")',
        'user = await ps_users.find_one({"id": user_id}, {"_id": 0})\n        if not user:\n            import database as db_module\n            user = await db_module.pos_users.find_one({"id": user_id}, {"_id": 0})\n        if not user:\n            raise HTTPException(status_code=401, detail="Perdoruesi nuk u gjet")'
    )
    print("Inline fix applied!")

with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)

# Fix 2: PSLayout - add super_admin to nav and admin route
with open('frontend/src/pages/phonesoftware/PSLayout.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Add super_admin to all nav roles
c = c.replace("'admin', 'manager'", "'super_admin', 'admin', 'manager'")
c = c.replace("'admin', 'manager', 'staff'", "'super_admin', 'admin', 'manager', 'staff'")
c = c.replace("'admin', 'manager', 'technician', 'staff', 'worker'", "'super_admin', 'admin', 'manager', 'technician', 'staff', 'worker'")

# Add Admin nav item after the last navItem
import re
c = c.replace(
    "{ path: '/phonesoftware/reports', icon: BarChart3, label: 'Raportet', roles: ['super_admin', 'admin', 'manager'] },",
    "{ path: '/phonesoftware/reports', icon: BarChart3, label: 'Raportet', roles: ['super_admin', 'admin', 'manager'] },\n  { path: '/phonesoftware/admin', icon: UserCog, label: 'Super Admin', roles: ['super_admin'] },"
)

with open('frontend/src/pages/phonesoftware/PSLayout.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("PSLayout super_admin fixed!")
