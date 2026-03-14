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

// ─── Template map ─────────────────────────────────────────────────────────────
const TEMPLATES_DIR = path.join(__dirname, '..', '..');

const TEMPLATE_MAP = {
  'Dispatch Graduate': 'Dispatch_graduate.pdf',
  'Human Factors':     'HumanFactors.pdf',
  'Recurrent':         'recurrent_training_with_modules.pdf',
  'FDI': 'Dispatch_graduate.pdf',
  'FDA': 'Dispatch_graduate.pdf',
  'GD':  'Dispatch_graduate.pdf',
  'TCD': 'Dispatch_graduate.pdf',
  'FDR': 'recurrent_training_with_modules.pdf',
  'FTL': 'recurrent_training_with_modules.pdf',
  'HF':  'HumanFactors.pdf',
  'NDG': 'HumanFactors.pdf',
};

// ─── Normalise training type → canonical body-logic key ──────────────────────
const CANONICAL_TYPE = {
  'FDI': 'Dispatch Graduate', 'FDA': 'Dispatch Graduate',
  'GD':  'Dispatch Graduate', 'TCD': 'Dispatch Graduate',
  'FDR': 'Recurrent',         'FTL': 'Recurrent',
  'HF':  'Human Factors',     'NDG': 'Human Factors',
  'Dispatch Graduate': 'Dispatch Graduate',
  'Human Factors':     'Human Factors',
  'Recurrent':         'Recurrent',
};

// ─── Legacy long name → short code ───────────────────────────────────────────
const TO_SHORT_CODE = {
  'Dispatch Graduate': 'FDI',
  'Human Factors':     'HF',
  'Recurrent':         'FDR',
};

// ─── Date helpers ─────────────────────────────────────────────────────────────
function formatDateUpper(dateStr) {
  if (!dateStr) return '';
  // Parse as local date (YYYY-MM-DD) to avoid UTC-shift giving wrong day
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const date  = new Date(y, m - 1, d);
  const day   = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' }).toUpperCase();
  return `${day} ${month} ${y}`;
}

// ─── Build the cert ID  ───────────────────────────────────────────────────────
// Format: <TYPE>-<00001>-<YEAR>
// • TYPE   = training-type short code (e.g. FDI)
// • 00001  = cert_sequence padded to 5 digits, stored in MongoDB via CertCounter
// • YEAR   = year taken from end_date (falls back to training_date)
function buildCertId(participant) {
  // ── No sequence yet = preview mode; never assign a number here ──────────────
  const seq = Number(participant.cert_sequence);
  if (!seq || seq <= 0) return 'PREVIEW';

  const rawType = participant.training_type || '';
  const prefix  = TO_SHORT_CODE[rawType] || rawType || 'CERT';

  // ── Year from END date (completion), fall back to start date ─────────────────
  const dateForYear = (participant.end_date && participant.end_date.trim())
    ? participant.end_date
    : participant.training_date;
  const year = dateForYear
    ? new Date(dateForYear.slice(0, 10)).getFullYear()
    : new Date().getFullYear();

  return `${prefix}-${String(seq).padStart(5, '0')}-${year}`;
}

