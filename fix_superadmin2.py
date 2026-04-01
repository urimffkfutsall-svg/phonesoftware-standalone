with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Find and fix - skip verification for super_admin role in ps_users
old = '    if not user.get("is_active", True):\n        raise HTTPException(status_code=401, detail="Llogaria eshte e caktivizuar")'
new = '''    if user.get("role") == "super_admin":
        token = create_token(
            user_id=user["id"],
            username=user.get("username", ""),
            role="super_admin",
            tenant_id=None
        )
        created_at = user.get("created_at")
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()
        return PSTokenResponse(
            access_token=token,
            user=PSUserResponse(
                id=user["id"],
                username=user["username"],
                full_name=user.get("full_name", "Super Administrator"),
                role=PSUserRole.SUPER_ADMIN,
                is_active=True,
                tenant_id=None,
                created_at=created_at or datetime.now(timezone.utc).isoformat()
            )
        )
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Llogaria eshte e caktivizuar")'''

if old in c:
    c = c.replace(old, new)
    print('auth.py fixed!')
else:
    print('String not found! Searching...')
    idx = c.find('is_active')
    print(repr(c[idx-50:idx+100]))

with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)
