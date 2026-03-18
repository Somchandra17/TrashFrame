/**
 * Extract dominant colors from an image URL using canvas pixel sampling.
 * Returns an array of 3-5 hex color strings sorted by frequency.
 */
export async function extractDominantColors(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        const buckets = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          const key = `${r},${g},${b}`;
          buckets.set(key, (buckets.get(key) || 0) + 1);
        }

        const sorted = [...buckets.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([key]) => {
            const [r, g, b] = key.split(",").map(Number);
            return (
              "#" +
              [r, g, b]
                .map((c) =>
                  Math.min(255, c).toString(16).padStart(2, "0")
                )
                .join("")
            );
          });

        resolve(sorted.length >= 2 ? sorted : ["#111111", "#333333"]);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for color extraction"));
    img.src = imageUrl;
  });
}
