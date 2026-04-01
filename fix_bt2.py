with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '/api/phonesoftware/auth/admin/tenants/' in line and '/verify' in line and '`' not in line:
        lines[i] = '    await axios.post(`' + '${API_URL}' + '/api/phonesoftware/auth/admin/tenants/' + '${tenantId}' + '/verify`' + ', {}, {\n'
        print(f'Fixed PSAdmin line {i+1}')

with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

with open('frontend/src/pages/phonesoftware/PSRegister.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '/api/phonesoftware/auth/register' in line and '`' not in line and 'axios.post' in line:
        lines[i] = '      await axios.post(`' + '${API_URL}' + '/api/phonesoftware/auth/register`' + ', form);\n'
        print(f'Fixed PSRegister line {i+1}')

with open('frontend/src/pages/phonesoftware/PSRegister.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Done!')
