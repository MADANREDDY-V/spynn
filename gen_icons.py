import os
from PIL import Image, ImageChops

def trim(im):
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    return im.crop(bbox) if bbox else im

def main():
    img_path = 'public/logo.jpg'
    img = Image.open(img_path)
    
    # Extract icon (top part)
    h = img.height
    icon = trim(img.crop((0, 0, img.width, int(h * 0.65))))
    
    # Make icon perfectly square (with padding)
    size = max(icon.width, icon.height)
    square_icon = Image.new('RGB', (size, size), (255, 255, 255))
    offset = ((size - icon.width) // 2, (size - icon.height) // 2)
    square_icon.paste(icon, offset)
    
    square_icon.save('public/logo_icon.png')
    print("Saved logo_icon.png")
    
    # Generate favicons
    sizes = [
        ('public/favicon-16x16.png', 16),
        ('public/favicon-32x32.png', 32),
        ('public/apple-touch-icon.png', 180),
        ('public/android-chrome-192x192.png', 192),
        ('public/android-chrome-512x512.png', 512),
    ]
    
    for path, s in sizes:
        resized = square_icon.resize((s, s), Image.Resampling.LANCZOS)
        resized.save(path)
        print(f"Saved {path}")
        
    # Generate favicon.ico (includes multiple sizes)
    square_icon.save('public/favicon.ico', format='ICO', sizes=[(16,16), (32,32), (48,48), (64,64)])
    print("Saved favicon.ico")

if __name__ == '__main__':
    main()
