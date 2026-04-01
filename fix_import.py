with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Add back the import
c = c.replace(
    'from auth import hash_password\nimport jwt as _jwt\nimport os as _os\nimport database as _db_module',
    'from auth import hash_password\nimport jwt as _jwt\nimport os as _os\nimport database as _db_module\nfrom .auth import get_ps_current_user'
)

with open('backend/routers/phonesoftware/tenants.py', 'w', encoding='utf-8') as f:
    f.write(c)
print("Fixed!")
