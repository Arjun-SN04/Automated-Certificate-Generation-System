import fitz
doc = fitz.open('backend/templates/recurrent_template.pdf')
page = doc[0]
page.add_redact_annot(fitz.Rect(420, 528, 450, 536), fill=(1,1,1))
page.apply_redactions()
doc.save('backend/templates/recurrent_template_clean.pdf')
doc.close()
import shutil
shutil.move('backend/templates/recurrent_template_clean.pdf', 'backend/templates/recurrent_template.pdf')
doc.close()
print('Cleaned Lorem Ipsum from recurrent template')
doc = fitz.open('backend/templates/recurrent_template.pdf')
page = doc[0]
for line in page.get_text().strip().split('\n'):
    if line.strip():
        print(f'  "{line.strip()}"')
doc.close()
