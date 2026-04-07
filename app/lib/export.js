import { getFontEmbedCSS, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { framePx, FRAME_SIZES } from "./constants";

function getDownloadBaseName(itemName, frameKey) {
  const safeName = (itemName || "poster")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, " ")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `${safeName || "poster"}_${frameKey}`;
}

async function getSafeFontEmbedCSS(node) {
  try {
    return await getFontEmbedCSS(node, {
      preferredFontFormat: "woff2",
    });
  } catch (err) {
    console.warn(
      "html-to-image font embedding failed, exporting without embedded web fonts.",
      err,
    );
    return "";
  }
}

export async function exportPng(frameKey, dpi = 300) {
  const node = document.getElementById("poster-root");
  if (!node) throw new Error("Poster element not found");

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const [w, h] = framePx(frameKey, dpi);
  const rect = node.getBoundingClientRect();
  const ratio = w / rect.width;
  const fontEmbedCSS = await getSafeFontEmbedCSS(node);

  try {
    const dataUrl = await toPng(node, {
      canvasWidth: w,
      canvasHeight: h,
      pixelRatio: ratio,
      cacheBust: true,
      preferredFontFormat: "woff2",
      fontEmbedCSS,
      skipFonts: !fontEmbedCSS,
    });
    return dataUrl;
  } catch (err) {
    console.error("html-to-image error:", err);
    throw err;
  }
}

export async function downloadPng(frameKey, albumName, dpi = 300) {
  const dataUrl = await exportPng(frameKey, dpi);
  const link = document.createElement("a");
  link.download = `${getDownloadBaseName(albumName, frameKey)}.png`;
  link.href = dataUrl;
  link.click();
}

export async function downloadPdf(frameKey, albumName, dpi = 300) {
  const dataUrl = await exportPng(frameKey, dpi);
  const { cm } = FRAME_SIZES[frameKey];

  const pdf = new jsPDF({
    orientation: cm[0] > cm[1] ? "landscape" : "portrait",
    unit: "cm",
    format: [cm[0], cm[1]],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, cm[0], cm[1]);
  pdf.save(`${getDownloadBaseName(albumName, frameKey)}.pdf`);
}
