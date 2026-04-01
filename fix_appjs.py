with open('frontend/src/App.js', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace(
    "import PSLogin from './pages/phonesoftware/PSLogin';",
    "import PSLogin from './pages/phonesoftware/PSLogin';\nimport PSRegister from './pages/phonesoftware/PSRegister';"
)
c = c.replace(
    '<Route path="/phonesoftware/login" element={<PSLogin />} />',
    '<Route path="/phonesoftware/login" element={<PSLogin />} />\n<Route path="/phonesoftware/register" element={<PSRegister />} />'
)
with open('frontend/src/App.js', 'w', encoding='utf-8') as f:
    f.write(c)
print('App.js OK!')
