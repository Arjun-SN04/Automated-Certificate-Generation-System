import fitz

for pdf_name in ['test_v3_dispatch.pdf', 'test_v3_hf.pdf', 'test_v3_recurrent.pdf']:
    print(f'\n=== {pdf_name} ===')
    doc = fitz.open(pdf_name)
    print(f'Pages: {doc.page_count}')
    page = doc[0]
    
    # Extract all text
    blocks = page.get_text('dict')['blocks']
    for b in blocks:
        if 'lines' in b:
            for line in b['lines']:
                for span in line['spans']:
                    txt = span['text'].strip()
                    if txt:
                        bbox = span['bbox']
                        print(f'  y={bbox[1]:.0f}-{bbox[3]:.0f} x={bbox[0]:.0f}-{bbox[2]:.0f} size={span["size"]:.0f} "{txt[:80]}"')
    doc.close()
