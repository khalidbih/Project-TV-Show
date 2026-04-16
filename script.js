//You can edit ALL of the code here
const allEpisodes = getAllEpisodes();
function setup() {
  const searchInput = document.getElementById("searchQuery");
  //input event will only fire when the input in searchInput changes
  searchInput.addEventListener("input", handleSearchInput);
  renderEpisodes(allEpisodes);
}

function handleSearchInput(event) {
  searchQuery = event.target.value.toLowerCase();
  filteredEpisodes = allEpisodes.filter(
    (episode) =>
      episode.name.toLowerCase().includes(searchQuery) ||
      episode.summary.toLocaleLowerCase().includes(searchQuery),
  );
  renderEpisodes(filteredEpisodes);
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
window.onload = setup;
