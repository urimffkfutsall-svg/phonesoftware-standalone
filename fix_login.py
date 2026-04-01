with open('frontend/src/pages/phonesoftware/PSLogin.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('Mobile Repair &amp; Shop Management', 'Aplikacion per menaxhimin e Mobileshop')
c = c.replace('Mobile Repair & Shop Management', 'Aplikacion per menaxhimin e Mobileshop')

register_link = '''
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Nuk keni llogari?{' '}
              <a href="/phonesoftware/register" className="text-[#00a79d] font-semibold hover:underline">
                Regjistrohuni ketu
              </a>
            </p>
          </div>'''

import re
c = re.sub(r'\{/\* Back to home link \*/\}.*?</div>\s*</div>\s*</div>', '</div></div>', c, flags=re.DOTALL)
c = c.replace('      </form>', '      </form>' + register_link)

with open('frontend/src/pages/phonesoftware/PSLogin.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('PSLogin.jsx OK!')
