from PIL import Image, ImageChops

def trim(im):
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

def main():
    img_path = 'public/logo.jpg'
    img = Image.open(img_path)
    
    # Crop the icon (assuming it's roughly the top 65%)
    width, height = img.size
    split_y = int(height * 0.65)
    
    icon_part = img.crop((0, 0, width, split_y))
    text_part = img.crop((0, split_y, width, height))
    
    icon_cropped = trim(icon_part)
    text_cropped = trim(text_part)
    
    # Now stitch them horizontally
    padding = 40
    new_width = icon_cropped.width + text_cropped.width + padding
    new_height = max(icon_cropped.height, text_cropped.height)
    
    new_img = Image.new('RGB', (new_width, new_height), (255, 255, 255))
    
    # paste icon on left, vertically centered
    icon_y = (new_height - icon_cropped.height) // 2
    new_img.paste(icon_cropped, (0, icon_y))
    
    # paste text on right, vertically centered
    text_y = (new_height - text_cropped.height) // 2
    new_img.paste(text_cropped, (icon_cropped.width + padding, text_y))
    
    # Add a little padding around the whole thing
    final_padding = 20
    final_img = Image.new('RGB', (new_width + 2*final_padding, new_height + 2*final_padding), (255, 255, 255))
    final_img.paste(new_img, (final_padding, final_padding))
    
    final_img.save('public/logo_horizontal.png')
    print("Created logo_horizontal.png")

if __name__ == '__main__':
    main()
