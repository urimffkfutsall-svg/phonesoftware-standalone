import os
# Find worker dashboard and repair form files
for root, dirs, files in os.walk('frontend/src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git']]
    for f in files:
        if any(x in f.lower() for x in ['dashboard', 'repair', 'punë', 'pune', 'worker', 'ballina', 'home']):
            print(os.path.join(root, f))
