with open('frontend/src/App.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Remove duplicate import
duplicate = "import PSRegister from './pages/phonesoftware/PSRegister';\nimport PSRegister from './pages/phonesoftware/PSRegister';"
single = "import PSRegister from './pages/phonesoftware/PSRegister';"
c = c.replace(duplicate, single)

# Remove duplicate route if any
duplicate_route = '<Route path="/phonesoftware/register" element={<PSRegister />} />\n<Route path="/phonesoftware/register" element={<PSRegister />} />'
single_route = '<Route path="/phonesoftware/register" element={<PSRegister />} />'
c = c.replace(duplicate_route, single_route)

with open('frontend/src/App.js', 'w', encoding='utf-8') as f:
    f.write(c)
print('App.js fixed!')
