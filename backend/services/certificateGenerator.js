const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

const MODULES_LIST = [
  'Air Law',
  'Aircraft Systems',
  'Navigation',
  'Meteorology',
  'Flight Planning',
  'Human Performance',
  'Mass & Balance',
  'Operational Procedures',
  'Communications',
  'General Navigation',
  'Radio Navigation',
  'Principles of Flight',
];

// Original sample PDFs as templates (small file size, ~3MB each)
const TEMPLATES_DIR = path.join(__dirname, '..', '..');
const TEMPLATE_MAP = {
  'Dispatch Graduate': 'Dispatch_graduate.pdf',
  'Human Factors': 'HumanFactors.pdf',
  'Recurrent': 'recurrent_training_with_modules.pdf',
};

function formatDateUpper(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' }).toUpperCase();
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/*
  Use original sample PDFs as templates. White-out only the dynamic text areas
  with precise white rectangles (background IS white), then overlay new text.
  
  PDF coords: origin bottom-left. PyMuPDF y-values from top-left.
  flipY = pageHeight - pymupdf_y
  
  Page: 858.48 x 612.48

  DYNAMIC TEXT POSITIONS (from PyMuPDF analysis):

  DISPATCH GRADUATE:
    Name:  y=238.9-326.6 x=176.6-727.4 (GreatVibes 70pt) "Sarthak R Jaiswal"
    Desc:  y=325.7-352.0 x=194-666 (MyriadPro-Regular 11pt, 2 lines)
    Valid: y=374.9-384.5 x=356-502 (MyriadPro-Regular 8pt)
    Date:  y=388.1-410.4 x=370-493 (MyriadPro-Bold 18pt) "25 APRIL 2025"
    CertID:y=24.7-36.7   x=765-837 (MyriadPro-Regular 10pt) "FDI-00004-2025"

  HUMAN FACTORS:
    Name:  y=238.9-326.6 x=254.7-636.2 (GreatVibes 70pt) "Aryan Pandey"
    Desc:  y=325.7-378.0 x=163-703 (MyriadPro-Regular 11pt, 3 lines)
    Valid: y=400.5-410.2 x=362-508 (MyriadPro-Regular 8pt)
    Date:  y=414.3-436.6 x=376-499 (MyriadPro-Bold 18pt) "29 APRIL 2025"
    CertID:y=575.5-587.5 x=29-97   (MyriadPro-Regular 10pt) "HF-00029-2025"

  RECURRENT:
    Name:  y=221.4-309.1 x=238-664 (GreatVibes 70pt) "Aysel Majidova"
    Body:  y=310-534 placeholder text (Lorem Ipsum near y=530)
    CertID:y=24.7-36.7   x=764-838 (MyriadPro-Regular 10pt) "FDR-00059-2026"

  STATIC (do NOT cover): signatures y=495-530, form number y=580-590
*/

async function generateCertificate(participant) {
  const trainingType = participant.training_type;
  const templateFile = TEMPLATE_MAP[trainingType];

  if (!templateFile) {
    throw new Error(`No template for training type: ${trainingType}`);
  }

  const templatePath = path.join(TEMPLATES_DIR, templateFile);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  const templateBytes = fs.readFileSync(templatePath);
  const templateDoc = await PDFDocument.load(templateBytes);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const [templatePage] = await pdfDoc.copyPages(templateDoc, [0]);
  pdfDoc.addPage(templatePage);

  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  const flipY = (topY) => height - topY;
  const white = rgb(1, 1, 1);

  // Draw a white rectangle (PyMuPDF coords: y from top, x from left)
  const whiteOut = (x, topY, w, h) => {
    page.drawRectangle({
      x,
      y: flipY(topY + h),
      width: w,
      height: h,
      color: white,
    });
  };

  const drawCentered = (text, topY, font, fontSize, color = rgb(0, 0, 0)) => {
    const tw = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: (width - tw) / 2,
      y: flipY(topY),
      size: fontSize,
      font,
      color,
    });
  };

  // ========== WHITE-OUT DYNAMIC TEXT AREAS (precise, per-type) ==========

  if (trainingType === 'Dispatch Graduate') {
    whiteOut(150, 236, 560, 94);   // Name: y=236 to 330
    whiteOut(170, 325, 520, 30);   // Description: y=325 to 355
    whiteOut(340, 373, 180, 15);   // Validity: y=373 to 388
    whiteOut(330, 386, 200, 28);   // Date: y=386 to 414
    whiteOut(760, 22, 80, 18);     // Cert ID: y=22 to 40

  } else if (trainingType === 'Human Factors') {
    whiteOut(150, 236, 560, 94);   // Name: y=236 to 330
    whiteOut(140, 325, 580, 55);   // Description: y=325 to 380 (3 lines)
    whiteOut(340, 398, 180, 15);   // Validity: y=398 to 413
    whiteOut(330, 412, 200, 28);   // Date: y=412 to 440
    whiteOut(20, 572, 90, 18);     // Cert ID bottom-left: y=572 to 590

  } else if (trainingType === 'Recurrent') {
    whiteOut(150, 219, 560, 93);   // Name: y=219 to 312
    whiteOut(120, 310, 620, 120);  // Body area: y=310 to 430
    whiteOut(270, 430, 320, 50);   // Original template date: y=430 to 480 (narrow center strip)
    whiteOut(760, 22, 80, 18);     // Cert ID: y=22 to 40
  }

  // ========== DRAW NEW DYNAMIC TEXT ==========

  // --- Certificate ID ---
  const certPrefix = trainingType === 'Dispatch Graduate' ? 'FDI'
    : trainingType === 'Human Factors' ? 'HF' : 'FDR';
  const certYear = new Date(participant.training_date).getFullYear();
  // Generate a numeric cert number from the ID (works for both numeric SQLite ids and MongoDB ObjectIds)
  const idStr = String(participant.id || participant._id);
  const certNum = /^\d+$/.test(idStr) ? idStr.padStart(5, '0') : String(parseInt(idStr.slice(-6), 16) % 100000).padStart(5, '0');
  const certId = `${certPrefix}-${certNum}-${certYear}`;

  if (trainingType === 'Human Factors') {
    page.drawText(certId, {
      x: 29,
      y: flipY(587),
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
  } else {
    const idW = helvetica.widthOfTextAtSize(certId, 10);
    page.drawText(certId, {
      x: 838 - idW,
      y: flipY(36),
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
  }

  // --- Participant Name ---
  const nameText = participant.participant_name;
  let nameFontSize = 52;
  let nameWidth = timesBoldItalic.widthOfTextAtSize(nameText, nameFontSize);
  if (nameWidth > 540) {
    nameFontSize = Math.floor(nameFontSize * 540 / nameWidth);
    nameWidth = timesBoldItalic.widthOfTextAtSize(nameText, nameFontSize);
  }
  const nameBaselineY = trainingType === 'Recurrent' ? 285 : 295;
  page.drawText(nameText, {
    x: (width - nameWidth) / 2,
    y: flipY(nameBaselineY),
    size: nameFontSize,
    font: timesBoldItalic,
    color: rgb(0, 0, 0),
  });

  // --- Training date ---
  const dateText = formatDateUpper(participant.training_date);

  // --- Type-specific body content (shifted up ~15px) ---
  if (trainingType === 'Dispatch Graduate') {
    drawCentered(
      'Has successfully completed ground school instruction required by the Initial Flight Dispatcher Course',
      338, helvetica, 11
    );
    drawCentered(
      'training as prescribed in ICAO Doc 10106, ICAO Doc 9868 and EASA Part ORO.GEN.110(c).',
      352, helvetica, 11
    );
    drawCentered('This certificate is valid for Unlimited Period', 378, helvetica, 8);
    drawCentered(dateText, 400, helveticaBold, 18);

  } else if (trainingType === 'Human Factors') {
    drawCentered(
      'Has successfully attended the Human Factors Introduction Training for Flight Operations Personnel',
      338, helvetica, 11
    );
    drawCentered(
      'This training has been delivered as per the ICAO doc 9683 and ICAO doc10106 Prerequisite learning objectives:',
      355, helvetica, 11
    );
    drawCentered('Human Factors in Aviation', 370, helvetica, 11);
    drawCentered('This certificate is valid for Unlimited Period', 404, helvetica, 8);
    drawCentered(dateText, 428, helveticaBold, 18);

  } else if (trainingType === 'Recurrent') {
    drawCentered(
      'Has successfully completed the Recurrent Training Program for Flight Dispatcher',
      320, helvetica, 11
    );
    drawCentered(
      'as prescribed in ICAO Doc 10106, ICAO Doc 9868 and EASA Part ORO.GEN.110(c).',
      334, helvetica, 11
    );

    const modules = participant.modules
      ? (typeof participant.modules === 'string' ? participant.modules.split(',').map(m => m.trim()) : participant.modules)
      : [];

    let afterBodyY = 356;

    if (modules.length > 0) {
      drawCentered('Modules Completed:', 350, helveticaBold, 10);

      // Use 3 columns to keep content compact and above logo area
      const colWidth = 200;
      const totalW = colWidth * 3;
      const startX = (width - totalW) / 2;
      const modStartY = 364;

      modules.forEach((mod, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        page.drawText(`\u2022  ${mod}`, {
          x: startX + col * colWidth,
          y: flipY(modStartY + row * 12),
          size: 9,
          font: helvetica,
          color: rgb(0, 0, 0),
        });
      });

      const totalRows = Math.ceil(modules.length / 3);
      afterBodyY = modStartY + totalRows * 12 + 8;
    }

    drawCentered('This certificate is valid for 1 Year from the date of training', afterBodyY, helvetica, 8);
    drawCentered(dateText, afterBodyY + 20, helveticaBold, 18);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { generateCertificate, MODULES_LIST };
