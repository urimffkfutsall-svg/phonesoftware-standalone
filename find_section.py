with open('frontend/src/pages/phonesoftware/PSRepairs.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('\r\n', '\n')

# Find start and end by markers
start = c.find('{/* Customer Section */}')
# Find end - the closing </div> after the customer select
end = c.find('\n            {/* Device Info', start)

print("Start:", start)
print("End:", end)
print("Section length:", end - start)
print("Content:")
print(c[start:end])
