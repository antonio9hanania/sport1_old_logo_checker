// Default cache durations (in seconds)
const DEFAULT_REPLACED_CACHE_DURATION = 60 * 60 * 24 * 21; // 3 weeks
const DEFAULT_ORIGINAL_CACHE_DURATION = 60 * 60; // 1 hour

function getCachedImage(url) {
  const cachedData = localStorage.getItem(url);
  if (cachedData) {
    const { timestamp, data, expiration } = JSON.parse(cachedData);
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    if (now < expiration) {
      return data;
    }
  }
  return null;
}

function setCachedImage(url, data, maxAge) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const cacheData = JSON.stringify({
      timestamp: now,
      expiration: now + maxAge,
      data: data,
    });
    localStorage.setItem(url, cacheData);
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      console.warn("Local storage quota exceeded. Unable to cache image.");
      // Optionally, you could try to clear some old cached items here
    } else {
      console.error("Error setting cached image:", error);
    }
  }
}

export async function fetchImageWithCache(
  url,
  isOriginal,
  originalCacheDuration,
  replacedCacheDuration
) {
  try {
    const cachedImage = getCachedImage(url);
    if (cachedImage) {
      return cachedImage;
    }

    const cacheDuration = isOriginal
      ? originalCacheDuration || DEFAULT_ORIGINAL_CACHE_DURATION
      : replacedCacheDuration || DEFAULT_REPLACED_CACHE_DURATION;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const blob = await response.blob();
    if (blob.size === 0) throw new Error("Image is empty");

    const base64data = await blobToBase64(blob);

    // Try to cache the image, but don't throw an error if it fails
    try {
      const cacheControl = response.headers.get("Cache-Control");
      const maxAge = cacheControl
        ? parseInt(cacheControl.split("=")[1])
        : cacheDuration;
      setCachedImage(url, base64data, maxAge);
    } catch (cacheError) {
      console.warn("Failed to cache image:", cacheError);
    }

    return base64data;
  } catch (error) {
    console.error("Error fetching image with cache:", error);
    throw error;
  }
}
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function updateProgress(progressBar, checked, total) {
  const percentage = (checked / total) * 100;
  progressBar.textContent = `Progress: ${percentage.toFixed(
    2
  )}% (${checked}/${total})`;
}

export function showElement(element) {
  if (typeof element === "string") {
    element = document.getElementById(element);
  }
  element.classList.remove("hidden");
}

export function hideElement(element) {
  if (typeof element === "string") {
    element = document.getElementById(element);
  }
  element.classList.add("hidden");
}

export function updateDownloadButton() {
  const threshold = document.getElementById("similarityThreshold").value;
  const downloadButton = document.getElementById("downloadReplacedBtn");
  downloadButton.textContent = `Download Replaced Images (Below ${threshold}% Similarity)`;
}

export async function fetchImageAsBlob(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    if (blob.size === 0) throw new Error("Image is empty");
    return blob;
  } catch (error) {
    console.error("Error fetching image as blob:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
export async function resizeImageBlob(blob, width, height) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, "image/png");
    };
    img.src = URL.createObjectURL(blob);
  });
}
