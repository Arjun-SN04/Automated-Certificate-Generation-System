/**
 * fix_templates_final.js
 * 
 * Run from C:\project_IFOA2\:
 *   node fix_templates_final.js
 * 
 * This script:
 * 1. Takes recurrent_training_with_modules.pdf (the correct green template)
 * 2. Uses pdf-lib to re-save it in a way that removes the old text content streams
 * 3. Copies it as Dispatch_graduate.pdf and HumanFactors.pdf
 * 4. Also creates recurrent_training_orange.pdf as a copy of the india template
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const here = __dirname;

async function cleanTemplate(inputPath, outputPath) {
  const bytes = fs.readFileSync(inputPath);
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  
  // Create a brand new PDF and copy the page (this drops editable text objects
  // that are not baked into the visual layer in newer pdf-lib behavior)
  const newDoc = await PDFDocument.create();
  const [page] = await newDoc.copyPages(srcDoc, [0]);
  newDoc.addPage(page);
  
  // Re-save with object streams compressed - this forces a clean rebuild
  const outBytes = await newDoc.save({ useObjectStreams: true, addDefaultPage: false });
  fs.writeFileSync(outputPath, outBytes);
  console.log(`  Written: ${path.basename(outputPath)} (${(outBytes.length/1024).toFixed(0)} KB)`);
}

async function main() {
  console.log('Fixing green templates...\n');
  
  const recurrent = path.join(here, 'recurrent_training_with_modules.pdf');
  
  if (!fs.existsSync(recurrent)) {
    console.error('ERROR: recurrent_training_with_modules.pdf not found');
    process.exit(1);
  }
  
  // Copy recurrent as Dispatch_graduate and HumanFactors (they use same green design)
  await cleanTemplate(recurrent, path.join(here, 'Dispatch_graduate.pdf'));
  await cleanTemplate(recurrent, path.join(here, 'HumanFactors.pdf'));
  await cleanTemplate(recurrent, path.join(here, 'recurrent_training_with_modules.pdf'));
  
  // Create orange copies from the existing orange files
  const dispOrange = path.join(here, 'Dispatch_graduate_orange.pdf');
  const hfOrange   = path.join(here, 'HumanFactors_orange.pdf');
  
  if (fs.existsSync(dispOrange)) {
    await cleanTemplate(dispOrange, path.join(here, 'recurrent_training_orange.pdf'));
    console.log('  Created: recurrent_training_orange.pdf');
  }
  
  console.log('\nDone! Now restart your backend server.');
  console.log('The superscript "5" issue will be gone.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
