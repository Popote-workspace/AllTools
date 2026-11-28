export type PrintableDocument = {
  title: string;
  number: string;
  currency: string;
  businessName: string;
  businessDetails: string[];
  customerName: string;
  customerDetails: string[];
  dates: { label: string; value: string }[];
  items: { description: string; details: string; amount: string }[];
  totals: { label: string; value: string }[];
  notes: string[];
  signatureLabel?: string;
};

function printableText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function downloadDocumentPdf(data: PrintableDocument): Promise<void> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.13, 0.18, 0.2);
  const muted = rgb(0.38, 0.43, 0.45);
  const accent = rgb(0.04, 0.48, 0.46);
  const rule = rgb(0.84, 0.88, 0.88);
  const pageSize: [number, number] = [612, 792];
  let page = pdf.addPage(pageSize);
  let y = 748;

  const addPage = () => {
    page = pdf.addPage(pageSize);
    y = 748;
    page.drawText(`${printableText(data.title)} - continued`, {
      x: 48,
      y,
      size: 12,
      font: bold,
      color: accent,
    });
    y -= 30;
  };

  const wrap = (text: string, font: typeof regular, size: number, maxWidth: number) => {
    const words = printableText(text).split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !line) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines.length > 0 ? lines : [""];
  };

  const drawBlock = (
    text: string,
    x: number,
    top: number,
    maxWidth: number,
    size = 10,
    font = regular,
    color = ink,
  ) => {
    const lines = wrap(text, font, size, maxWidth);
    lines.forEach((line, index) => {
      page.drawText(line, { x, y: top - (index + 1) * (size + 3), size, font, color });
    });
    return top - lines.length * (size + 3);
  };

  const safeNumber = printableText(data.number) || "-";
  page.drawText(printableText(data.businessName) || "Business name", {
    x: 48,
    y,
    size: 19,
    font: bold,
    color: ink,
  });
  page.drawText(printableText(data.title).toUpperCase(), {
    x: 382,
    y: y - 1,
    size: 16,
    font: bold,
    color: accent,
  });
  y -= 28;
  for (const detail of data.businessDetails) {
    y = drawBlock(detail, 48, y, 280, 9, regular, muted);
  }
  page.drawText(`No. ${safeNumber}`, { x: 382, y: 712, size: 10, font: bold, color: ink });
  let dateY = 694;
  for (const date of data.dates) {
    const label = printableText(date.label);
    const value = printableText(date.value) || "-";
    page.drawText(`${label}: ${value}`, { x: 382, y: dateY, size: 9, font: regular, color: muted });
    dateY -= 15;
  }

  page.drawLine({ start: { x: 48, y: 664 }, end: { x: 564, y: 664 }, thickness: 1, color: rule });
  page.drawText("PREPARED FOR", { x: 48, y: 642, size: 8, font: bold, color: muted });
  let customerY = drawBlock(data.customerName || "Customer", 48, 628, 250, 12, bold, ink);
  for (const detail of data.customerDetails) {
    customerY = drawBlock(detail, 48, customerY, 250, 9, regular, muted);
  }

  y = 570;
  page.drawLine({ start: { x: 48, y: y + 9 }, end: { x: 564, y: y + 9 }, thickness: 1, color: rule });
  page.drawText("DESCRIPTION", { x: 48, y, size: 8, font: bold, color: muted });
  page.drawText("DETAILS", { x: 354, y, size: 8, font: bold, color: muted });
  page.drawText("AMOUNT", { x: 485, y, size: 8, font: bold, color: muted });
  y -= 17;

  for (const item of data.items) {
    const descriptionLines = wrap(item.description || "Item", regular, 9, 285);
    const rowHeight = Math.max(15, descriptionLines.length * 12);
    if (y - rowHeight < 92) addPage();
    descriptionLines.forEach((line, index) => {
      page.drawText(line, { x: 48, y: y - index * 12, size: 9, font: regular, color: ink });
    });
    page.drawText(printableText(item.details), { x: 354, y, size: 9, font: regular, color: muted });
    page.drawText(printableText(item.amount), { x: 485, y, size: 9, font: regular, color: ink });
    y -= rowHeight + 4;
    page.drawLine({ start: { x: 48, y: y + 2 }, end: { x: 564, y: y + 2 }, thickness: 0.5, color: rule });
  }

  y -= 12;
  for (const total of data.totals) {
    if (y < 95) addPage();
    const label = printableText(total.label);
    const value = printableText(total.value);
    page.drawText(label, { x: 350, y, size: 9, font: total.label === "Total" ? bold : regular, color: muted });
    page.drawText(value, { x: 485, y, size: 9, font: bold, color: ink });
    y -= 17;
  }

  for (const note of data.notes) {
    if (!note.trim()) continue;
    if (y < 115) addPage();
    y -= 10;
    y = drawBlock(note, 48, y, 516, 9, regular, muted);
  }

  if (data.signatureLabel) {
    if (y < 120) addPage();
    y -= 38;
    page.drawLine({ start: { x: 48, y }, end: { x: 278, y }, thickness: 1, color: rule });
    page.drawText(printableText(data.signatureLabel), { x: 48, y: y - 14, size: 8, font: regular, color: muted });
  }

  const pages = pdf.getPages();
  pages.forEach((currentPage, index) => {
    currentPage.drawText(`Created with AllTools | Page ${index + 1} of ${pages.length}`, {
      x: 48,
      y: 30,
      size: 8,
      font: regular,
      color: muted,
    });
  });

  const bytes = await pdf.save();
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${(printableText(data.title) || "business-document").toLowerCase().replace(/\s+/g, "-")}-${safeNumber.replace(/[^a-zA-Z0-9-_]/g, "")}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}