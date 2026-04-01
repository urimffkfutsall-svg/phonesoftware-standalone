with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

start = c.find('async def get_all_ps_tenants')
end = c.find('\n\n\n@router', start)
if end == -1:
    end = c.find('\n\n@router', start)

new_endpoint = '''async def get_all_ps_tenants(request: Request):
    """Get all tenants - Super Admin only"""
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
        current_user = await ps_users.find_one({"id": user_id}, {"_id": 0})
        if not current_user:
            current_user = await _db_module.pos_users.find_one({"id": user_id}, {"_id": 0})
        if not current_user:
            raise HTTPException(status_code=401, detail="User not found")
        if current_user.get("role") != "super_admin":
            raise HTTPException(status_code=403, detail="Super Admin only")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token error: {str(e)}")

    tenants = await ps_tenants.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for tenant in tenants:
        tenant["users_count"] = await ps_users.count_documents({"tenant_id": tenant["id"]})
        tenant["repairs_count"] = await ps_repairs.count_documents({"tenant_id": tenant["id"]})
    return tenants'''

c = c[:start] + new_endpoint + c[end:]

with open('backend/routers/phonesoftware/tenants.py', 'w', encoding='utf-8') as f:
    f.write(c)
print("Endpoint rewritten!")

# Verify syntax
import subprocess, sys
r = subprocess.run([sys.executable, '-m', 'py_compile', 'backend/routers/phonesoftware/tenants.py'], capture_output=True, text=True)
print("Syntax:", "OK" if r.returncode == 0 else r.stderr)
