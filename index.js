const apiKey = "bdb9375f80e7c781ae93afefed6c19da";
const apiEndpoint = "https://api.themoviedb.org/3"
const imgPath = "https://image.tmdb.org/t/p/original";
const apiPaths = {
    fetchAllCategories: `${apiEndpoint}/genre/movie/list?api_key=${apiKey}`,
    fetchMoviesList: (id) => `${apiEndpoint}/discover/movie?api_key=${apiKey}&with_genres=${id}`,
    fetchTrending: `${apiEndpoint}/trending/all/day?api_key=${apiKey}&language=en-US`,
    searchOnYoutube: (query) => `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyDx53jFcTWXaEhPPcywX8xkpmk480wDlhs`
}
//Boots up tha app
function init() {
    fetchTrendingMovies();
    /*fetch(apiPaths.fetchAllCategories)
    .then(res => res.json())
    .then(res => console.log(res.genres))
    .catch(err=>console.error(err));*/
    fetchAndBuildAllSections();
}

function buildBannerSection(movie){
    const bannerCont = document.getElementById('banner-section');
    bannerCont.style.backgroundImage = `url('${imgPath}${movie.backdrop_path}')`;

    const div = document.createElement('div');
    div.innerHTML = `
                <h2 class="banner_title">${movie.title}</h2>
                <p class="banner_overview">${movie.overview && movie.overview.length > 200 ? movie.overview.slice(0,200).trim() + '...' : movie.overview}</p>
                <div class="action-buttons-cont">
                    <button class="action-button"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="ltr-0 e1mhci4z1" data-name="Play" aria-hidden="true"><path d="M5 2.69127C5 1.93067 5.81547 1.44851 6.48192 1.81506L23.4069 11.1238C24.0977 11.5037 24.0977 12.4963 23.4069 12.8762L6.48192 22.1849C5.81546 22.5515 5 22.0693 5 21.3087V2.69127Z" fill="currentColor"></path></svg> &nbsp;&nbsp; Play</button>
                    <button class="action-button"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="ltr-0 e1mhci4z1" data-name="CircleI" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM13 10V18H11V10H13ZM12 8.5C12.8284 8.5 13.5 7.82843 13.5 7C13.5 6.17157 12.8284 5.5 12 5.5C11.1716 5.5 10.5 6.17157 10.5 7C10.5 7.82843 11.1716 8.5 12 8.5Z" fill="currentColor"></path></svg> &nbsp;&nbsp; More Info</button>
                </div>
            </div>`
            ;
    div.className = "banner-content container";
    bannerCont.append(div);
}

function fetchTrendingMovies() {
    fetchAndBuildMoiveSection(apiPaths.fetchTrending, 'Trending Now')
    .then(list => {
        const randomIndex = parseInt(Math.random() * list.length);
        buildBannerSection(list[randomIndex]);
    }).catch(err => {
        console.error(err);
    });
}

function fetchAndBuildAllSections(){
    fetch(apiPaths.fetchAllCategories)
    .then(res => res.json())
    .then(res => {
        const categories = res.genres;
        if(Array.isArray(categories) && categories.length){
            categories.forEach(category => {
                fetchAndBuildMoiveSection(
                    apiPaths.fetchMoviesList(category.id), category.name
                );
            });
        }
        //console.table(categories);
    })
    .catch(err=>console.error(err));
}

function fetchAndBuildMoiveSection(fetchURL, categoryName){
    console.log(fetchURL, categoryName);
    return fetch(fetchURL)
    .then(res => res.json())
    .then(res => {
        // console.table(res.results)
        const movies = res.results;
        if(Array.isArray(movies) && movies.length){
            buildMoviesSection(movies.slice(0,6), categoryName);
        }
        return movies;
    })
    .catch(err=>console.error(err))
}

function buildMoviesSection(list, categoryName){
    console.log(list, categoryName);

    const moviesCont = document.getElementById('movies-cont');
    const moviesListHTML = list.map(item => {
        return `
        <div class="movie-item" onmouseenter="searchMovieTrailer('${item.title}', 'yt${item.id}')">
            <img class="movie-item-img" src="${imgPath}${item.backdrop_path}" alt="${item.title}" /> 
            <iframe width="245px" height="150px" src="" id="yt${item.id}"></iframe> 
        </div>`;
    }).join('');

    const moviesSectionHTML = `
        <h2 class="movie-section-heading">${categoryName}<span class="explore-nudge">Explore All</span></h2>
        <div class="movies-row">
            ${moviesListHTML}  
        </div>
    `

    const div = document.createElement('div');
    div.className = "movies-section"
    div.innerHTML = moviesSectionHTML;
    
    //append HTML into movies container
    moviesCont.append(div);
}

function searchMovieTrailer(movieName, iframeId){
    if(!movieName) return;

    fetch(apiPaths.searchOnYoutube(movieName))
    .then(res => res.json())
    .then(res => {
        const bestResult = res.items[0];
        const elements = document.getElementById(iframeId);
        console.log(elements, iframeId);
        const div = document.createElement('div');
        div.innerHTML = `<iframe width="245px" height="150px" src="https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1&controls=0"></iframe>`;
        elements.append(div);
    })
    .catch(err => console.log(err));
}

window.addEventListener('load', function(){
    init();
    window.addEventListener('scroll', function(){
        //header ui update
        const header = document.getElementById('header');
        if(window.scrollY > 5) header.classList.add('black-bg')
        else header.classList.remove('black-bg');
    })
})