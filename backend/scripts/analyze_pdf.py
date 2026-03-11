import sys
sys.stdout.reconfigure(encoding='utf-8')
import fitz
doc = fitz.open(r'c:\Users\arjun\Downloads\project_IFOA2\Dispatch_graduate.pdf')
page = doc[0]
blocks = page.get_text('dict')['blocks']
for b in blocks:
    if 'lines' in b:
        for line in b['lines']:
            for span in line['spans']:
                if span['text'].strip():
                    print(f'  y={span["origin"][1]:.0f} x={span["origin"][0]:.0f} size={span["size"]:.1f} font={span["font"]} text="{span["text"]}"')
