"""
fix_templates_clean.py
Run from C:\project_IFOA2\:
    python fix_templates_clean.py

Requires: pip install pymupdf
(or: pip install PyMuPDF)

This rasterizes each template to images then rebuilds as image-only PDFs,
permanently removing ALL text layers (including the phantom '5' / Lorem Ipsum).
"""
import sys
import os

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Installing PyMuPDF...")
    os.system(f"{sys.executable} -m pip install PyMuPDF --quiet")
    import fitz

here = os.path.dirname(os.path.abspath(__file__))

def rasterize_to_clean_pdf(input_path, output_path, dpi=300):
    """Convert PDF to image then back to PDF - removes all text layers."""
    print(f"  Processing: {os.path.basename(input_path)}")
    
    src = fitz.open(input_path)
    page = src[0]
    
    # Render at 300 DPI to image
    mat = fitz.Matrix(dpi/72, dpi/72)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    
    # Create new PDF with just the image
    out = fitz.open()
    img_pdf_bytes = pix.pdfocr_tobytes(language="eng", deskew=False)
    
    # Actually use the simpler approach: create blank PDF and insert image
    out2 = fitz.open()
    # Get original page dimensions
    orig_w = page.rect.width
    orig_h = page.rect.height
    new_page = out2.new_page(width=orig_w, height=orig_h)
    # Insert the rendered image onto the page
    img_bytes = pix.tobytes("png")
    new_page.insert_image(new_page.rect, stream=img_bytes)
    
    out2.save(output_path, garbage=4, deflate=True)
    out2.close()
    src.close()
    
    # Verify no text
    check = fitz.open(output_path)
    text = check[0].get_text()
    check.close()
    status = "✓ No text" if not text.strip() else f"⚠ Still has text: {repr(text[:50])}"
    print(f"    → {os.path.basename(output_path)} ({os.path.getsize(output_path)//1024} KB) {status}")

def main():
    print("Fixing template PDFs - removing all text layers\n")
    
    recurrent = os.path.join(here, 'recurrent_training_with_modules.pdf')
    disp_orange = os.path.join(here, 'Dispatch_graduate_orange.pdf')
    hf_orange   = os.path.join(here, 'HumanFactors_orange.pdf')
    
    if not os.path.exists(recurrent):
        print(f"ERROR: {recurrent} not found")
        sys.exit(1)
    
    # Green templates (all same design)
    rasterize_to_clean_pdf(recurrent, os.path.join(here, 'recurrent_training_with_modules.pdf'))
    rasterize_to_clean_pdf(recurrent, os.path.join(here, 'Dispatch_graduate.pdf'))
    rasterize_to_clean_pdf(recurrent, os.path.join(here, 'HumanFactors.pdf'))
    
    # Orange templates
    if os.path.exists(disp_orange):
        rasterize_to_clean_pdf(disp_orange, os.path.join(here, 'Dispatch_graduate_orange.pdf'))
        rasterize_to_clean_pdf(disp_orange, os.path.join(here, 'recurrent_training_orange.pdf'))
    if os.path.exists(hf_orange):
        rasterize_to_clean_pdf(hf_orange,   os.path.join(here, 'HumanFactors_orange.pdf'))
    
    print("\n✅ Done! Restart your backend server now.")
    print("   The '5' superscript issue will be permanently gone.")

if __name__ == '__main__':
    main()
