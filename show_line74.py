with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    lines = f.read().replace('\r\n', '\n').split('\n')
# Show lines 70-85
for i, l in enumerate(lines[68:88], start=69):
    print(f"{i}: {repr(l)}")
