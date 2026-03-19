import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { framePx, FRAME_SIZES } from "./constants";

/**
 * Convert all images in the poster to base64 data URLs to avoid CORS issues during export.
 * This is necessary because html-to-image cannot access cross-origin images.
 */
async function preloadImages(node) {
  const images = node.querySelectorAll("img");
  const promises = Array.from(images).map(async (img) => {
    if (img.src.startsWith("data:")) return; // Already a data URL
    if (!img.src) return;
    
    try {
      const response = await fetch(img.src, { mode: "cors" });
      const blob = await response.blob();
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      img.src = dataUrl;
    } catch (err) {
      console.warn("[v0] Failed to preload image:", img.src, err);
      // Continue without this image - better than failing the whole export
    }
  });
  await Promise.all(promises);
}

export async function exportPng(frameKey) {
  const node = document.getElementById("poster-root");
  if (!node) throw new Error("Poster element not found");

  // Preload all images as base64 to avoid CORS issues
  await preloadImages(node);

  const [w, h] = framePx(frameKey);
  const rect = node.getBoundingClientRect();
  const ratio = w / rect.width;

  const dataUrl = await toPng(node, {
    canvasWidth: w,
    canvasHeight: h,
    pixelRatio: ratio,
    cacheBust: true,
    skipAutoScale: true,
    includeQueryParams: true,
  });

  return dataUrl;
}

export async function downloadPng(frameKey, albumName) {
  const dataUrl = await exportPng(frameKey);
  const link = document.createElement("a");
  link.download = `${(albumName || "poster").replace(/\s+/g, "_")}_${frameKey}.png`;
  link.href = dataUrl;
  link.click();
}

export async function downloadPdf(frameKey, albumName) {
  const dataUrl = await exportPng(frameKey);
  const { cm } = FRAME_SIZES[frameKey];

  const pdf = new jsPDF({
    orientation: cm[0] > cm[1] ? "landscape" : "portrait",
    unit: "cm",
    format: [cm[0], cm[1]],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, cm[0], cm[1]);
  pdf.save(`${(albumName || "poster").replace(/\s+/g, "_")}_${frameKey}.pdf`);
}
