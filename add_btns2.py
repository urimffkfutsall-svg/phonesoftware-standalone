with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    a = f.read()
a = a.replace('\r\n', '\n')

# Find the delete button block and add verify+suspend before it
import re
m = re.search(r'<button[^>]*onClick=\{[^}]*handleDelete\(tenant\.id\)[^}]*\}[^>]*>.*?</button>', a, re.DOTALL)
if m:
    old_del = m.group(0)
    new_btns = """<button
                  type="button"
                  title="Verifiko"
                  onClick={() => verifyTenant(tenant.id)}
                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  title={tenant.status === 'suspended' ? 'Aktivizo' : 'Pezullo'}
                  onClick={() => updateTenantStatus(tenant.id, tenant.status === 'suspended' ? 'active' : 'suspended')}
                  className={`p-1 rounded ${tenant.status === 'suspended' ? 'text-blue-600 hover:bg-blue-100' : 'text-orange-500 hover:bg-orange-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tenant.status === 'suspended' ? "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
                  </svg>
                </button>
                """ + old_del
    a = a.replace(old_del, new_btns, 1)
    print("Buttons added successfully!")
else:
    print("Pattern not found!")
    idx = a.find('handleDelete')
    print(a[idx-200:idx+200])

with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'w', encoding='utf-8') as f:
    f.write(a)
