import { checkImagePair } from "./imageComparison.js";
import {
  updateProgress,
  showElement,
  hideElement,
  updateDownloadButton,
} from "./utils.js";

const API_BASE_URL = "https://webws.365scores.com/web";
const API_PARAMS =
  "appTypeId=5&langId=2&timezoneName=Asia/Jerusalem&userCountryId=6";
const corsProxy = "https://cold-sea-bd9d.antonioh.workers.dev/?apiurl=";
const baseUrlOriginal = "https://sport1.maariv.co.il/_365images/Competitors/";
const baseUrlReplaced =
  "https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Competitors:default1.png/v7/Competitors/";

const categoryInput = document.getElementById("category");
const categoryOptions = document.getElementById("category-options");
const leagueInput = document.getElementById("league");
const leagueOptions = document.getElementById("league-options");
const checkImagesBtn = document.getElementById("checkImagesBtn");
const checkImagesByLeagueBtn = document.getElementById(
  "checkImagesByLeagueBtn"
);
const progressBar = document.getElementById("progressBar");
const imageTableBody = document.getElementById("imageTableBody");

let categories = [];
let leagues = [];
let selectedCategoryId = null;
let selectedLeagueId = null;
let validPairs = [];

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}

function createSearchableSelect(input, optionsContainer, options, onSelect) {
  input.addEventListener("input", () => {
    const searchTerm = input.value.toLowerCase();
    const filteredOptions = options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm)
    );
    renderOptions(optionsContainer, filteredOptions, onSelect);
  });

  input.addEventListener("focus", () => {
    renderOptions(optionsContainer, options, onSelect);
    optionsContainer.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !optionsContainer.contains(e.target)) {
      optionsContainer.style.display = "none";
    }
  });
}

function renderOptions(container, options, onSelect) {
  container.innerHTML = options
    .map(
      (option) =>
        `<div class="option" data-id="${option.id}">${option.name}</div>`
    )
    .join("");

  container.querySelectorAll(".option").forEach((option) => {
    option.addEventListener("click", () => {
      const id = option.getAttribute("data-id");
      const name = option.textContent;
      onSelect(id, name);
      container.style.display = "none";
    });
  });
}

async function initCategories() {
  try {
    const data = await fetchData(
      `${API_BASE_URL}/sports/?${API_PARAMS}&withCount=true`
    );
    categories = data.sports;
    const defaultCategory =
      categories.find((c) => c.name === "כדורגל") || categories[0];

    createSearchableSelect(
      categoryInput,
      categoryOptions,
      categories,
      (id, name) => {
        categoryInput.value = name;
        selectedCategoryId = id;
        loadLeagues(id);
      }
    );

    categoryInput.value = defaultCategory.name;
    selectedCategoryId = defaultCategory.id;
    await loadLeagues(defaultCategory.id);
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

async function loadLeagues(categoryId) {
  try {
    const data = await fetchData(
      `${API_BASE_URL}/competitions/?${API_PARAMS}&sports=${categoryId}`
    );
    leagues = data.competitions;
    const defaultLeague =
      leagues.find((l) => l.name === "ליגת העל") || leagues[0];

    createSearchableSelect(leagueInput, leagueOptions, leagues, (id, name) => {
      leagueInput.value = name;
      selectedLeagueId = id;
    });

    leagueInput.value = defaultLeague ? defaultLeague.name : "";
    selectedLeagueId = defaultLeague ? defaultLeague.id : null;
  } catch (error) {
    console.error("Error loading leagues:", error);
  }
}

async function checkImages() {
  document.getElementById("teamNameHeader").classList.add("hidden");

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

  imageTableBody.innerHTML = "";
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
      imageTableBody,
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

async function checkImagesByLeague() {
  if (!selectedLeagueId) {
    alert("Please select a league");
    return;
  }

  const similarityThreshold = parseFloat(
    document.getElementById("similarityThreshold").value
  );
  const originalCacheDuration = parseInt(
    document.getElementById("originalCacheDuration").value
  );
  const replacedCacheDuration = parseInt(
    document.getElementById("replacedCacheDuration").value
  );

  imageTableBody.innerHTML = "";
  validPairs = [];
  progressBar.textContent = "Fetching team IDs...";

  // Show the team name header
  document.getElementById("teamNameHeader").classList.remove("hidden");

  try {
    const data = await fetchData(
      `${API_BASE_URL}/standings/?${API_PARAMS}&live=true&competitions=${selectedLeagueId}`
    );
    const teams = data.standings[0].rows.map((row) => ({
      id: row.competitor.id,
      name: row.competitor.name,
    }));

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const urlOriginal = `${corsProxy}${encodeURIComponent(
        baseUrlOriginal + team.id + ".png"
      )}&originalCacheDuration=${originalCacheDuration}&replacedCacheDuration=${replacedCacheDuration}`;
      const urlReplaced = `${corsProxy}${encodeURIComponent(
        baseUrlReplaced + team.id
      )}&originalCacheDuration=${originalCacheDuration}&replacedCacheDuration=${replacedCacheDuration}`;

      const result = await checkImagePair(
        team.id,
        team.name,
        imageTableBody,
        similarityThreshold,
        urlOriginal,
        urlReplaced,
        originalCacheDuration,
        replacedCacheDuration
      );
      if (result) {
        validPairs.push(result);
      }
      updateProgress(progressBar, i + 1, teams.length);
    }

    showElement("downloadButtons");
    showElement("controlButtons");
    updateDownloadButton();
  } catch (error) {
    console.error("Error checking images:", error);
    progressBar.textContent = "Error checking images. Please try again.";
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
        `${pair.index || pair.teamId}.png`,
        type === "original" ? pair.originalBlob : pair.replacedBlob
      );
    }
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `${type}_images.zip`);
  });
}

// Event Listeners
checkImagesBtn.addEventListener("click", checkImages);
checkImagesByLeagueBtn.addEventListener("click", checkImagesByLeague);
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

// Initialize the application
initCategories();
