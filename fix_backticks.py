# Fix PSAdmin.jsx
with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'await axios.post(/api/phonesoftware/auth/admin/tenants//verify',
    'await axios.post(${API_URL}/api/phonesoftware/auth/admin/tenants//verify'
)

with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('PSAdmin fixed!')

# Fix PSRegister.jsx
with open('frontend/src/pages/phonesoftware/PSRegister.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'await axios.post(/api/phonesoftware/auth/register, form)',
    'await axios.post(${API_URL}/api/phonesoftware/auth/register, form)'
)

with open('frontend/src/pages/phonesoftware/PSRegister.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('PSRegister fixed!')
