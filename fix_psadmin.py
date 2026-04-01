with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Add admin verify button next to the existing buttons in tenant list
old_btn = '''<Button
variant="outline"
size="sm"
className="text-red-500 hover:bg-red-50"
onClick={() => handleDelete(tenant.id)}
>
<Trash2 className="h-4 w-4" />
</Button>'''

new_btn = '''<Button
variant="outline"
size="sm"
className="text-red-500 hover:bg-red-50"
onClick={() => handleDelete(tenant.id)}
>
<Trash2 className="h-4 w-4" />
</Button>
{(!tenant.admin_verified) && (
  <Button
    variant="outline"
    size="sm"
    className="text-teal-600 hover:bg-teal-50 border-teal-300"
    onClick={() => handleAdminVerify(tenant.id)}
    title="Verifiko Firmen (anashkalon email verifikimin)"
  >
    <CheckCircle className="h-4 w-4" />
  </Button>
)}'''

c = c.replace(old_btn, new_btn)

# Add handleAdminVerify function before handleDelete
old_fn = 'const handleDelete = async (tenantId) => {'
new_fn = '''const handleAdminVerify = async (tenantId) => {
  try {
    await axios.post(${API_URL}/api/phonesoftware/auth/admin/tenants//verify, {}, {
      headers: getAuthHeaders()
    });
    toast.success('Firma u verifikua nga administratori!');
    loadTenants();
  } catch (error) {
    toast.error('Gabim gjate verifikimit');
  }
};

const handleDelete = async (tenantId) => {'''

c = c.replace(old_fn, new_fn)

# Also add "pending" status badge
old_badge = "default:\nreturn null;"
new_badge = """case 'pending':
      return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> Pritje</span>;
    default:
      return null;"""
c = c.replace(old_badge, new_badge)

# Add pending stat card - replace "Trial" stat with Pending+Trial combined
old_stat = '<p className="text-2xl font-bold">{tenants.filter(t => t.status === \'trial\').length}</p>\n                <p className="text-sm text-gray-500">Trial</p>'
new_stat = '<p className="text-2xl font-bold">{tenants.filter(t => t.status === \'trial\').length}</p>\n                <p className="text-sm text-gray-500">Trial</p>'
# Keep as is

with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('PSAdmin.jsx OK!')
