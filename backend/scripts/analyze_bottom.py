import fitz

for pdf_name in ['Dispatch_graduate.pdf', 'HumanFactors.pdf', 'recurrent_training_with_modules.pdf']:
    print(f'\n=== {pdf_name} ===')
    doc = fitz.open(pdf_name)
    page = doc[0]
    w, h = page.rect.width, page.rect.height
    print(f'Page: {w:.1f} x {h:.1f}')

    # Check all images
    imgs = page.get_images(full=True)
    print(f'Images: {len(imgs)}')
    for i, img in enumerate(imgs):
        xref = img[0]
        # Get image position on page
        rects = page.get_image_rects(xref)
        for r in rects:
            print(f'  img[{i}] xref={xref}: x={r.x0:.1f}-{r.x1:.1f} y={r.y0:.1f}-{r.y1:.1f} (w={r.width:.1f} h={r.height:.1f})')

    # Also check bottom area text
    blocks = page.get_text('dict')['blocks']
    for b in blocks:
        if 'lines' in b:
            for line in b['lines']:
                for span in line['spans']:
                    txt = span['text'].strip()
                    if txt and span['bbox'][1] > 450:
                        bbox = span['bbox']
                        print(f'  text y={bbox[1]:.0f}-{bbox[3]:.0f} x={bbox[0]:.0f}-{bbox[2]:.0f} "{txt[:60]}"')
    doc.close()
