import fitz
from PIL import Image
import numpy as np

# Check generated output bottom area in detail
for pdf_name in ['test_v3_dispatch.pdf', 'test_v3_hf.pdf', 'test_v3_recurrent.pdf']:
    print(f'\n=== {pdf_name} ===')
    doc = fitz.open(pdf_name)
    page = doc[0]
    pix = page.get_pixmap(dpi=72)
    
    # Sample the bottom area row by row to find logo edges
    w, h = pix.width, pix.height  # ~858 x 612
    print(f'Rendered: {w}x{h}')
    
    # Check center column (x=429) from y=430 to y=560 to find the logo
    print('  Center column (x=429), y=430-570:')
    for y in range(430, 570, 5):
        idx = y * pix.stride + 429 * pix.n
        if idx + 2 < len(pix.samples):
            r, g, b = pix.samples[idx], pix.samples[idx+1], pix.samples[idx+2]
            is_white = r > 250 and g > 250 and b > 250
            label = 'WHITE' if is_white else f'rgb({r},{g},{b})'
            print(f'    y={y}: {label}')
    
    # Also check right side for green seal
    print('  Right side (x=750), y=450-560:')
    for y in range(450, 560, 10):
        idx = y * pix.stride + 750 * pix.n
        if idx + 2 < len(pix.samples):
            r, g, b = pix.samples[idx], pix.samples[idx+1], pix.samples[idx+2]
            is_white = r > 250 and g > 250 and b > 250
            label = 'WHITE' if is_white else f'rgb({r},{g},{b})'
            print(f'    y={y}: {label}')
    doc.close()

# Also check originals for comparison
print('\n\n=== ORIGINALS for comparison ===')
for pdf_name in ['Dispatch_graduate.pdf', 'HumanFactors.pdf', 'recurrent_training_with_modules.pdf']:
    print(f'\n  {pdf_name}:')
    doc = fitz.open(pdf_name)
    page = doc[0]
    pix = page.get_pixmap(dpi=72)
    print('  Center column (x=429), y=430-570:')
    for y in range(430, 570, 5):
        idx = y * pix.stride + 429 * pix.n
        if idx + 2 < len(pix.samples):
            r, g, b = pix.samples[idx], pix.samples[idx+1], pix.samples[idx+2]
            is_white = r > 250 and g > 250 and b > 250
            label = 'WHITE' if is_white else f'rgb({r},{g},{b})'
            print(f'    y={y}: {label}')
    doc.close()
