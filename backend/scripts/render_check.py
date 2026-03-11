import fitz

for pdf_name in ['test_v3_dispatch.pdf', 'test_v3_hf.pdf', 'test_v3_recurrent.pdf']:
    doc = fitz.open(pdf_name)
    page = doc[0]
    pix = page.get_pixmap(dpi=150)
    img_name = pdf_name.replace('.pdf', '.png')
    pix.save(img_name)
    print(f'{pdf_name} -> {img_name} ({pix.width}x{pix.height})')
    doc.close()

print('\nRendered to PNG images. Check them visually.')
