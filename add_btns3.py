with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    a = f.read()
a = a.replace('\r\n', '\n')

old_str = """<Button
variant="outline"
size="sm"
className="text-red-500 hover:bg-red-50"
onClick={() => handleDelete(tenant.id)}
>
<Trash2 className="h-4 w-4" />
</Button>"""

# Find exact whitespace version
import re
m = re.search(r'(<Button\s+variant="outline"\s+size="sm"\s+className="text-red-500[^"]*"\s+onClick=\{[^}]*handleDelete\(tenant\.id\)[^}]*\}\s*>\s*<Trash2[^/]*/>\s*</Button>)', a, re.DOTALL)
if m:
    old_del = m.group(1)
    indent = "                "
    new_btns = indent + """<Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:bg-green-50"
                onClick={() => verifyTenant(tenant.id)}
                title="Verifiko"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={tenant.status === 'suspended' ? 'text-blue-600 hover:bg-blue-50' : 'text-orange-500 hover:bg-orange-50'}
                onClick={() => updateTenantStatus(tenant.id, tenant.status === 'suspended' ? 'active' : 'suspended')}
                title={tenant.status === 'suspended' ? 'Aktivizo' : 'Pezullo'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tenant.status === 'suspended' ? "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" : "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
                </svg>
              </Button>
              """ + old_del
    a = a.replace(old_del, new_btns, 1)
    print("Buttons added!")
else:
    print("Not found with regex")
    # Try simple find
    idx = a.find('className="text-red-500 hover:bg-red-50"')
    print(a[idx-100:idx+200])

with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'w', encoding='utf-8') as f:
    f.write(a)
