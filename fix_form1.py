with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

old = '''<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[#00a79d]" />
            Riparim i Ri
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Section */}
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
                <span className="text-gray-600">Shëno manualisht</span>
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

new = '''<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Registro punën
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Klienti Section */}
          <div>
            <h3 className="text-sm font-semibold text-[#00a79d] uppercase tracking-wide mb-3 border-b pb-1">Klienti</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Klienti *</Label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  placeholder="Emri i klientit"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Numri tel *</Label>
                <Input
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  placeholder="Numri kontaktues"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const found = customers.find(c =>
                  c.phone?.includes(formData.customer_phone) ||
                  c.full_name?.toLowerCase().includes(formData.customer_name.toLowerCase())
                );
                if (found) {
                  setFormData({...formData, customer_id: found.id, customer_name: found.full_name, customer_phone: found.phone});
                  toast.success("Klienti u gjet!");
                } else {
                  toast.info("Klienti i ri do të krijohet automatikisht.");
                }
              }}
              className="mt-2 bg-[#00a79d] hover:bg-[#008f86] text-white px-4 py-1.5 rounded-lg text-xs font-medium"
            >
              Zgjedh/shto klientin
            </button>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* hidden spacer */}
          <div className="md:col-span-2 hidden"></div>'''

if old in c:
    c = c.replace(old, new)
    print("Form header replaced!")
else:
    print("Pattern not found - trying partial match...")
    idx = c.find('<DialogContent className="sm:max-w-2xl')
    print(repr(c[idx:idx+100]))

with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
