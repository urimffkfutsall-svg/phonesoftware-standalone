with open('package.json', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('"main": "electron.js"', '"main": "public/electron.js"')
with open('package.json', 'w', encoding='utf-8') as f:
    f.write(c)
print('U ndryshua!')
