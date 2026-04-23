//You can edit ALL of the code here
let allEpisodes = [];
let allTVShows = [];

let cacheEpisodes = new Map();
let cacheTVShows = new Map();

let tvShowsLoaded = false;
let tvShowsFetchError = false;

let currentView = "shows";

const searchInput = document.getElementById("searchQuery");
const selectEpisode = document.getElementById("select-episode");
const selectTVShow = document.getElementById("select-tv-show");
const rootElem = document.getElementById("root");
const searchBarLabel = document.querySelector(".search_bar_label");

async function loadTVShowsOnce() {
  if (tvShowsLoaded || tvShowsFetchError) return;

  try {
    showLoadingMessage();

    if (cacheTVShows.has("all")) {
      allTVShows = cacheTVShows.get("all");
      tvShowsLoaded = true;
      setupShowsView();
      return;
    }

    const response = await fetch("https://api.tvmaze.com/shows");

    if (!response.ok) throw new Error("Failed to load tv shows");

    allTVShows = await response.json();
    cacheTVShows.set("all", allTVShows);

    tvShowsLoaded = true;

    setupShowsView();
  } catch (error) {
    tvShowsFetchError = true;
    showErrorMessage("Failed to load TV shows. Please try again later.");
  }
}

async function loadEpisodes(tvShowID) {
  try {
    currentView = "episodes";

    if (cacheEpisodes.has(tvShowID)) {
      allEpisodes = cacheEpisodes.get(tvShowID);
      setupEpisodesView();
      return;
    }

    showLoadingMessage();

    const response = await fetch(
      "https://api.tvmaze.com/shows/" + tvShowID + "/episodes",
    );

    if (!response.ok) throw new Error("Failed to load episodes");

    allEpisodes = await response.json();

    cacheEpisodes.set(tvShowID, allEpisodes);

    setupEpisodesView();
  } catch (error) {
    showErrorMessage("Failed to load episodes. Please try again later.");
  }
}

function setupShowsView() {
  currentView = "shows";

  rootElem.innerHTML = "";

  searchInput.value = "";

  renderShows(allTVShows);

  populateSelectTVShows(allTVShows);

  searchInput.removeEventListener("input", handleEpisodeSearch);
  searchInput.addEventListener("input", handleShowSearch);
}

function setupEpisodesView() {
  rootElem.innerHTML = "";

  searchInput.value = "";

  renderEpisodes(allEpisodes);
  populateSelectEpisodes(allEpisodes);

  searchInput.removeEventListener("input", handleShowSearch);
  searchInput.addEventListener("input", handleEpisodeSearch);
}

function renderShows(shows) {
  rootElem.innerHTML = "";

  searchBarLabel.textContent = `Displaying ${shows.length}/${allTVShows.length} shows`;

  const container = document.createElement("div");
  container.className = "shows-container";
  rootElem.appendChild(container);

  shows.forEach((show) => {
    const card = document.createElement("section");
    card.className = "show-card";

    const title = document.createElement("h2");
    title.textContent = show.name;
    title.style.cursor = "pointer";

    title.addEventListener("click", () => {
      loadEpisodes(show.id);
    });

    const img = document.createElement("img");
    img.src = show.image?.medium || "";
    img.alt = show.name;

    const summary = document.createElement("p");
    summary.innerHTML = show.summary || "No summary available";

    const info = document.createElement("div");
    info.innerHTML = `
      <p><b>Genres:</b> ${show.genres.join(", ")}</p>
      <p><b>Status:</b> ${show.status}</p>
      <p><b>Rating:</b> ${show.rating?.average || "N/A"}</p>
      <p><b>Runtime:</b> ${show.runtime || "N/A"} mins</p>
    `;

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);
    card.appendChild(info);

    container.appendChild(card);
  });
}

function handleShowSearch(event) {
  const query = event.target.value.toLowerCase();

  const filtered = allTVShows.filter(
    (show) =>
      show.name.toLowerCase().includes(query) ||
      show.summary?.toLowerCase().includes(query) ||
      show.genres.join(" ").toLowerCase().includes(query),
  );

  renderShows(filtered);
}

function handleEpisodeSearch(event) {
  selectEpisode.value = "";

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
    const code = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number,
    ).padStart(2, "0")}`;

    const option = new Option(`${code} - ${episode.name}`, episode.id);
    selectEpisode.appendChild(option);
  });

  selectEpisode.onchange = function () {
    searchInput.value = "";

    const id = Number(this.value);

    if (id === -1) {
      renderEpisodes(allEpisodes);
      return;
    }

    const selected = allEpisodes.find((ep) => ep.id === id);

    renderEpisodes([selected]);
  };
}

function populateSelectTVShows(tvShows) {
  selectTVShow.innerHTML = "";
  const placeholder = new Option("Select a TV show...", "");
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.hidden = true;
  selectTVShow.appendChild(placeholder);

  tvShows
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((show) => {
      selectTVShow.appendChild(new Option(show.name, show.id));
    });

  selectTVShow.onchange = function () {
    searchInput.value = "";
    loadEpisodes(Number(this.value));
  };
}

function renderEpisodes(episodes) {
  rootElem.innerHTML = "";
  const backButton = document.createElement("button");
  backButton.textContent = "← Back to All Shows";
  backButton.className = "back-button";

  rootElem.appendChild(backButton);

  backButton.addEventListener("click", () => {
    setupShowsView();
    window.scrollTo({ top: 0, behavior: "instant" });
  });

  searchBarLabel.textContent = `Displaying ${episodes.length}/${allEpisodes.length} episodes`;

  const container = document.createElement("div");
  container.className = "episodes-container";
  rootElem.appendChild(container);

  episodes.forEach((episode) => {
    const card = document.createElement("section");
    card.className = "episode-card";

    const code = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number,
    ).padStart(2, "0")}`;

    const title = document.createElement("h3");
    title.textContent = `${episode.name} - ${code}`;

    const img = document.createElement("img");
    if (episode.image?.medium) {
      img.src = episode.image.medium;
      img.alt = episode.name;
    }

    const summary = document.createElement("p");
    summary.textContent = episode.summary
      ? episode.summary.replace(/<[^>]+>/g, "")
      : "No summary available";

    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.textContent = `Source: ${episode.name}`;

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);
    card.appendChild(link);

    container.appendChild(card);
  });
}

function showLoadingMessage() {
  rootElem.innerHTML = "<p>Loading data...</p>";
}

function showErrorMessage(msg) {
  rootElem.innerHTML = `<p style="color:red;">${msg}</p>`;
}

window.onload = loadTVShowsOnce;
