import { checkImagePair, calculateSimilarity } from "./imageComparison.js";
import {
  updateProgress,
  showElement,
  hideElement,
  updateDownloadButton,
} from "./utils.js";

const corsProxy = "https://cors-anywhere.herokuapp.com/";
const baseUrlOriginal = "https://sport1.maariv.co.il/_365images/Competitors/";
const baseUrlReplaced =
  "https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Competitors:default1.png/v7/Competitors/";

let validPairs = [];

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

      validPairs.push({
        index,
        originalBlob,
        replacedBlob,
        similarity,
        originalUrl,
        replacedUrl,
      });

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

function filterTable() {
  const rows = document.querySelectorAll("#imageTableBody tr");
  rows.forEach((row) => {
    if (row.classList.contains("below-threshold")) {
      showElement(row);
    } else {
      hideElement(row);
    }
  });
}

function showAllImages() {
  const rows = document.querySelectorAll("#imageTableBody tr");
  rows.forEach((row) => showElement(row));
}

function downloadImages(type) {
  const zip = new JSZip();
  const threshold = parseFloat(
    document.getElementById("similarityThreshold").value
  );

  validPairs.forEach((pair) => {
    if (
      type === "original" ||
      (type === "replaced" && pair.similarity < threshold)
    ) {
      zip.file(
        `${pair.index}.png`,
        type === "original" ? pair.originalBlob : pair.replacedBlob
      );
    }
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `${type}_images.zip`);
  });
}

// Event Listeners
document
  .getElementById("checkImagesBtn")
  .addEventListener("click", checkImages);
document
  .getElementById("filterTableBtn")
  .addEventListener("click", filterTable);
document
  .getElementById("showAllImagesBtn")
  .addEventListener("click", showAllImages);
document
  .getElementById("downloadOriginalBtn")
  .addEventListener("click", () => downloadImages("original"));
document
  .getElementById("downloadReplacedBtn")
  .addEventListener("click", () => downloadImages("replaced"));
document
  .getElementById("similarityThreshold")
  .addEventListener("change", updateDownloadButton);

export { validPairs };
