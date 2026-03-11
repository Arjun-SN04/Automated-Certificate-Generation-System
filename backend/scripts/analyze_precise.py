import fitz

for pdf_name in ['Dispatch_graduate.pdf', 'HumanFactors.pdf', 'recurrent_training_with_modules.pdf']:
    print(f'\n=== {pdf_name} ===')
    doc = fitz.open(pdf_name)
    page = doc[0]
    w, h = page.rect.width, page.rect.height
    print(f'Page size: {w:.2f} x {h:.2f}')

    # Get all text spans with exact positions
    blocks = page.get_text('dict')['blocks']
    for b in blocks:
        if 'lines' in b:
            for line in b['lines']:
                for span in line['spans']:
                    txt = span['text'].strip()
                    if txt:
                        bbox = span['bbox']
                        print(f'  y={bbox[1]:.1f}-{bbox[3]:.1f} x={bbox[0]:.1f}-{bbox[2]:.1f} size={span["size"]:.1f} font={span["font"]} color=#{span["color"]:06X} text="{txt[:80]}"')

    # Sample background colors at various positions
    pix = page.get_pixmap(dpi=72)
    print(f'\n  Background color samples:')
    for y_pos in [200, 250, 280, 300, 320, 350, 380, 400, 420, 500]:
        for x_pos in [100, 429, 750]:
            idx = y_pos * pix.stride + x_pos * pix.n
            if idx + 2 < len(pix.samples):
                r, g, b = pix.samples[idx], pix.samples[idx+1], pix.samples[idx+2]
                print(f'    ({x_pos:3d},{y_pos:3d}): rgb({r:3d},{g:3d},{b:3d}) = ({r/255:.4f},{g/255:.4f},{b/255:.4f})')
    doc.close()
