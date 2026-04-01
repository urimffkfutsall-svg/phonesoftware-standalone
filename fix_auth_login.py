# Fix 1: Backend - skip verification for super_admin
with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()

old = '''    email_verified = user.get("email_verified", False)
    admin_verified = user.get("admin_verified", False)
    if not email_verified and not admin_verified:
        raise HTTPException(status_code=403, detail="Llogaria nuk eshte verifikuar. Kontrolloni emailin tuaj.")'''

new = '''    if user.get("role") != "super_admin":
        email_verified = user.get("email_verified", False)
        admin_verified = user.get("admin_verified", False)
        if not email_verified and not admin_verified:
            raise HTTPException(status_code=403, detail="Llogaria nuk eshte verifikuar. Kontrolloni emailin tuaj.")'''

c = c.replace(old, new)
with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)
print('auth.py fixed!')

# Fix 2: PSLogin - fix register link href for HashRouter
with open('frontend/src/pages/phonesoftware/PSLogin.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'href="/phonesoftware/register"',
    'href="/#/phonesoftware/register"'
)
c = c.replace(
    "href='/phonesoftware/register'",
    "href='/#/phonesoftware/register'"
)

with open('frontend/src/pages/phonesoftware/PSLogin.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('PSLogin.jsx fixed!')
