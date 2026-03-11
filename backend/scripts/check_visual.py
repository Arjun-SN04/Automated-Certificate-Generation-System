import fitz
from PIL import Image
import numpy as np

for pdf_name in ['test_v3_dispatch.pdf', 'test_v3_hf.pdf', 'test_v3_recurrent.pdf']:
    print(f'\n=== {pdf_name} ===')
    img = Image.open(pdf_name.replace('.pdf', '.png'))
    arr = np.array(img)
    h, w = arr.shape[:2]
    
    # Check specific areas for the dispatch certificate:
    # The name area (original should be white-outed, new name should be visible)
    # In the rendered image at 150dpi, the PDF coords need scaling
    # PDF size: 858.48 x 612.48, Image: 1789 x 1276
    # Scale: 1789/858.48 = 2.084, 1276/612.48 = 2.084
    scale = w / 858.48
    
    # Check if original name area is properly white
    # Original name: y=239-327 (in PDF top-left coords)
    # New name area should also be here
    
    # Sample pixels in key areas
    areas = {
        'Name area (y=260, x=180)': (int(260*scale), int(180*scale)),
        'Name area (y=260, x=600)': (int(260*scale), int(600*scale)),
        'Name area center (y=280, x=430)': (int(280*scale), int(430*scale)),
        'Below name (y=330, x=430)': (int(330*scale), int(430*scale)),
        'Date area (y=400, x=430)': (int(400*scale), int(430*scale)),
        'Signature area (y=510, x=300)': (int(510*scale), int(300*scale)),
        'Signature area (y=510, x=570)': (int(510*scale), int(570*scale)),
    }
    
    for label, (py, px) in areas.items():
        if py < h and px < w:
            pixel = arr[py, px]
            is_white = all(p > 250 for p in pixel[:3])
            is_dark = all(p < 50 for p in pixel[:3])
            status = 'WHITE' if is_white else ('DARK/TEXT' if is_dark else f'rgb({pixel[0]},{pixel[1]},{pixel[2]})')
            print(f'  {label}: {status}')

    # Check if signature names are preserved (should NOT be white)
    sig_y = int(505 * scale)
    sig_left_x = int(290 * scale)
    sig_right_x = int(580 * scale)
    
    left_sig = arr[sig_y, sig_left_x]
    right_sig = arr[sig_y, sig_right_x]
    print(f'  Left signature (y=505, x=290): rgb({left_sig[0]},{left_sig[1]},{left_sig[2]})')
    print(f'  Right signature (y=505, x=580): rgb({right_sig[0]},{right_sig[1]},{right_sig[2]})')
