import json
with open('frontend/package.json', 'r', encoding='utf-8') as f:
    pkg = json.load(f)

# Disable code signing
pkg['build']['win']['signAndEditExecutable'] = False
pkg['build']['win']['certificateSubjectName'] = None
pkg['build']['forceCodeSigning'] = False

with open('frontend/package.json', 'w', encoding='utf-8') as f:
    json.dump(pkg, f, indent=2)
print("Code signing disabled!")
