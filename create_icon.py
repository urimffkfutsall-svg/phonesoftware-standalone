from PIL import Image, ImageDraw, ImageFont
import os

# Create a simple PhoneSoftware icon
size = 256
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Background circle - teal color
draw.ellipse([10, 10, 246, 246], fill='#00BCD4')

# Phone shape (white)
phone_x, phone_y = 88, 60
phone_w, phone_h = 80, 136
draw.rounded_rectangle([phone_x, phone_y, phone_x+phone_w, phone_y+phone_h], radius=12, fill='white')

# Screen
draw.rectangle([phone_x+8, phone_y+18, phone_x+phone_w-8, phone_y+phone_h-28], fill='#00BCD4')

# Home button
draw.ellipse([phone_x+30, phone_y+phone_h-22, phone_x+50, phone_y+phone_h-6], fill='#00BCD4')

# Save as PNG
img.save('frontend/assets/icon.png', 'PNG')
print("icon.png created!")

# Save as ICO (multiple sizes)
ico_sizes = [(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)]
images = []
for s in ico_sizes:
    images.append(img.resize(s, Image.LANCZOS))
images[0].save('frontend/assets/icon.ico', format='ICO', sizes=[(i.width, i.height) for i in images], append_images=images[1:])
print("icon.ico created!")
