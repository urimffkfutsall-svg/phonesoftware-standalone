with open('frontend/src/pages/phonesoftware/PSAdmin.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
print('PSAdmin line 279:')
for i in range(275, 283):
    print(f'{i+1}: {repr(lines[i])}')

with open('frontend/src/pages/phonesoftware/PSRegister.jsx', 'r', encoding='utf-8') as f:
    lines2 = f.readlines()
print('\nPSRegister line 28:')
for i in range(24, 32):
    print(f'{i+1}: {repr(lines2[i])}')
