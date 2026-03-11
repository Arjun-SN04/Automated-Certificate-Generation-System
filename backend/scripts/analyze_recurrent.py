import sys
sys.stdout.reconfigure(encoding='utf-8')
import fitz

path = r'c:\Users\arjun\Downloads\project_IFOA2\recurrent_training_with_modules.pdf'
doc = fitz.open(path)
page = doc[0]
# Get ALL text
text = page.get_text()
print(text)
print('---')
# Get all text blocks with bbox
blocks = page.get_text('dict')['blocks']
for b in blocks:
    if 'lines' in b:
        for line in b['lines']:
            for span in line['spans']:
                t = span['text'].strip()
                if t:
                    print(f'  y={span["origin"][1]:.0f} x={span["origin"][0]:.0f} size={span["size"]:.1f} color=#{span["color"]:06x} font={span["font"]} text="{t}"')
