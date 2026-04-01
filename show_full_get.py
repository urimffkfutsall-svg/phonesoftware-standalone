with open('backend/routers/phonesoftware/tenants.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')

# Find the full GET endpoint and replace it completely
start = c.find('async def get_all_ps_tenants')
end = c.find('\n\n\n@router', start)
if end == -1:
    end = c.find('\n\n@router', start)

print("Old endpoint:")
print(c[start:end])
print("\n\nLENGTH:", end-start)
