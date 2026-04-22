//You can edit ALL of the code here
let allEpisodes = [];
let allTVShows = [];
let cacheTVShows = new Map();

let tvShowsLoaded = false;
let tvShowsFetchError = false;

async function loadEpisodes(tvShowID) {
  try {
    if (cacheTVShows.has(tvShowID)) {
      allEpisodes = cacheTVShows.get(tvShowID);
      renderEpisodes(allEpisodes);
      populateSelectEpisodes(allEpisodes);
      return;
    }

    showLoadingMessage();

    const response = await fetch(
      "https://api.tvmaze.com/shows/" + tvShowID + "/episodes",
    ); // will not proceed past this line until function you are calling is finished
    // remove your message here
    if (!response.ok) {
      throw new Error("Failed to load episodes");
    }

    allEpisodes = await response.json();
    cacheTVShows.set(tvShowID, allEpisodes);
    setupAfterDataLoad();
  } catch (error) {
    showErrorMessage("Failed to load episodes. Please try again later.");
  }
}
async function loadTVShowsOnce() {
  if (tvShowsLoaded || tvShowsFetchError) return;

  try {
    showLoadingMessage();

    const response = await fetch("https://api.tvmaze.com/shows");

    if (!response.ok) {
      throw new Error("Failed to load tv shows");
    }
    allTVShows = await response.json();
    tvShowsLoaded = true;
    rootElem.innerHTML = "";
    populateSelectTVShows(allTVShows);
  } catch (error) {
    tvShowsFetchError = error;
    showErrorMessage("Failed to load tv Shows. Please try again later.");
  }
}

function showLoadingMessage() {
  rootElem.innerHTML = "<p>Loading data, please wait...</p>";
}

function showErrorMessage(message) {
  rootElem.innerHTML = `<p style="color:red;">${message}</p>`;
}

//helper functions, repeated code into single, separate files for different purposes(ui, api, error handling)
const searchInput = document.getElementById("searchQuery");
const selectEpisode = document.getElementById("select-episode");
const selectTVShow = document.getElementById("select-tv-show");
const rootElem = document.getElementById("root");

function setupAfterDataLoad() {
  searchInput.addEventListener("input", handleSearchInput);
  renderEpisodes(allEpisodes);
  populateSelectEpisodes(allEpisodes);
}

function handleSearchInput(event) {
  selectEpisode.value = "";
  // 2. Create and append the placeholder option first
  let placeholder = new Option("Select an Episode...", "");
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.hidden = true;
  selectEpisode.appendChild(placeholder);

  const searchQuery = event.target.value.toLowerCase();
  const filteredEpisodes = allEpisodes.filter(
    (episode) =>
      episode.name.toLowerCase().includes(searchQuery) ||
      (episode.summary && episode.summary.toLowerCase().includes(searchQuery)),
  );
  renderEpisodes(filteredEpisodes);
}

function populateSelectEpisodes(episodes) {
  selectEpisode.innerHTML = "";
  selectEpisode.appendChild(new Option("See All Episodes", -1));
  episodes.forEach((episode) => {
    const code = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    const episodeCodeName = `${code} - ${episode.name}`;
    let episodeOption = new Option(episodeCodeName, episode.id);
    selectEpisode.appendChild(episodeOption);
  });

  selectEpisode.addEventListener("change", function () {
    searchInput.value = "";
    const selectedEpisodeID = Number(this.value);
    if (selectedEpisodeID === -1) {
      renderEpisodes(allEpisodes);
      return;
    }
    const selectedEpisode = allEpisodes.find(
      (episode) => episode.id === selectedEpisodeID,
    );
    renderEpisodes([selectedEpisode]);
  });
}

function populateSelectTVShows(tvShows) {
  tvShows.sort((a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
  );
  tvShows.forEach((tvShow) => {
    let tvShowOption = new Option(tvShow.name, tvShow.id);
    selectTVShow.appendChild(tvShowOption);
  });
  selectTVShow.addEventListener("change", function () {
    searchInput.value = "";
    let selectedTvShowID = Number(this.value);
    loadEpisodes(selectedTvShowID);
  });
}

function renderEpisodes(episodes) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const search_bar_label = document.querySelector(".search_bar_label");
  search_bar_label.textContent = `Displaying ${episodes.length}/${allEpisodes.length} episodes`;
  const cardsContainer = document.createElement("div");
  cardsContainer.className = "episodes-container";
  rootElem.appendChild(cardsContainer);

  episodes.forEach((episode) => {
    const episodeElem = document.createElement("section");
    episodeElem.className = "episode-card";
    episodeElem.setAttribute("tabindex", "0");

    const code = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    const episodeTitle = document.createElement("h3");
    episodeTitle.textContent = `${episode.name} - ${code}`;
    episodeElem.appendChild(episodeTitle);

    if (episode.image && episode.image.medium) {
      const episodeImg = document.createElement("img");
      episodeImg.src = episode.image.medium;
      episodeImg.alt = `${episode.name} thumbnail`;
      episodeElem.appendChild(episodeImg);
    }

    const episodeSummary = document.createElement("p");
    episodeSummary.classList.add("episode-description");
    episodeSummary.textContent = episode.summary
      ? episode.summary.replace(/<[^>]+>/g, "")
      : "No summary available";
    episodeElem.appendChild(episodeSummary);

    const sourceLink = document.createElement("a");
    sourceLink.className = "episode-link";
    sourceLink.href = episode.url;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener";
    sourceLink.textContent = `Click here for "${episode.name}" episode source`;
    episodeElem.appendChild(sourceLink);

    cardsContainer.appendChild(episodeElem);
  });

  const attribution = document.createElement("p");
  attribution.innerHTML =
    'Data provided by <a href="https://www.tvmaze.com/" target="_blank" rel="noopener">TVMaze.com</a>';
  rootElem.appendChild(attribution);
}
window.onload = loadTVShowsOnce;
