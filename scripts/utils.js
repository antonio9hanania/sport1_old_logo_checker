function updateProgress(progressBar, checked, total) {
  const percentage = (checked / total) * 100;
  progressBar.textContent = `Progress: ${percentage.toFixed(
    2
  )}% (${checked}/${total})`;
}

function showElement(element) {
  if (typeof element === "string") {
    element = document.getElementById(element);
  }
  element.classList.remove("hidden");
}

function hideElement(element) {
  if (typeof element === "string") {
    element = document.getElementById(element);
  }
  element.classList.add("hidden");
}

function updateDownloadButton() {
  const threshold = document.getElementById("similarityThreshold").value;
  const downloadButton = document.getElementById("downloadReplacedBtn");
  downloadButton.textContent = `Download Replaced Images (Below ${threshold}% Similarity)`;
}

async function fetchImageAsBlob(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.blob();
}

async function resizeImageBlob(blob, width, height) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((resizedBlob) => {
        resolve(resizedBlob);
      }, "image/png");
    };
    img.src = URL.createObjectURL(blob);
  });
}

export {
  updateProgress,
  showElement,
  hideElement,
  updateDownloadButton,
  fetchImageAsBlob,
  resizeImageBlob,
};
