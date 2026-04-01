with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

start = 17297
end = 19727

new_section = '''{/* Klienti Section */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-semibold text-[#00a79d] uppercase tracking-wide border-b border-[#00a79d]/30 pb-1">Klienti</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Klienti *</Label>
                  <Input value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} placeholder="Emri i klientit" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Numri tel *</Label>
                  <Input value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} placeholder="Numri kontaktues" />
                </div>
              </div>
              <button type="button" onClick={() => {
                const found = customers.find(cu => cu.phone?.includes(formData.customer_phone) || cu.full_name?.toLowerCase().includes(formData.customer_name?.toLowerCase()));
                if (found) { setFormData({...formData, customer_id: found.id, customer_name: found.full_name, customer_phone: found.phone}); toast.success("Klienti u gjet!"); }
                else { toast.info("Klienti i ri do t\u00eb krijohet automatikisht."); }
              }} className="bg-[#00a79d] hover:bg-[#008f86] text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors">
                Zgjedh/shto klientin
              </button>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-[#00a79d] uppercase tracking-wide border-b border-[#00a79d]/30 pb-1">Puna ne</h3>
            </div>

            '''

c = c[:start] + new_section + c[end:]

# Also fix DialogTitle
c = c.replace(
    'Riparim i Ri',
    'Registro pun\u00ebn'
)
c = c.replace(
    '<DialogTitle className="flex items-center gap-2">',
    '<DialogTitle className="text-lg font-bold text-gray-900">'
)
c = c.replace(
    '<Wrench className="h-5 w-5 text-[#00a79d]" />\n              ',
    ''
)

with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("SUCCESS! File updated.")
