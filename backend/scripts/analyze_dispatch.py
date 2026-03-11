import sys
sys.stdout.reconfigure(encoding='utf-8')
import fitz

path = r'c:\Users\arjun\Downloads\project_IFOA2\Dispatch_graduate.pdf'
doc = fitz.open(path)
page = doc[0]
blocks = page.get_text('dict')['blocks']
for b in blocks:
    if 'lines' in b:
        for line in b['lines']:
            for span in line['spans']:
                t = span['text'].strip()
                if t:
                    print(f'  y={span["origin"][1]:.0f} x={span["origin"][0]:.0f} size={span["size"]:.1f} color=#{span["color"]:06x} font={span["font"]} text="{t}"')

# Also extract page as image for visual ref
page_pix = page.get_pixmap(dpi=72)
page_pix.save(r'c:\Users\arjun\Downloads\project_IFOA2\dispatch_preview.png')
print('\nSaved preview image')
