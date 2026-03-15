"""
Run this script ONCE from C:\project_IFOA2\ to fix the template files.
It replaces the wrong orange templates with the correct green one.

Usage:  python fix_templates.py
"""
import shutil, os, sys

here = os.path.dirname(os.path.abspath(__file__))
green_src = os.path.join(here, 'recurrent_training_with_modules.pdf')

if not os.path.exists(green_src):
    print("ERROR: recurrent_training_with_modules.pdf not found in", here)
    sys.exit(1)

targets = ['Dispatch_graduate.pdf', 'HumanFactors.pdf']

for t in targets:
    dst = os.path.join(here, t)
    # Back up the wrong (orange) file first
    backup = dst.replace('.pdf', '_orange.pdf')
    if os.path.exists(dst):
        shutil.copy2(dst, backup)
        print(f"  Backed up  {t}  ->  {os.path.basename(backup)}")
    shutil.copy2(green_src, dst)
    print(f"  Replaced   {t}  with green template")

print("\nDone! Restart your backend server now.")
