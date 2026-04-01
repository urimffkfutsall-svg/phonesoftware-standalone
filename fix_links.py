with open('frontend/src/pages/phonesoftware/PSRegister.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix login link
c = c.replace('href="/phonesoftware/login"', 'href="/#/phonesoftware/login"')
c = c.replace("href='/phonesoftware/login'", "href='/#/phonesoftware/login'")

# Also fix navigate - use window.location instead of useNavigate for safety
c = c.replace(
    "onClick={() => navigate('/phonesoftware/login')}",
    "onClick={() => window.location.href='/#/phonesoftware/login'}"
)

with open('frontend/src/pages/phonesoftware/PSRegister.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('PSRegister.jsx fixed!')
