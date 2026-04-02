with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
import re
# Find the submit/save repair function
m = re.search(r'(const handle\w*Submit|const save\w*|const add\w*Repair|const create\w*Repair)[^\n]*\n.{0,2000}', c, re.DOTALL)
if m:
    print(m.group()[:2000])
else:
    # Find axios.post for repairs
    idx = c.find('axios.post')
    while idx > 0:
        snippet = c[idx:idx+400]
        if 'repair' in snippet.lower():
            print(c[idx-200:idx+400])
            print("---")
        idx = c.find('axios.post', idx+1)
