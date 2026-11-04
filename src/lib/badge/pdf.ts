import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
import { qrPayload } from "./token";
import type { CurrentEdition } from "@/lib/data/edition";

type BadgeVisitor = {
  ref: string;
  fullName: string;
  company: string;
  designation?: string;
  city?: string;
  country?: string;
};

const NAVY = rgb(0, 0x14 / 255, 0x33 / 255);
const GREEN = rgb(0x1d / 255, 0x80 / 255, 0x43 / 255);
const YELLOW = rgb(0xf9 / 255, 0xc9 / 255, 0);
const BLUE = rgb(0, 0x68 / 255, 0xaf / 255);
const MUTED = rgb(0x5b / 255, 0x6a / 255, 0x80 / 255);

const root = process.cwd();
const assets = {
  logo: path.join(root, "public/brand/iiev-9th-edition-logo-trimmed.png"),
  organiser: path.join(root, "public/brand/futurex-logo.png"),
  regular: path.join(root, "node_modules/@fontsource/montserrat/files/montserrat-latin-400-normal.woff"),
  bold: path.join(root, "node_modules/@fontsource/montserrat/files/montserrat-latin-800-normal.woff"),
  semibold: path.join(root, "node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff"),
};

let assetCache: Promise<Record<keyof typeof assets, Buffer>> | null = null;
function loadAssets() {
  if (!assetCache) {
    assetCache = Promise.all(Object.entries(assets).map(async ([k, p]) => [k, await readFile(p)] as const)).then(
      (entries) => Object.fromEntries(entries) as Record<keyof typeof assets, Buffer>,
    );
  }
  return assetCache;
}

function fitText(text: string, font: PDFFont, maxWidth: number, start: number, min: number) {
  let size = start;
  while (size > min && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.5;
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return { text, size };
  let t = text;
  while (t.length > 3 && font.widthOfTextAtSize(`${t}…`, size) > maxWidth) t = t.slice(0, -1);
  return { text: `${t}…`, size };
}

/**
 * A6 portrait badge (105 × 148 mm) — prints cleanly on A4 (4-up) or as a
 * standalone page, and is legible on a phone screen.
 */
export async function renderBadgePdf({ visitor, token, edition }: { visitor: BadgeVisitor; token: string; edition: CurrentEdition }) {
  const a = await loadAssets();
  const mm = (v: number) => (v * 72) / 25.4;
  const W = mm(105);
  const H = mm(148);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`IIEV Show ${edition.year} — Visitor Badge ${visitor.ref}`);
  doc.setAuthor("India International EV Show");
  doc.setSubject("Visitor entry badge");
  doc.setCreator("iievshow.com");

  const [regular, bold, semibold] = await Promise.all([
    doc.embedFont(a.regular, { subset: true }),
    doc.embedFont(a.bold, { subset: true }),
    doc.embedFont(a.semibold, { subset: true }),
  ]);
  const logo = await doc.embedPng(a.logo);
  const organiserLogo = await doc.embedPng(a.organiser);
  const qrPng = await QRCode.toBuffer(qrPayload(token), { errorCorrectionLevel: "M", margin: 1, width: 600, color: { dark: "#001433", light: "#ffffff" } });
  const qr = await doc.embedPng(qrPng);

  const page = doc.addPage([W, H]);
  const pad = mm(7);

  // Top brand bar (stylescape: green + yellow accents, minimal geometry)
  page.drawRectangle({ x: 0, y: H - mm(4), width: W, height: mm(4), color: GREEN });
  page.drawRectangle({ x: W * 0.62, y: H - mm(4), width: W * 0.38, height: mm(4), color: YELLOW });

  // Official logo — original aspect ratio preserved
  const logoW = W - pad * 2 - mm(14);
  const logoH = (logo.height / logo.width) * logoW;
  page.drawImage(logo, { x: (W - logoW) / 2, y: H - mm(8) - logoH, width: logoW, height: logoH });

  let y = H - mm(8) - logoH - mm(6);
  const dateLine = `${edition.dateLabel}`;
  page.drawText(dateLine, { x: (W - semibold.widthOfTextAtSize(dateLine, 9)) / 2, y, size: 9, font: semibold, color: NAVY });
  y -= mm(4.2);
  const venueLine = `${edition.venue.name}, ${edition.venue.locality}, ${edition.venue.city}`;
  const v = fitText(venueLine, regular, W - pad * 2, 7.5, 6);
  page.drawText(v.text, { x: (W - regular.widthOfTextAtSize(v.text, v.size)) / 2, y, size: v.size, font: regular, color: MUTED });

  // Name block
  y -= mm(10);
  const name = fitText(visitor.fullName.toUpperCase(), bold, W - pad * 2, 17, 10);
  page.drawText(name.text, { x: (W - bold.widthOfTextAtSize(name.text, name.size)) / 2, y, size: name.size, font: bold, color: NAVY });
  y -= mm(6);
  const company = fitText(visitor.company, semibold, W - pad * 2, 11, 7.5);
  page.drawText(company.text, { x: (W - semibold.widthOfTextAtSize(company.text, company.size)) / 2, y, size: company.size, font: semibold, color: BLUE });
  if (visitor.designation) {
    y -= mm(4.6);
    const des = fitText(visitor.designation, regular, W - pad * 2, 8.5, 6.5);
    page.drawText(des.text, { x: (W - regular.widthOfTextAtSize(des.text, des.size)) / 2, y, size: des.size, font: regular, color: MUTED });
  }

  // QR code — 34 mm square is comfortably readable by phone & handheld scanners
  const qrSize = mm(34);
  const qrY = mm(24);
  page.drawImage(qr, { x: (W - qrSize) / 2, y: qrY, width: qrSize, height: qrSize });
  const refText = visitor.ref;
  page.drawText(refText, { x: (W - semibold.widthOfTextAtSize(refText, 9)) / 2, y: qrY - mm(4.5), size: 9, font: semibold, color: NAVY });

  // Footer band: role + organiser
  page.drawRectangle({ x: 0, y: 0, width: W, height: mm(13), color: NAVY });
  page.drawRectangle({ x: 0, y: mm(13), width: W, height: mm(1.2), color: YELLOW });
  page.drawText("VISITOR", { x: pad, y: mm(5), size: 13, font: bold, color: rgb(1, 1, 1) });
  // Organiser logo on a white chip (its dark lettering needs a light ground)
  const oW = mm(26);
  const oH = (organiserLogo.height / organiserLogo.width) * oW;
  page.drawRectangle({ x: W - pad - oW - mm(2), y: mm(13) / 2 - oH / 2 - mm(1.2), width: oW + mm(4), height: oH + mm(2.4), color: rgb(1, 1, 1) });
  page.drawImage(organiserLogo, { x: W - pad - oW, y: mm(13) / 2 - oH / 2, width: oW, height: oH });

  page.drawText("Personal & non-transferable. Present at the registration desk.", {
    x: (W - regular.widthOfTextAtSize("Personal & non-transferable. Present at the registration desk.", 6)) / 2,
    y: mm(16),
    size: 6,
    font: regular,
    color: MUTED,
  });

  return doc.save();
}
