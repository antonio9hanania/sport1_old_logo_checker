import { validPairs } from "./app.js";
import { fetchImageAsBlob, resizeImageBlob } from "./utils.js";

async function checkImagePair(
  index,
  tableBody,
  threshold,
  urlOriginal,
  urlReplaced
) {
  const row = tableBody.insertRow();
  const cellIndex = row.insertCell(0);
  const cellOriginal = row.insertCell(1);
  const cellReplaced = row.insertCell(2);
  const cellSimilarity = row.insertCell(3);

  cellIndex.textContent = index;

  try {
    let originalBlob = await fetchImageAsBlob(urlOriginal);
    originalBlob = await resizeImageBlob(originalBlob, 100, 100);
    const originalUrl = URL.createObjectURL(originalBlob);
    cellOriginal.innerHTML = `<img src="${originalUrl}" alt="Original image ${index}">`;

    try {
      let replacedBlob = await fetchImageAsBlob(urlReplaced);
      replacedBlob = await resizeImageBlob(replacedBlob, 100, 100);
      const replacedUrl = URL.createObjectURL(replacedBlob);
      cellReplaced.innerHTML = `<img src="${replacedUrl}" alt="Replaced image ${index}">`;

      const similarity = await calculateSimilarity(originalBlob, replacedBlob);
      cellSimilarity.textContent = `${similarity.toFixed(2)}%`;

      validPairs.push({ index, originalBlob, replacedBlob, similarity });

      if (similarity < threshold) {
        row.classList.add("below-threshold");
      }
    } catch (error) {
      cellReplaced.textContent = "Not found";
      cellSimilarity.textContent = "0.00%";
    }
  } catch (error) {
    cellOriginal.textContent = "Not found";
    cellReplaced.textContent = "N/A";
    cellSimilarity.textContent = "N/A";
  }
}

async function calculateSimilarity(blob1, blob2) {
  // Both blobs should already be 100x100, but let's ensure it
  const resizedBlob1 = await resizeImageBlob(blob1, 100, 100);
  const resizedBlob2 = await resizeImageBlob(blob2, 100, 100);

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

function getImageData(img, width = 100, height = 100) {
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

export { checkImagePair, calculateSimilarity };
