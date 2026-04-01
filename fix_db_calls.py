with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Remove all get_ps_db() calls and replace with direct ps_tenants
import re

# Fix register endpoint - replace get_ps_db usage
c = c.replace(
    '''    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    await ps_tenants_col.insert_one({''',
    '    await ps_tenants.insert_one({'
)

# Fix verify-email endpoint
c = c.replace(
    '''    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    if user.get("tenant_id"):
        await ps_tenants_col.update_one(''',
    '''    if user.get("tenant_id"):
        await ps_tenants.update_one('''
)

# Fix admin endpoints - all get_ps_db references
c = c.replace(
    '''    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    tenants = await ps_tenants_col.find''',
    '    tenants = await ps_tenants.find'
)
c = c.replace(
    '''    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    await ps_tenants_col.update_one({"id": tenant_id}''',
    '    await ps_tenants.update_one({"id": tenant_id}'
)
c = c.replace(
    '''    from .database import get_ps_db
    db = get_ps_db()
    ps_tenants_col = db["ps_tenants"]
    await ps_tenants_col.delete_one''',
    '    await ps_tenants.delete_one'
)

# Fix any remaining get_ps_db patterns
lines = c.split('\n')
clean_lines = []
skip_next = False
for i, line in enumerate(lines):
    if 'get_ps_db' in line or (skip_next and ('db["ps_tenants"]' in line or '_col = db[' in line)):
        skip_next = 'get_ps_db' in line
        continue
    # Replace ps_tenants_col with ps_tenants
    line = line.replace('ps_tenants_col.', 'ps_tenants.')
    clean_lines.append(line)

c = '\n'.join(clean_lines)

with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)
print('auth.py fixed!')
