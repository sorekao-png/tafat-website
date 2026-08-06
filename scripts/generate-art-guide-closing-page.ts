/**
 * Generates public/downloads/art-guide-closing-page.pdf — the designed closing
 * page for the TAFAT Art & Creative Studio Illustrated Guide.
 *
 * Page size matches the infographic pages produced by img2pdf at 150 DPI:
 * 1024/150*72 = 491.52 pt wide, 1536/150*72 = 737.28 pt high (2:3 portrait).
 *
 * Copy is taken verbatim from the supplied infographic pages' shared footer:
 * "INDEPENDENT. RESEARCH-BASED. HONEST." / "BETTER INFORMATION. BETTER
 * CHOICES. BETTER LIVING." / "Editorial independence: Our recommendations are
 * based on evidence and real-world performance, not sponsorships." /
 * "FOR EDUCATIONAL PURPOSES ONLY - NOT A SUBSTITUTE FOR PROFESSIONAL ADVICE!"
 *
 * Usage: bun run scripts/generate-art-guide-closing-page.ts
 * Deterministic: same input => same bytes.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";

const OUT = join(process.cwd(), "public", "downloads", "art-guide-closing-page.pdf");

const W = 491.52; // 1024 px @ 150 DPI
const H = 737.28; // 1536 px @ 150 DPI

// TAFAT brand palette (from src/styles/app.css)
const CREAM = rgb(0.964, 0.957, 0.925); // #f6f4ec
const PAPER = rgb(1, 0.996, 0.976); // #fffef9
const INK = rgb(0.145, 0.204, 0.184); // #25342f
const INK_SOFT = rgb(0.235, 0.302, 0.275); // #3c4d46
const MUTED = rgb(0.392, 0.451, 0.42); // #64736b
const SAGE_DEEP = rgb(0.341, 0.455, 0.361); // #57745c
const SAGE = rgb(0.867, 0.906, 0.847); // #dde7d8
const CLAY = rgb(0.757, 0.443, 0.247); // #c1713f
const GOLD = rgb(0.725, 0.549, 0.243); // #b98c3e
const LINE = rgb(0.886, 0.886, 0.847); // #e2e2d8

async function main() {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });

  // ---- header band ----
  page.drawRectangle({ x: 0, y: H - 150, width: W, height: 150, color: SAGE_DEEP });
  page.drawCircle({ x: 44, y: H - 62, size: 17, color: PAPER });
  page.drawText("t", { x: 44, y: H - 73, size: 22, font: bold, color: SAGE_DEEP, lineHeight: 22 });
  const brandW = regular.widthOfTextAtSize("tafat", 15);
  page.drawText("tafat", { x: 44 + 26, y: H - 71, size: 15, font: bold, color: PAPER });
  page.drawText("ART & CREATIVE STUDIO", { x: 44, y: H - 118, size: 10.5, font: bold, color: SAGE, letterSpacing: 3 });
  page.drawText("ILLUSTRATED GUIDE", { x: 44, y: H - 136, size: 10.5, font: bold, color: SAGE, letterSpacing: 3 });

  // ---- headline ----
  const h1 = "Better information.";
  const h2 = "Better choices.";
  const h3 = "Better living.";
  page.drawText(h1, { x: 44, y: H - 212, size: 24, font: bold, color: INK });
  page.drawText(h2, { x: 44, y: H - 244, size: 24, font: bold, color: INK });
  page.drawText(h3, { x: 44, y: H - 276, size: 24, font: bold, color: CLAY });

  page.drawText("INDEPENDENT. RESEARCH-BASED. HONEST.", {
    x: 44, y: H - 306, size: 10, font: bold, color: MUTED, letterSpacing: 2,
  });

  // ---- closing statement ----
  const para =
    "Thank you for reading. Every guide in this collection was built to help you " +
    "choose artist materials with confidence — through transparent evidence, honest " +
    "comparison, and real-world understanding. Explore the Art & Creative Studio " +
    "Evidence Library at tafat.co.uk for more guides, and check back as TAFAT " +
    "Product Evaluations are published under the TAFAT Editorial Standard.";
  drawWrapped(page, regular, para, {
    x: 44, y: H - 356, size: 10.5, color: INK_SOFT, lineGap: 7, maxWidth: W - 88,
  });

  // ---- truth-meter style summary card ----
  const cardY = H - 470;
  page.drawRectangle({ x: 44, y: cardY - 96, width: W - 88, height: 84, color: PAPER, borderColor: LINE, borderWidth: 1 });
  page.drawText("HONEST ABOVE ALL", { x: 60, y: cardY - 22, size: 11, font: bold, color: SAGE_DEEP });
  page.drawText("EVIDENCE LED", { x: 60, y: cardY - 44, size: 11, font: bold, color: SAGE_DEEP });
  page.drawText("ARTIST FIRST", { x: 60, y: cardY - 66, size: 11, font: bold, color: SAGE_DEEP });
  page.drawText("TAFAT.co.uk", { x: 44, y: cardY - 88, size: 9, font: regular, color: MUTED });

  // ---- disclosures ----
  const disc1 = "Editorial independence: Our recommendations are based on evidence and real-world performance, not sponsorships.";
  const disc2 = "FOR EDUCATIONAL PURPOSES ONLY - NOT A SUBSTITUTE FOR PROFESSIONAL ADVICE!";
  page.drawText(disc1, { x: 44, y: cardY - 128, size: 8.5, font: regular, color: MUTED });
  page.drawText(disc2, { x: 44, y: cardY - 144, size: 8.5, font: bold, color: MUTED });

  // ---- footer ----
  page.drawLine({ start: { x: 44, y: 60 }, end: { x: W - 44, y: 60 }, thickness: 1, color: LINE });
  page.drawText("TAFAT", { x: 44, y: 38, size: 9, font: bold, color: INK });
  page.drawText("tafat.co.uk", { x: W - 44 - regular.widthOfTextAtSize("tafat.co.uk", 9), y: 38, size: 9, font: regular, color: MUTED });

  const bytes = await doc.save();
  writeFileSync(OUT, bytes);
  console.log(`wrote ${OUT} (${bytes.length} bytes)`);
}

function drawWrapped(
  page: import("pdf-lib").PDFPage,
  font: PDFFont,
  text: string,
  opts: { x: number; y: number; size: number; color: Parameters<import("pdf-lib").PDFPage["drawText"]>[1] extends infer _ ? any : any; lineGap: number; maxWidth: number },
) {
  const words = text.split(/\s+/);
  let line = "";
  let y = opts.y;
  for (const word of words) {
    const candidate = line ? line + " " + word : word;
    if (font.widthOfTextAtSize(candidate, opts.size) <= opts.maxWidth || !line) {
      line = candidate;
    } else {
      page.drawText(line, { x: opts.x, y, size: opts.size, font, color: opts.color });
      y -= opts.lineGap;
      line = word;
    }
  }
  if (line) page.drawText(line, { x: opts.x, y, size: opts.size, font, color: opts.color });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
