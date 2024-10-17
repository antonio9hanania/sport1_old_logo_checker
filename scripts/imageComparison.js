import { fetchImageWithCache, resizeImageBlob } from "./utils.js";

export async function checkImagePair(
  index,
  tableBody,
  threshold,
  urlOriginal,
  urlReplaced,
  originalCacheDuration,
  replacedCacheDuration
) {
  const row = tableBody.insertRow();
  const cellIndex = row.insertCell(0);
  const cellOriginal = row.insertCell(1);
  const cellReplaced = row.insertCell(2);
  const cellSimilarity = row.insertCell(3);

  cellIndex.textContent = index;

  try {
    let originalBlob = await fetchImageWithCache(
      urlOriginal,
      true,
      originalCacheDuration,
      replacedCacheDuration
    );
    originalBlob = await resizeImageBlob(base64ToBlob(originalBlob), 100, 100);
    const originalUrl = URL.createObjectURL(originalBlob);
    cellOriginal.innerHTML = `<img src="${originalUrl}" alt="Original image ${index}" width="100" height="100">`;

    try {
      let replacedBlob = await fetchImageWithCache(
        urlReplaced,
        false,
        originalCacheDuration,
        replacedCacheDuration
      );
      replacedBlob = await resizeImageBlob(
        base64ToBlob(replacedBlob),
        100,
        100
      );
      const replacedUrl = URL.createObjectURL(replacedBlob);
      cellReplaced.innerHTML = `<img src="${replacedUrl}" alt="Replaced image ${index}" width="100" height="100">`;

      const similarity = await calculateSimilarity(originalBlob, replacedBlob);
      cellSimilarity.textContent = `${similarity.toFixed(2)}%`;

      if (similarity < threshold) {
        row.classList.add("below-threshold");
      }

      return { index, originalBlob, replacedBlob, similarity };
    } catch (error) {
      cellReplaced.textContent = "Not found";
      cellSimilarity.textContent = "0.00%";
    }
  } catch (error) {
    cellOriginal.textContent = "Not found";
    cellReplaced.textContent = "N/A";
    cellSimilarity.textContent = "N/A";
  }

  return null;
}

function base64ToBlob(base64) {
  const parts = base64.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

async function calculateSimilarity(blob1, blob2) {
  const [hash1, hash2] = await Promise.all([
    getImageHash(blob1),
    getImageHash(blob2),
  ]);
  const distance = hammingDistance(hash1, hash2);
  return 100 - (distance / hash1.length) * 100;
}

async function getImageHash(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      const imageData = getImageData(img);
      const grayscale = imageToGrayscale(imageData);
      const hash = computeHash(grayscale);
      resolve(hash);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

function getImageData(img, width = 8, height = 8) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

function imageToGrayscale(imageData) {
  const grayscale = new Uint8Array(imageData.width * imageData.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    grayscale[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return grayscale;
}

function computeHash(grayscale) {
  const average =
    grayscale.reduce((sum, value) => sum + value, 0) / grayscale.length;
  return grayscale.map((value) => (value > average ? 1 : 0)).join("");
}

function hammingDistance(hash1, hash2) {
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}
