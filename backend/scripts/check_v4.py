import fitz

# Check that the logo area (y=440-490) is now preserved
for pdf_name in ['test_v4_dispatch.pdf', 'test_v4_hf.pdf', 'test_v4_recurrent.pdf']:
    print(f'\n=== {pdf_name} ===')
    doc = fitz.open(pdf_name)
    page = doc[0]
    pix = page.get_pixmap(dpi=72)
    
    print('  Center (x=429), y=430-510:')
    for y in range(430, 510, 5):
        idx = y * pix.stride + 429 * pix.n
        if idx + 2 < len(pix.samples):
            r, g, b = pix.samples[idx], pix.samples[idx+1], pix.samples[idx+2]
            is_white = r > 250 and g > 250 and b > 250
            label = 'WHITE' if is_white else f'rgb({r},{g},{b})'
            print(f'    y={y}: {label}')
    
    # Verify signatures are preserved
    sig_y = 505
    for x, label in [(290, 'Left sig'), (580, 'Right sig')]:
        idx = sig_y * pix.stride + x * pix.n
        r, g, b = pix.samples[idx], pix.samples[idx+1], pix.samples[idx+2]
        is_white = r > 250 and g > 250 and b > 250
        status = 'WHITE (BAD!)' if is_white else f'rgb({r},{g},{b}) OK'
        print(f'  {label} (y={sig_y},x={x}): {status}')
    doc.close()

# Compare with originals
print('\n=== ORIGINALS for reference ===')
for pdf_name in ['Dispatch_graduate.pdf', 'recurrent_training_with_modules.pdf']:
    print(f'\n  {pdf_name}:')
    doc = fitz.open(pdf_name)
    page = doc[0]
    pix = page.get_pixmap(dpi=72)
    print('  Center (x=429), y=430-510:')
    for y in range(430, 510, 5):
        idx = y * pix.stride + 429 * pix.n
        if idx + 2 < len(pix.samples):
            r, g, b = pix.samples[idx], pix.samples[idx+1], pix.samples[idx+2]
            is_white = r > 250 and g > 250 and b > 250
            label = 'WHITE' if is_white else f'rgb({r},{g},{b})'
            print(f'    y={y}: {label}')
    doc.close()
