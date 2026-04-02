with open('backend/routers/phonesoftware/auth.py', 'r', encoding='utf-8') as f:
    lines = f.read().replace('\r\n', '\n').split('\n')

# Find all empty if blocks and add pass
fixed = []
i = 0
while i < len(lines):
    line = lines[i]
    fixed.append(line)
    # Check if this line ends with : and next non-empty line is at same or lower indent
    stripped = line.rstrip()
    if stripped.endswith(':') and any(kw in stripped for kw in ['if ', 'else:', 'elif ', 'try:', 'except', 'finally:', 'with ', 'for ', 'while ']):
        # Check next line
        if i + 1 < len(lines):
            next_line = lines[i + 1]
            curr_indent = len(line) - len(line.lstrip())
            next_stripped = next_line.strip()
            if next_stripped == '' or (next_line and len(next_line) - len(next_line.lstrip()) <= curr_indent and next_stripped not in ['', '\\']):
                if next_stripped == '' or (len(next_line.lstrip()) > 0 and len(next_line) - len(next_line.lstrip()) <= curr_indent):
                    fixed.append(' ' * (curr_indent + 4) + 'pass')
                    print(f"Added pass after line {i+1}: {repr(stripped[:60])}")
    i += 1

content = '\n'.join(fixed)
with open('backend/routers/phonesoftware/auth.py', 'w', encoding='utf-8') as f:
    f.write(content)

import subprocess, sys
r = subprocess.run([sys.executable, '-m', 'py_compile', 'backend/routers/phonesoftware/auth.py'], capture_output=True, text=True)
print("auth.py syntax:", "OK" if r.returncode == 0 else r.stderr)
