with open('frontend/src/App.js', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('\r\n', '\n')
c = c.replace('BrowserRouter', 'HashRouter')
c = c.replace("from 'react-router-dom'", "from 'react-router-dom'")
# Make sure HashRouter is imported
if 'HashRouter' not in c:
    c = c.replace('import { BrowserRouter', 'import { HashRouter')
print("HashRouter in file:", 'HashRouter' in c)
with open('frontend/src/App.js', 'w', encoding='utf-8') as f:
    f.write(c)
print("Done!")
