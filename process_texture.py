from PIL import Image, ImageFilter
import numpy as np
import os

img_path = "/Users/thijslouter/.gemini/antigravity/brain/a9b0ab20-a267-44aa-95d1-d1a94f157f5b/media__1777139123918.jpg"
if not os.path.exists(img_path):
    print("Image not found")
    exit(1)

img = Image.open(img_path).convert('L')

# Create a blurred version to extract the low-frequency lighting (vignette)
blur = img.filter(ImageFilter.GaussianBlur(100))

arr = np.array(img, dtype=float)
blur_arr = np.array(blur, dtype=float)

# High-pass filter: subtract the blur from the original
# This perfectly removes the vignette and leaves only the sharp texture details.
hp = arr - blur_arr

# We want the background to be light gray (around 235)
# We add the high-pass details to this base color.
# Multiply by a factor to enhance the contrast of the texture if needed.
contrast_factor = 1.2
out_arr = 235 + (hp * contrast_factor)

# Clip to valid byte range
out_arr = np.clip(out_arr, 0, 255)

out_img = Image.fromarray(out_arr.astype(np.uint8))
out_img.save("/Users/thijslouter/Documents/Mattheus/bg-texture-light.jpg", quality=95)
print("Texture successfully processed to uniform light gray.")
