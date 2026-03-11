import sys
sys.stdout.reconfigure(encoding='utf-8')
import fitz

for fname in ['HumanFactors.pdf', 'recurrent_training_with_modules.pdf']:
    path = rf'c:\Users\arjun\Downloads\project_IFOA2\{fname}'
    try:
        doc = fitz.open(path)
        print(f'\n=== {fname} ({len(doc)} pages, {doc[0].rect.width:.0f}x{doc[0].rect.height:.0f}) ===')
        page = doc[0]
        blocks = page.get_text('dict')['blocks']
        for b in blocks:
            if 'lines' in b:
                for line in b['lines']:
                    for span in line['spans']:
                        if span['text'].strip():
                            print(f'  y={span["origin"][1]:.0f} x={span["origin"][0]:.0f} size={span["size"]:.1f} font={span["font"]} text="{span["text"]}"')
    except Exception as e:
        print(f'{fname}: {e}')
