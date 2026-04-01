# Fix 1: PSAdmin URL
with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace(
    '`${API_URL}/api/phonesoftware/tenants`',
    '`${API_URL}/api/phonesoftware/admin/tenants`'
)
with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("PSAdmin URL fixed!")

# Fix 2: Auth - auto verify on register
with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Auto-verify user on register
old_insert = '''    await ps_users.insert_one({'''
# Find the user insert in register and add email_verified: True
# First find the register function
import re
# Add email_verified=True to user creation
c = c.replace(
    '"email_verified": False,',
    '"email_verified": True,'
)
# If not found, try without quotes style
c = c.replace(
    "'email_verified': False,",
    "'email_verified': True,"
)

with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)
print("Auth auto-verify fixed!")

# Fix 3: PSRegister - show success page
with open('frontend/src/pages/phonesoftware/PSRegister.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Find success state - add registered state
old_state = "const [loading, setLoading] = useState(false);"
new_state = "const [loading, setLoading] = useState(false);\n  const [registered, setRegistered] = useState(false);"
c = c.replace(old_state, new_state)

# Find where it navigates after success and replace with setRegistered(true)
# Look for navigate after successful registration
c = c.replace(
    "navigate('/phonesoftware/login')",
    "setRegistered(true)"
)
c = c.replace(
    'navigate("/phonesoftware/login")',
    'setRegistered(true)'
)

# Add success screen before the return
old_return = "  return (\n    <div"
new_return = """  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00a79d]/10 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-5">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Regjistrimi u krye me sukses!</h2>
          <p className="text-gray-600">Jeni regjistruar me sukses n\u00eb planin prej <strong>30 dit\u00eb falas</strong>.</p>
          <p className="text-gray-500 text-sm">Faleminderit q\u00eb zgjodhët PhoneSoftware!</p>
          <button
            onClick={() => navigate('/phonesoftware/login')}
            className="w-full bg-[#00a79d] hover:bg-[#008f86] text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Kyqu k\u00ebtu \u2192
          </button>
        </div>
      </div>
    );
  }

  return (
    <div"""

c = c.replace(old_return, new_return, 1)

with open('frontend/src/pages/phonesoftware/PSRegister.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("PSRegister success page added!")
