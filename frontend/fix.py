with open('electron.js', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("https://www.datapos.pro", "https://phonesoftware-frontend.onrender.com")
c = c.replace("title: 'DataPOS'", "title: 'PhoneSoftware'")
c = c.replace("datapos.pro", "onrender.com")
with open('electron.js', 'w', encoding='utf-8') as f:
    f.write(c)

with open('package.json', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('"name": "datapos"', '"name": "phonesoftware"')
c = c.replace('"description": "DataPOS - Sistemi POS Multi-Tenant"', '"description": "PhoneSoftware - Mobile Repair Management"')
c = c.replace('"author": "DataPOS"', '"author": "PhoneSoftware"')
c = c.replace('"com.datapos.app"', '"com.phonesoftware.app"')
c = c.replace('"productName": "DataPOS"', '"productName": "PhoneSoftware"')
c = c.replace('"shortcutName": "DataPOS"', '"shortcutName": "PhoneSoftware"')
with open('package.json', 'w', encoding='utf-8') as f:
    f.write(c)

print('U ndryshua me sukses!')
