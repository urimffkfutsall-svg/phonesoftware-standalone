with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Fix: when customer_id is set, also send customer_name and customer_phone
old = """} else if (formData.customer_id) {
payload.customer_id = formData.customer_id;
}"""

new = """} else if (formData.customer_id) {
payload.customer_id = formData.customer_id;
payload.customer_name = formData.customer_name || null;
payload.customer_phone = formData.customer_phone || null;
}"""

# Try with different whitespace
import re
c_new = re.sub(
    r'(\} else if \(formData\.customer_id\) \{)\s*\n\s*(payload\.customer_id = formData\.customer_id;)\s*\n\s*(\})',
    r'\1\n        payload.customer_id = formData.customer_id;\n        payload.customer_name = formData.customer_name || null;\n        payload.customer_phone = formData.customer_phone || null;\n        \3',
    c
)

if c_new != c:
    print("Fix applied!")
    with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'w', encoding='utf-8') as f:
        f.write(c_new)
else:
    print("Pattern not matched, trying direct search...")
    idx = c.find('payload.customer_id = formData.customer_id;')
    if idx > 0:
        print(c[idx-100:idx+150])
