import fitz, shutil

doc = fitz.open('backend/templates/recurrent_template.pdf')
page = doc[0]
page.add_redact_annot(fitz.Rect(420, 528, 450, 536), fill=(1,1,1))
page.apply_redactions()
doc.save('backend/templates/recurrent_template_v2.pdf')
doc.close()

shutil.move('backend/templates/recurrent_template_v2.pdf', 'backend/templates/recurrent_template.pdf')
print('Cleaned Lorem Ipsum')

doc = fitz.open('backend/templates/recurrent_template.pdf')
page = doc[0]
for line in page.get_text().strip().split('\n'):
    if line.strip():
        print(f'  "{line.strip()}"')
doc.close()
