import { getFontEmbedCSS, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { framePx, FRAME_SIZES } from "./constants";

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

export async function exportPng(frameKey) {
  const node = document.getElementById("poster-root");
  if (!node) throw new Error("Poster element not found");

  // Wait for all fonts to be fully loaded before capturing
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const [w, h] = framePx(frameKey);
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

export async function downloadPng(frameKey, albumName) {
  try {
    const dataUrl = await exportPng(frameKey);
    const link = document.createElement("a");
    link.download = `${(albumName || "poster").replace(/\s+/g, "_")}_${frameKey}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    alert("Export failed: " + err.message);
  }
}

export async function downloadPdf(frameKey, albumName) {
  try {
    const dataUrl = await exportPng(frameKey);
    const { cm } = FRAME_SIZES[frameKey];

    const pdf = new jsPDF({
      orientation: cm[0] > cm[1] ? "landscape" : "portrait",
      unit: "cm",
      format: [cm[0], cm[1]],
    });

    pdf.addImage(dataUrl, "PNG", 0, 0, cm[0], cm[1]);
    pdf.save(`${(albumName || "poster").replace(/\s+/g, "_")}_${frameKey}.pdf`);
  } catch (err) {
    alert("Export failed: " + err.message);
  }
}
