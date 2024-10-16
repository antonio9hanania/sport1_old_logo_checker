import { checkImagePair, calculateSimilarity } from "./imageComparison.js";
import {
  updateProgress,
  showElement,
  hideElement,
  updateDownloadButton,
  delay,
} from "./utils.js";

const corsProxy = "https://cors-anywhere.herokuapp.com/";
const baseUrlOriginal = "https://sport1.maariv.co.il/_365images/Competitors/";
const baseUrlReplaced =
  "https://imagecache.365scores.com/image/upload/f_png,w_50,h_50,c_limit,q_auto:eco,dpr_2,d_Competitors:default1.png/v7/Competitors/25623";

let validPairs = [];

async function checkImages() {
  const startNum = parseInt(document.getElementById("startNum").value);
  const endNum = parseInt(document.getElementById("endNum").value);
  const similarityThreshold = parseFloat(
    document.getElementById("similarityThreshold").value
  );
  const tableBody = document.getElementById("imageTableBody");
  const progressBar = document.getElementById("progressBar");
  tableBody.innerHTML = "";
  validPairs = [];

  for (let i = startNum; i <= endNum; i++) {
    const urlOriginal = `${corsProxy}${baseUrlOriginal}${i}.png`;
    const urlReplaced = `${corsProxy}${baseUrlReplaced}${i}`;
    try {
      await checkImagePair(
        i,
        tableBody,
        similarityThreshold,
        urlOriginal,
        urlReplaced
      );
      updateProgress(progressBar, i - startNum + 1, endNum - startNum + 1);
      await delay(1000); // Add a 1-second delay between requests
    } catch (error) {
      console.error(`Error checking image pair ${i}:`, error);
      // Add the error to the table
      const row = tableBody.insertRow();
      row.insertCell(0).textContent = i;
      row.insertCell(1).textContent = "Error: " + error.message;
      row.insertCell(2).textContent = "N/A";
      row.insertCell(3).textContent = "N/A";
      await delay(5000); // Wait 5 seconds before next attempt
    }
  }

  showElement("downloadButtons");
  showElement("controlButtons");
  updateDownloadButton();
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

// Export functions to make them globally available
window.checkImages = checkImages;
window.filterTable = filterTable;
window.showAllImages = showAllImages;
window.downloadImages = downloadImages;

export { validPairs };
