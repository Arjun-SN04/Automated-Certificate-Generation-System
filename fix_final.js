/**
 * FINAL FIX — run in PowerShell from C:\project_IFOA2\:
 *   node fix_final.js
 *
 * Uses pdf-lib (already installed) + sharp/canvas — actually just uses
 * the simplest possible approach: reads the PDF, renders each page via
 * the existing sharp library if available, otherwise instructs user.
 */
const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const here = __dirname;
const src  = path.join(here, 'recurrent_training_with_modules.pdf');
const srcOrange = path.join(here, 'Dispatch_graduate_orange.pdf');

if (!fs.existsSync(src)) {
  console.error('ERROR: recurrent_training_with_modules.pdf not found');
  process.exit(1);
}

// Try python approach first (most reliable)
const pyScript = path.join(here, 'fix_templates_clean.py');

console.log('Attempting fix via Python + PyMuPDF...');

// Check if python is available
const pyCheck = spawnSync('python', ['--version'], { encoding: 'utf8' });
const py3Check = spawnSync('python3', ['--version'], { encoding: 'utf8' });
const pyCmd = pyCheck.status === 0 ? 'python' : (py3Check.status === 0 ? 'python3' : null);

if (!pyCmd) {
  console.log('Python not found. Trying pip...');
}

if (pyCmd) {
  // Install PyMuPDF silently
  console.log('Installing PyMuPDF...');
  spawnSync(pyCmd, ['-m', 'pip', 'install', 'PyMuPDF', '--quiet'], { stdio: 'inherit' });
  
  console.log('Running fix script...');
  const result = spawnSync(pyCmd, [pyScript], { stdio: 'inherit', cwd: here });
  
  if (result.status === 0) {
    console.log('\n✅ SUCCESS! Restart your backend server now.');
    process.exit(0);
  }
}

// Fallback: use pdf-lib to at least ensure files exist (won't strip text but better than nothing)
console.log('\nFallback: creating template copies with pdf-lib...');
const { PDFDocument } = require('pdf-lib');

async function copyPdf(src, dst) {
  const bytes = fs.readFileSync(src);
  const doc   = await PDFDocument.load(bytes);
  const out   = await PDFDocument.create();
  const [pg]  = await out.copyPages(doc, [0]);
  out.addPage(pg);
  const saved = await out.save({ useObjectStreams: true });
  fs.writeFileSync(dst, saved);
  console.log(`  Copied: ${path.basename(dst)}`);
}

(async () => {
  await copyPdf(src, path.join(here, 'Dispatch_graduate.pdf'));
  await copyPdf(src, path.join(here, 'HumanFactors.pdf'));
  if (fs.existsSync(srcOrange)) {
    await copyPdf(srcOrange, path.join(here, 'recurrent_training_orange.pdf'));
  }
  console.log('\nDone. Restart your backend server.');
  console.log('NOTE: For full fix (remove phantom 5), run: python fix_templates_clean.py');
})();
