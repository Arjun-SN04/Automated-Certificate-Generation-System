// Run: node inspect_pdf.js
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function inspect(file) {
  const bytes = fs.readFileSync(path.join(__dirname, '..', file));
  const doc = await PDFDocument.load(bytes);
  const page = doc.getPages()[0];
  const { width, height } = page.getSize();
  console.log(`\n=== ${file} ===`);
  console.log(`  width=${width}, height=${height}`);

  // Also dump all annotation/field positions if any
  const annots = page.node.lookupMaybe(page.node.doc.context.obj('Annots'));
  console.log(`  Has Annots: ${!!annots}`);
}

(async () => {
  await inspect('Dispatch_graduate.pdf');
  await inspect('HumanFactors.pdf');
  await inspect('recurrent_training_with_modules.pdf');
})().catch(console.error);
