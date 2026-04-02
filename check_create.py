with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
# Find the create repair axios.post call
idx = c.find('const handleCreateRepair')
if idx < 0:
    idx = c.find('const handleSubmit')
if idx < 0:
    # search for the post to repairs endpoint
    import re
    m = re.search(r'axios\.post\([^)]*repair', c)
    if m:
        idx = m.start() - 500
print(c[idx:idx+1500])
