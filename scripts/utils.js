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

async function fetchImageAsBlob(url, retries = 3, baseDelay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error;
      await delay(baseDelay * Math.pow(2, i)); // Exponential backoff
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export {
  updateProgress,
  showElement,
  hideElement,
  updateDownloadButton,
  fetchImageAsBlob,
  delay,
};