// ─── Main generator ───────────────────────────────────────────────────────────
async function generateCertificate(participant) {
  const rawType      = participant.training_type;
  const trainingType = CANONICAL_TYPE[rawType] || rawType;
  const templateFile = TEMPLATE_MAP[rawType] || TEMPLATE_MAP[trainingType];

  if (!templateFile) throw new Error(`No template for training type: ${rawType}`);

  const templatePath = path.join(TEMPLATES_DIR, templateFile);
  if (!fs.existsSync(templatePath)) throw new Error(`Template file not found: ${templatePath}`);

  const templateBytes = fs.readFileSync(templatePath);
  const templateDoc   = await PDFDocument.load(templateBytes);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const [templatePage] = await pdfDoc.copyPages(templateDoc, [0]);
  pdfDoc.addPage(templatePage);

  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  const helvetica       = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  // pdf-lib uses bottom-left origin; templates are measured top-left.
  // flipY converts "distance from top" → pdf-lib y coordinate.
  const flipY    = (topY)           => height - topY;
  const white    = rgb(1, 1, 1);
  const black    = rgb(0, 0, 0);

  const whiteOut = (x, topY, w, h) =>
    page.drawRectangle({ x, y: flipY(topY + h), width: w, height: h, color: white });

  const drawCentered = (text, topY, font, fontSize, color = black) => {
    const tw = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, { x: (width - tw) / 2, y: flipY(topY), size: fontSize, font, color });
  };

  // ── Build cert ID first — we need it for whiteout sizing ────────────────────
  const certId = buildCertId(participant);
  const certIdW = helvetica.widthOfTextAtSize(certId, 10);

  // ─────────────────────────────────────────────────────────────────────────────
  // WHITE-OUT ZONES
  // All three templates have the cert number at the TOP-RIGHT corner.
  // The whiteout box covers the area where the original template text sits,
  // plus a generous margin so we never bleed over existing ink.
  //
  // Coordinates are measured from the TOP of the page (before flipY).
  // Cert-ID box: top-right corner, y ≈ 18–40px from top.
  // ─────────────────────────────────────────────────────────────────────────────
  if (trainingType === 'Dispatch Graduate') {
    whiteOut(150, 236, 560, 94);        // Participant name
    whiteOut(170, 325, 520, 30);        // Description line 1
    whiteOut(340, 373, 180, 15);        // Validity text
    whiteOut(270, 386, 320, 55);        // Date + location block
    whiteOut(width - certIdW - 30, 18, certIdW + 20, 22); // Cert ID top-right

  } else if (trainingType === 'Human Factors') {
    whiteOut(150, 236, 560, 94);        // Participant name
    whiteOut(140, 325, 580, 55);        // Description (3 lines)
    whiteOut(340, 398, 180, 15);        // Validity text
    whiteOut(270, 412, 320, 55);        // Date + location block
    whiteOut(width - certIdW - 30, 18, certIdW + 20, 22); // Cert ID top-right

  } else if (trainingType === 'Recurrent') {
    whiteOut(150, 219, 560, 93);        // Participant name
    whiteOut(120, 310, 620, 130);       // Body + date block
    whiteOut(width - certIdW - 30, 18, certIdW + 20, 22); // Cert ID top-right
  }

  // ── Cert ID — TOP-RIGHT on every template ────────────────────────────────────
  // x: right-align with 20px right margin
  // y: vertically centred in the 22px whiteout strip starting at top=18
  //    mid of strip = 18 + 11 = 29px from top → flipY(29) + 3 for font baseline
  page.drawText(certId, {
    x:     width - certIdW - 20,
    y:     flipY(32),          // ~32px from top of page
    size:  10,
    font:  helvetica,
    color: black,
  });

  // ── Participant name ─────────────────────────────────────────────────────────
  const nameText = (participant.participant_name || '').trim();
  let nameFontSize = 52;
  let nameWidth    = timesBoldItalic.widthOfTextAtSize(nameText, nameFontSize);
  if (nameWidth > 560) {
    nameFontSize = Math.floor(nameFontSize * 560 / nameWidth);
    nameWidth    = timesBoldItalic.widthOfTextAtSize(nameText, nameFontSize);
  }
  const nameBaselineY = trainingType === 'Recurrent' ? 285 : 295;
  page.drawText(nameText, {
    x:     (width - nameWidth) / 2,
    y:     flipY(nameBaselineY),
    size:  nameFontSize,
    font:  timesBoldItalic,
    color: black,
  });

  // ── Date on certificate = END DATE (training completion date) ───────────────
  // If end_date is set, use it; otherwise fall back to training_date.
  // This is what gets printed in large bold type on the certificate.
  const certDateStr = (participant.end_date && participant.end_date.trim())
    ? participant.end_date
    : participant.training_date;
  const dateText = formatDateUpper(certDateStr);

  // ── Location (optional, smaller text below the date) ─────────────────────────
  const locationText = (participant.location || '').trim();

  // ── Type-specific body content ────────────────────────────────────────────────
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
    if (locationText) drawCentered(locationText, 422, helvetica, 10);

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
    if (locationText) drawCentered(locationText, 450, helvetica, 10);

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
      ? (typeof participant.modules === 'string'
          ? participant.modules.split(',').map(m => m.trim()).filter(Boolean)
          : participant.modules)
      : [];

    let afterBodyY = 350;

    if (modules.length > 0) {
      drawCentered('Modules Completed:', 350, helveticaBold, 10);

      const colWidth  = 200;
      const startX    = (width - colWidth * 3) / 2;
      const modStartY = 364;

      modules.forEach((mod, idx) => {
        page.drawText(`\u2022  ${mod}`, {
          x:     startX + (idx % 3) * colWidth,
          y:     flipY(modStartY + Math.floor(idx / 3) * 12),
          size:  9,
          font:  helvetica,
          color: black,
        });
      });

      afterBodyY = modStartY + Math.ceil(modules.length / 3) * 12 + 8;
    }

    drawCentered('This certificate is valid for 1 Year from the date of training', afterBodyY, helvetica, 8);
    drawCentered(dateText, afterBodyY + 22, helveticaBold, 18);
    if (locationText) drawCentered(locationText, afterBodyY + 44, helvetica, 10);
  }

  return Buffer.from(await pdfDoc.save());
}

module.exports = { generateCertificate, MODULES_LIST };
