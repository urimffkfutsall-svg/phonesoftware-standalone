with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the second occurrence of handleAdminVerify function
first = content.find('const handleAdminVerify')
second = content.find('const handleAdminVerify', first + 1)

if second != -1:
    # Find the end of the second function (next blank line after closing brace)
    end = content.find('\n};', second)
    end = end + 3  # include '};' and newline
    content = content[:second] + content[end:]
    print(f'Removed duplicate at position {second}')
else:
    print('No duplicate found')

with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
