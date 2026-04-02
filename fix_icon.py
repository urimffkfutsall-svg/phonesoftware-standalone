from PIL import Image, ImageDraw
import os

size = 512
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Background circle - teal
draw.ellipse([20, 20, 492, 492], fill='#00BCD4')

# Phone body (white rounded rect)
draw.rounded_rectangle([156, 100, 356, 412], radius=30, fill='white')

# Screen
draw.rectangle([172, 140, 340, 360], fill='#00BCD4')

# Home button
draw.ellipse([226, 372, 286, 402], fill='#00BCD4')

# Speaker
draw.rounded_rectangle([216, 110, 296, 122], radius=4, fill='#00BCD4')

# Save PNG 512x512
img.save('frontend/assets/icon.png', 'PNG')

# Save ICO with proper 256x256
img_256 = img.resize((256, 256), Image.LANCZOS)
img_128 = img.resize((128, 128), Image.LANCZOS)
img_64 = img.resize((64, 64), Image.LANCZOS)
img_48 = img.resize((48, 48), Image.LANCZOS)
img_32 = img.resize((32, 32), Image.LANCZOS)
img_16 = img.resize((16, 16), Image.LANCZOS)

img_256.save(
    'frontend/assets/icon.ico',
    format='ICO',
    sizes=[(256,256),(128,128),(64,64),(48,48),(32,32),(16,16)],
    append_images=[img_128, img_64, img_48, img_32, img_16]
)

print("icon.ico created:", os.path.getsize('frontend/assets/icon.ico'), "bytes")
print("icon.png created:", os.path.getsize('frontend/assets/icon.png'), "bytes")
