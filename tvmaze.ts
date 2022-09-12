import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $('#episodesList');

const MISSING_IMAGE_URL = "https://tinyurl.com/missing-tv";
const TVMAZE_API_URL = "http://api.tvmaze.com/";

interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: { medium: string };
}

interface EpisodeInterface {
  id: number;
  name: string;
  season: string;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios({
    baseURL: TVMAZE_API_URL,
    url: "search/shows",
    method: "GET",
    params: {
      q: term,
    },
  });

  return response.data.map((result: { show: ShowInterface }) => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MISSING_IMAGE_URL,
    };
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term: string = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  return response.data.map((episode: EpisodeInterface) => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    };
  });
}

/** Given an array of episodes, create a markup for each episode and append to DOM */

function populateEpisodes(episodes: EpisodeInterface[]) { 
  $episodesList.empty();
  for (let episode of episodes) {
    const $episode = $(`<li>${episode.name} (season ${episode.season},
      number ${episode.number})</li>`);
    $episodesList.append($episode);
  }
  $episodesArea.show();
}

/** Handle episode button click: get episodes from API and display.
 *    Shows episodes area and lists episodes under currently selected show
 */

  async function searchForEpisodesAndDisplay (evt: JQuery.ClickEvent) {
    evt.preventDefault();
    const id = $(evt.target).closest('.Show').data('show-id');
    const episodes = await getEpisodesOfShow(id);
    populateEpisodes(episodes);
    const mediaClass = $(evt.target).closest('.media-body')
    mediaClass.append($episodesArea);
  }
  
  //had to do event delegation to get episodes to display
  
  $showsList.on('click','.Show-getEpisodes', searchForEpisodesAndDisplay);