with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    a = f.read()
a = a.replace('\r\n', '\n')

# 1. Add verifyTenant function before updateTenantStatus
old_fn = "const updateTenantStatus = async (tenantId, status) => {"
new_fn = """const verifyTenant = async (tenantId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      await axios.post(`${API_URL}/api/phonesoftware/auth/admin/tenants/${tenantId}/verify`, {}, {
        headers: getAuthHeaders()
      });
      toast.success('Firma u verifikua me sukses!');
      loadTenants();
    } catch (error) {
      toast.error('Gabim gjate verifikimit');
    }
  };

  const updateTenantStatus = async (tenantId, status) => {"""
a = a.replace(old_fn, new_fn, 1)

# 2. Find the action icons area in the tenant list row and add Verify + Suspend buttons
# Find pattern with edit + delete icons
import re
m = re.search(r'(<button[^>]*title="(Ndrysho|Edit)[^>]*>.*?</button>\s*<button[^>]*title="(Fshi|Delete)[^>]*>.*?</button>)', a, re.DOTALL)
if m:
    old_btns = m.group(0)
    new_btns = """<button
                    type="button"
                    title="Verifiko"
                    onClick={() => verifyTenant(tenant.id)}
                    className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    title={tenant.status === 'suspended' ? 'Aktivizo' : 'Pezullo'}
                    onClick={() => updateTenantStatus(tenant.id, tenant.status === 'suspended' ? 'active' : 'suspended')}
                    className={`p-1.5 rounded ${tenant.status === 'suspended' ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-50' : 'text-orange-500 hover:text-orange-700 hover:bg-orange-50'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tenant.status === 'suspended' ? "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                  </button>
                  """ + old_btns
    a = a.replace(old_btns, new_btns, 1)
    print("Buttons added!")
else:
    print("Pattern not found, searching differently...")
    # Find any delete button in tenant context
    idx = a.find('deleteTenant(tenant.id)')
    if idx > 0:
        print(a[idx-300:idx+100])
    else:
        idx = a.find('onClick={() => deleteTenant')
        print(a[idx-300:idx+100] if idx > 0 else "Not found")

with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'w', encoding='utf-8') as f:
    f.write(a)
print("Done!")
