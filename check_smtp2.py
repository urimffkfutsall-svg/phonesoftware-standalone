with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
idx = c.find('smtp.sendmail') 
if idx == -1:
    idx = c.find('SMTP(')
if idx == -1:
    idx = c.find('SMTP_SSL')
print(repr(c[idx-50:idx+200]))
