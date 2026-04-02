with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    a = f.read()
a = a.replace('\r\n', '\n')

# Find the action buttons for each tenant row and add verify/suspend
# Look for the edit and delete buttons pattern
import re

# Find existing icon buttons area (edit pencil + delete trash buttons)
old_btns = a[a.find('axios.post(`${API_URL}/api/phonesoftware/auth/admin/tenants/${tenantId}/verify'):]
print("VERIFY CALL EXISTS:", 'verify' in a)
print("SUSPEND CALL EXISTS:", 'suspend' in a.lower() or 'status' in a)

# Find the buttons row in the tenant list
idx = a.find('toast.error')
print("\nSample area:")
idx2 = a.find('<button', a.find('deleteTenant') - 500 if 'deleteTenant' in a else 0)
print(a[idx2:idx2+500] if idx2 > 0 else "No button found near deleteTenant")
