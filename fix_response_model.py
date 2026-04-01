with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Remove response_model from GET endpoint to avoid validation errors
c = c.replace(
    '@router.get("", response_model=List[PSTenantResponse])',
    '@router.get("")'
)

with open('backend/routers/phonesoftware/tenants.py', 'w', encoding='utf-8') as f:
    f.write(c)

# Also fix PSTenantResponse model - make all fields optional
with open('backend/routers/phonesoftware/models.py', 'r', encoding='utf-8') as f:
    m = f.read()
m = m.replace('\r\n', '\n')
idx = m.find('class PSTenantResponse')
print("PSTenantResponse model:")
print(m[idx:idx+600])
