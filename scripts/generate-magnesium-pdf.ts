/**
 * Generates public/magnesium-guide.pdf — a text-accessible companion edition of
 * "The Complete Guide to Magnesium", derived from src/lib/magnesium-content.json
 * (itself extracted from the owner's manuscript 202608051957-magnesium.docx).
 *
 * This is intentionally a PLAIN TEXT companion: it includes the full manuscript
 * text with headings, bullets and paragraphs, but does not reproduce the
 * illustrations, colours, ratings symbols or page layout of the original
 * document. It is NOT a visual-fidelity replica.
 *
 * Usage: bun run scripts/generate-magnesium-pdf.ts
 * Deterministic: same input => same bytes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument, PDFFont, rgb } from "pdf-lib";
import * as fontkit from "fontkit";

const ROOT = process.cwd();
const OUT = join(ROOT, "public", "magnesium-guide.pdf");
const FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

const PAGE_W = 595.28; // A4 portrait
const PAGE_H = 841.89;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;
const GRAY = rgb(0.35, 0.35, 0.35);
const DARK = rgb(0.13, 0.16, 0.13);
const RULE = rgb(0.82, 0.82, 0.82);

// The manuscript uses emoji "truth meter" dots (🟢/🟡/🟠/🔴). DejaVu Sans has no
// colour emoji glyphs, so they are rendered as a plain monochrome bullet. The
// rating word ("Well Supported", "Promising", ...) always follows and is kept
// verbatim.
const EMOJI_DOT = "●";
function glyphSafe(text: string): string {
  return text.replace(/[🟢🟡🟠🔴]/g, EMOJI_DOT);
}

type Block = { s: string; t: string };

interface Ctx {
  doc: import("pdf-lib").PDFDocument;
  regular: PDFFont;
  bold: PDFFont;
  page: import("pdf-lib").PDFPage;
  y: number; // current baseline, from top of page
  pageNo: number;
}

function newPage(ctx: Ctx): void {
  const page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.page = page;
  ctx.y = PAGE_H - MARGIN;
  ctx.pageNo += 1;
  drawFooter(ctx);
}

function drawFooter(ctx: Ctx): void {
  const text = "The Complete Guide to Magnesium · Text companion edition · Page " + ctx.pageNo;
  ctx.page.drawText(text, {
    x: MARGIN,
    y: MARGIN - 20,
    size: 8,
    font: ctx.regular,
    color: GRAY,
  });
}

/** Advance by `dy`; open a new page if the cursor would pass the bottom margin. */
function ensureSpace(ctx: Ctx, dy: number): void {
  if (ctx.y - dy < MARGIN + 24) newPage(ctx);
}

/** Draw wrapped text starting at current cursor; returns lines drawn. */
function drawWrapped(
  ctx: Ctx,
  text: string,
  opts: { size: number; font: PDFFont; color?: typeof DARK; indent?: number; hanging?: boolean; lineGap?: number; spaceAfter?: number },
): void {
  const size = opts.size;
  const lineGap = opts.lineGap ?? size * 1.42;
  const spaceAfter = opts.spaceAfter ?? 4;
  const indent = opts.indent ?? 0;
  const hanging = opts.hanging ?? false;
  const color = opts.color ?? DARK;
  const maxWidth = CONTENT_W - indent - (hanging ? 12 : 0);

  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? line + " " + word : word;
    if (ctx.regular.widthOfTextAtSize(candidate, size) <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);

  for (let i = 0; i < lines.length; i++) {
    ensureSpace(ctx, lineGap);
    const x = MARGIN + indent + (i === 0 && hanging ? 12 : 0);
    ctx.page.drawText(lines[i], { x, y: ctx.y, size, font: opts.font, color });
    ctx.y -= lineGap;
  }
  ctx.y -= spaceAfter;
}

function drawRule(ctx: Ctx): void {
  ensureSpace(ctx, 16);
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y + 4 },
    end: { x: PAGE_W - MARGIN, y: ctx.y + 4 },
    thickness: 0.6,
    color: RULE,
  });
  ctx.y -= 10;
}

