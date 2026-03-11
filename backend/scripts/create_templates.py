"""
Create clean template PDFs by redacting dynamic text areas from sample PDFs.
Dynamic text = participant name, description, date, validity, cert ID.
Static text = CERTIFICATE, OF GRADUATION, THIS CERTIFIES THAT, signatories, borders, logos, etc.
"""
import fitz
import os

output_dir = os.path.join('backend', 'templates')
os.makedirs(output_dir, exist_ok=True)

def create_clean_template(input_pdf, output_pdf, redact_areas):
    """
    redact_areas: list of (x0, y0, x1, y1) rects in PyMuPDF coords (top-left origin)
    """
    doc = fitz.open(input_pdf)
    page = doc[0]
    
    for area in redact_areas:
        rect = fitz.Rect(*area)
        # Add redaction annotation with white fill
        page.add_redact_annot(rect, fill=(1, 1, 1))
    
    # Apply all redactions - this permanently removes content under the rects
    page.apply_redactions()
    
    doc.save(output_pdf)
    doc.close()
    print(f'Created: {output_pdf}')

# === Dispatch Graduate ===
# Dynamic text to remove:
#   Name: y=238.9-326.6 (70pt GreatVibes) - wide area
#   Description: y=325.7-352.0
#   Validity: y=374.9-384.5
#   Date: y=388.1-410.4
#   Cert ID: y=24.7-36.7, x=765.5-836.6
dispatch_redacts = [
    (100, 235, 760, 328),      # Name area
    (150, 323, 710, 355),      # Description lines
    (300, 372, 560, 387),      # Validity text
    (320, 385, 540, 414),      # Date
    (760, 22, 842, 40),        # Cert ID (top-right)
]
create_clean_template('Dispatch_graduate.pdf',
                      os.path.join(output_dir, 'Dispatch_graduate_template.pdf'),
                      dispatch_redacts)

# === Human Factors ===
# Dynamic text to remove:
#   Name: y=238.9-326.6 (70pt GreatVibes)
#   Description: y=325.7-378.0
#   Validity: y=400.5-410.2
#   Date: y=414.3-436.6
#   No cert ID line visible in the main area (it's at bottom: y=575.5-587.5, x=29-97.5)
hf_redacts = [
    (100, 235, 760, 328),      # Name area
    (130, 323, 730, 382),      # Description lines (3 lines)
    (300, 398, 560, 413),      # Validity text
    (320, 411, 540, 440),      # Date
    (20, 572, 110, 592),       # Cert ID (bottom-left)
]
create_clean_template('HumanFactors.pdf',
                      os.path.join(output_dir, 'HumanFactors_template.pdf'),
                      hf_redacts)

# === Recurrent ===
# Dynamic text to remove:
#   Name: y=221.4-309.1 (70pt GreatVibes)
#   Lorem Ipsum placeholder: y=530.2-534.1 (tiny text near bottom)
#   Cert ID: y=24.7-36.7, x=764-838
#   Note: recurrent has less body text in the sample - modules are shown differently
recurrent_redacts = [
    (100, 218, 760, 312),      # Name area
    (100, 310, 750, 490),      # Body area (for modules/description - clear this)
    (760, 22, 842, 40),        # Cert ID (top-right)
]
create_clean_template('recurrent_training_with_modules.pdf',
                      os.path.join(output_dir, 'recurrent_template.pdf'),
                      recurrent_redacts)

# Verify results
for f in os.listdir(output_dir):
    if f.endswith('.pdf'):
        fp = os.path.join(output_dir, f)
        doc = fitz.open(fp)
        page = doc[0]
        # Check remaining text
        text = page.get_text()
        print(f'\n{f} remaining text preview:')
        for line in text.strip().split('\n'):
            if line.strip():
                print(f'  "{line.strip()}"')
        doc.close()

print('\nDone! Templates saved to backend/templates/')
