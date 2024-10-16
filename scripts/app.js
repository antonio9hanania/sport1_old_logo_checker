import { checkImagePair } from "./imageComparison.js";
import {
  updateProgress,
  showElement,
  hideElement,
  updateDownloadButton,
} from "./utils.js";

const corsProxy = "https://cold-sea-bd9d.antonioh.workers.dev/?apiurl=";
const baseUrlOriginal = "https://sport1.maariv.co.il/_365images/Competitors/";
const baseUrlReplaced =
  "https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Competitors:default1.png/v7/Competitors/";

let validPairs = [];

async function checkImages() {
  const startNum = parseInt(document.getElementById("startNum").value);
  const endNum = parseInt(document.getElementById("endNum").value);
  const similarityThreshold = parseFloat(
    document.getElementById("similarityThreshold").value
  );
  const originalCacheDuration = parseInt(
    document.getElementById("originalCacheDuration").value
  );
  const replacedCacheDuration = parseInt(
    document.getElementById("replacedCacheDuration").value
  );
  const tableBody = document.getElementById("imageTableBody");
  const progressBar = document.getElementById("progressBar");
  tableBody.innerHTML = "";
  validPairs = [];

  for (let i = startNum; i <= endNum; i++) {
    const urlOriginal = `${corsProxy}${encodeURIComponent(
      baseUrlOriginal + i + ".png"
    )}&originalCacheDuration=${originalCacheDuration}&replacedCacheDuration=${replacedCacheDuration}`;
    const urlReplaced = `${corsProxy}${encodeURIComponent(
      baseUrlReplaced + i
    )}&originalCacheDuration=${originalCacheDuration}&replacedCacheDuration=${replacedCacheDuration}`;
    const result = await checkImagePair(
      i,
      tableBody,
      similarityThreshold,
      urlOriginal,
      urlReplaced,
      originalCacheDuration,
      replacedCacheDuration
    );
    if (result) {
      validPairs.push(result);
    }
    updateProgress(progressBar, i - startNum + 1, endNum - startNum + 1);
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
