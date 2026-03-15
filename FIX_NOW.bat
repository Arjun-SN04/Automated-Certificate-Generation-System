@echo off
echo Fixing certificate templates...
echo.
echo Step 1: Installing PyMuPDF...
pip install PyMuPDF --quiet
echo.
echo Step 2: Running fix script...
python fix_templates_clean.py
echo.
echo Step 3: Done! Now restart your backend server.
pause
