# Check login endpoint for email verification
with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
idx = c.find('async def login')
print("LOGIN ENDPOINT:")
print(c[idx:idx+600])
print("\n\n---")
# Check PSAdmin for existing buttons
with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    a = f.read()
a = a.replace('\r\n', '\n')
# Find action buttons area
idx2 = a.find('deleteTenant')
print("DELETE AREA:")
print(a[idx2-200:idx2+200])
