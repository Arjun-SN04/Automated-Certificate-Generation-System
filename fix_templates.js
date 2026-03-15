// Run once: node fix_templates.js
// Copies the correct green recurrent template as Dispatch_graduate.pdf and HumanFactors.pdf
const fs = require('fs');
const path = require('path');

const here = __dirname;
const green = path.join(here, 'recurrent_training_with_modules.pdf');

if (!fs.existsSync(green)) {
  console.error('ERROR: recurrent_training_with_modules.pdf not found');
  process.exit(1);
}

['Dispatch_graduate.pdf', 'HumanFactors.pdf'].forEach(name => {
  const dst = path.join(here, name);
  fs.copyFileSync(green, dst);
  console.log(`Created: ${name} (green template)`);
});

// Also create recurrent_training_orange.pdf from the HumanFactors orange
const hfOrange = path.join(here, 'HumanFactors_orange.pdf');
const recOrange = path.join(here, 'recurrent_training_orange.pdf');
if (fs.existsSync(hfOrange) && !fs.existsSync(recOrange)) {
  fs.copyFileSync(hfOrange, recOrange);
  console.log('Created: recurrent_training_orange.pdf');
}

console.log('\nDone! Now restart your backend server.');
