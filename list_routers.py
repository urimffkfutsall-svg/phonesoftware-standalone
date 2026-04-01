import os
for root, dirs, files in os.walk('backend/routers/phonesoftware'):
    for f in files:
        print(os.path.join(root, f))