function heading(ctx: Ctx, text: string, level: "h1" | "h2" | "h3"): void {
  const sizes = { h1: 15.5, h2: 12.5, h3: 10.5 } as const;
  const gaps = { h1: 9, h2: 8, h3: 6 } as const;
  const size = sizes[level];
  const gap = gaps[level];

  // Wrap the heading so long titles never overflow the content width.
  const words = glyphSafe(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? line + " " + word : word;
    if (ctx.bold.widthOfTextAtSize(candidate, size) <= CONTENT_W || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);

  ensureSpace(ctx, size * 1.5 * lines.length + gap);
  for (const ln of lines) {
    ctx.page.drawText(ln, { x: MARGIN, y: ctx.y, size, font: ctx.bold, color: DARK });
    ctx.y -= size * 1.5;
  }
  ctx.y -= gap;
}

function paragraph(ctx: Ctx, text: string): void {
  drawWrapped(ctx, glyphSafe(text), { size: 10.5, font: ctx.regular, spaceAfter: 6 });
}

function bullet(ctx: Ctx, text: string): void {
  drawWrapped(ctx, glyphSafe("• " + text), {
    size: 10.5,
    font: ctx.regular,
    indent: 16,
    hanging: true,
    spaceAfter: 3,
  });
}

function blockquote(ctx: Ctx, text: string): void {
  drawWrapped(ctx, glyphSafe(text), { size: 10.5, font: ctx.regular, indent: 20, spaceAfter: 6, color: GRAY });
}

async function main(): Promise<void> {
  const data: Block[] = JSON.parse(readFileSync(join(ROOT, "src", "lib", "magnesium-content.json"), "utf8"));

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(readFileSync(FONT_REGULAR));
  const bold = await doc.embedFont(readFileSync(FONT_BOLD));

  const ctx: Ctx = { doc, regular, bold, page: doc.addPage([PAGE_W, PAGE_H]), y: PAGE_H - MARGIN, pageNo: 1 };

  // ---------- Cover page ----------
  ctx.page.drawText("TAFAT EVIDENCE GUIDE", { x: MARGIN, y: ctx.y, size: 11, font: bold, color: GRAY });
  ctx.y -= 40;
  ctx.page.drawText("The Complete Guide to", { x: MARGIN, y: ctx.y, size: 27, font: bold, color: DARK });
  ctx.y -= 34;
  ctx.page.drawText("Magnesium", { x: MARGIN, y: ctx.y, size: 27, font: bold, color: DARK });
  ctx.y -= 22;
  ctx.page.drawText("Text-accessible companion edition", { x: MARGIN, y: ctx.y, size: 13, font: regular, color: GRAY });
  ctx.y -= 30;
  drawRule(ctx);

  const about = [
    "About this PDF",
    "This file is a plain-text companion to the online article at https://tafat.co.uk/health-wellness/the-complete-guide-to-magnesium.",
    "It contains the complete text of the guide so it can be read offline and by screen readers. It is intentionally simple: it does not reproduce the illustrations, colours, ratings symbols, tables or page layout of the original document. For the designed version with images, please read the article online.",
  ];
  ctx.page.drawText(about[0], { x: MARGIN, y: ctx.y, size: 12, font: bold, color: DARK });
  ctx.y -= 20;
  drawWrapped(ctx, about[1], { size: 10, font: regular, spaceAfter: 4 });
  drawWrapped(ctx, about[2], { size: 10, font: regular, spaceAfter: 10 });

  const warn = "Educational guide, not medical advice. This guide is for education and does not diagnose, prevent, treat or cure disease. Speak with a qualified healthcare professional about your circumstances, medicines or supplements.";
  drawWrapped(ctx, warn, { size: 10, font: regular, spaceAfter: 10, color: GRAY });

  ctx.page.drawText("Published August 2026 · Last reviewed August 2026 · Based on the owner's manuscript (2026-08-05)", {
    x: MARGIN, y: ctx.y, size: 9.5, font: regular, color: GRAY,
  });
  ctx.y -= 40;

  ctx.page.drawText("Contents", { x: MARGIN, y: ctx.y, size: 12, font: bold, color: DARK });
  ctx.y -= 20;
  const h1s = data.filter((x) => x.s === "Heading1");
  for (const h of h1s) {
    ensureSpace(ctx, 16);
    ctx.page.drawText(glyphSafe(h.t), { x: MARGIN + 4, y: ctx.y, size: 10, font: regular, color: DARK });
    ctx.y -= 15;
  }

  // ---------- Body ----------
  let firstH1 = true;
  for (const block of data) {
    const s = block.s;
    if (s === "Heading1") {
      if (firstH1) {
        // Start the body on a fresh page after the cover.
        newPage(ctx);
        firstH1 = false;
      } else {
        newPage(ctx);
      }
      heading(ctx, block.t, "h1");
    } else if (s === "Heading2") {
      heading(ctx, block.t, "h2");
    } else if (s === "Heading3" || s === "Heading4") {
      heading(ctx, block.t, "h3");
    } else if (s === "Compact") {
      bullet(ctx, block.t);
    } else if (s === "BlockText") {
      blockquote(ctx, block.t);
    } else {
      paragraph(ctx, block.t);
    }
  }

  const bytes = await doc.save({ useObjectStreams: false });
  writeFileSync(OUT, bytes);
  console.log(`Wrote ${OUT} (${bytes.length} bytes, ${ctx.doc.getPageCount()} pages)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
