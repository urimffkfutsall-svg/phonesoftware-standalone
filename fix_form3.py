with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Normalize line endings
c = c.replace('\r\n', '\n').replace('\r', '\n')

old_customer = '''            {/* Customer Section */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Klienti (opsional)</Label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useManualCustomer}
                    onChange={(e) => {
                      setUseManualCustomer(e.target.checked);
                      if (e.target.checked) {
                        setFormData({...formData, customer_id: ''});
                      } else {
                        setFormData({...formData, customer_name: '', customer_phone: ''});
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-600">Sh\u00ebno manualisht</span>
                </label>
              </div>

              {useManualCustomer ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      placeholder="Emri i klientit"
                    />
                  </div>
                  <div>
                    <Input
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                      placeholder="Telefoni"
                    />
                  </div>
                </div>
              ) : (
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData({...formData, customer_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Zgjidhni klientin (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>'''

new_customer = '''            {/* Klienti Section */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-sm font-semibold text-[#00a79d] uppercase tracking-wide border-b pb-1">Klienti</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Klienti *</Label>
                  <Input value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} placeholder="Emri i klientit" />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Numri tel *</Label>
                  <Input value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} placeholder="Numri kontaktues" />
                </div>
              </div>
              <button type="button" onClick={() => {
                const found = customers.find(cu => cu.phone?.includes(formData.customer_phone) || cu.full_name?.toLowerCase().includes(formData.customer_name.toLowerCase()));
                if (found) { setFormData({...formData, customer_id: found.id, customer_name: found.full_name, customer_phone: found.phone}); toast.success("Klienti u gjet!"); }
                else { toast.info("Klienti i ri do t\u00eb krijohet."); }
              }} className="bg-[#00a79d] hover:bg-[#008f86] text-white px-4 py-1.5 rounded-lg text-xs font-medium">
                Zgjedh/shto klientin
              </button>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-[#00a79d] uppercase tracking-wide border-b pb-1 mb-1">Puna ne</h3>
            </div>'''

# Also fix DialogTitle
c = c.replace(
    '<DialogTitle className="flex items-center gap-2">\n              <Wrench className="h-5 w-5 text-[#00a79d]" />\n              Riparim i Ri\n            </DialogTitle>',
    '<DialogTitle className="text-lg font-bold">Registro pun\u00ebn</DialogTitle>'
)

if old_customer in c:
    c = c.replace(old_customer, new_customer)
    print("SUCCESS!")
else:
    print("Still not found")
    idx = c.find('Customer Section')
    print(repr(c[idx:idx+300]))

with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
