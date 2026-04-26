from PIL import Image
import numpy as np
import os

img_path = "/Users/thijslouter/.gemini/antigravity/brain/a9b0ab20-a267-44aa-95d1-d1a94f157f5b/media__1777139123918.jpg"
if not os.path.exists(img_path):
    print("Image not found")
    exit(1)

img = Image.open(img_path).convert('L')
img_array = np.array(img, dtype=float)

# Invert so black becomes white
# But actually the user's image is black leather. The highlights are white, shadows are black.
# We want light gray leather: highlights should be almost white, shadows slightly darker gray.
# Normalize to 0-1
img_min = img_array.min()
img_max = img_array.max()
if img_max > img_min:
    img_array = (img_array - img_min) / (img_max - img_min)
else:
    img_array = np.zeros_like(img_array)

# Map 0 (shadows) to ~200, 1 (highlights) to ~240 (light gray range)
new_array = img_array * (245 - 210) + 210

out_img = Image.fromarray(new_array.astype(np.uint8))
out_img.save("/Users/thijslouter/Documents/Mattheus/bg-texture.jpg", quality=90)
print("Texture created successfully")
