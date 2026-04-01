with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
# Find the form/dialog section
idx = c.find('showDialog')
print(c[idx:idx+3000])
