with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('<DialogContent className="sm:max-w-2xl')
print(repr(c[idx:idx+600]))
