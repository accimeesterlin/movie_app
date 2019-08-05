// Initial Values
const API_KEY = 'PlzBanMe';
const MOVIE_DB_API = 'd8bf019d0cca372bd804735f172f67e8';
const MOVIE_DB_ENDPOINT = 'https://api.themoviedb.org';
const MOVIE_DB_IMAGE_ENDPOINT = 'https://image.tmdb.org/t/p/w500';

const log = console.log;
const endpoint = 'http://www.omdbapi.com';
const defaultPoster = 'https://via.placeholder.com/150';


// Selecting elements from the DOM
const searchButton = document.querySelector('#search');;
const searchInput = document.querySelector('#exampleInputEmail1');
const moviesContainer = document.querySelector('.movies-container');
const movie = document.querySelectorAll('.movie');
const section = document.querySelector('section');



function movieTemplate(movie) {
    // log('Movie: ', movie);
    const {
        imageUrl,
        title,
        id,
        overview
    } = movie;
    const tempDiv = document.createElement('div');
    tempDiv.setAttribute('class', 'movie');
    tempDiv.setAttribute('data-id', id);

    const movieElement = `
        <img src="${imageUrl}" alt="" data-movie-id="${id}">
    `;
    tempDiv.innerHTML = movieElement;

    return tempDiv;
}


function resetInput() {
    searchInput.value = '';
}

searchButton.onclick = function (event) {
    event.preventDefault();
    const value = searchInput.value

    log('Value: ', value);
    searchMovie(value);

    resetInput();
}




function requestMovies(path, onComplete, onError) {
    const url = generateMovieDBUrl(path);
    fetch(url)
        .then((res) => res.json())
        .then(onComplete)
        .catch(onError);
}

function generateMovieDBUrl(path) {
    const url = `${MOVIE_DB_ENDPOINT}/3${path}?api_key=${MOVIE_DB_API}`;
    return url;
}


function handleGeneralError(error) {
    console.log('Error: ', error);
}

function getTopRatedMovies() {
    const path = `/movie/top_rated`;
    const options = {
        name: 'Top Rated Movies',
        id: 'top_rated_movies'
    };
    requestMovies(path, displayMovies.bind(options), handleGeneralError);
}

function searchMovie(value) {
    const path = `/search/movie`;
    const options = {
        type: 'search'
    };
    const url = `${generateMovieDBUrl(path)}&query=${value}`;
    fetch(url)
        .then((res) => res.json())
        .then(displayMovies.bind(options))
        .catch(handleGeneralError);
}


function getTrendingMovies() {
    const path = `/trending/movie/day`;
    const options = {
        name: 'Trending Movies',
        id: 'trending_movies'
    };
    requestMovies(path, displayMovies.bind(options), handleGeneralError);
}



function getVideosByMovie(movieId, content) {
    const path = `/movie/${movieId}/videos`;
    requestMovies(path, displayMovieVideos.bind({
        content
    }), handleGeneralError);
}

function displayMovieVideos(data) {
    const content = this.content;
    content.innerHTML = '<p id="content-close">X</p>';
    const videoContent = document.createElement('div');
    const videos = data.results || [];

    for (let i = 0; i < 4; i++) {
        const video = videos[i];

        const iframe = document.createElement('iframe');
        iframe.src = `http://www.youtube.com/embed/${video.key}`;
        iframe.width = 560;
        iframe.height = 315;
        iframe.allowFullscreen = true;

        videoContent.appendChild(iframe);
        content.appendChild(videoContent);
    }

    if (videos.length === 0) {
        content.innerHTML = `
            <p id="content-close">X</p>
            <p>No Trailer found for this video id of ${videos.id}</p>
        `;
    }
}



function searchUpcomingMovies() {
    const path = '/movie/upcoming';
    const options = {
        name: 'Upcoming movies',
        id: 'upcoming_movies'
    };
    requestMovies(path, displayMovies.bind(options), handleGeneralError);
}


function searchPopularMovie() {
    const path = '/movie/popular';
    const options = {
        name: 'Popular Movie',
        id: 'popular_movie'
    };
    requestMovies(path, displayMovies.bind(options), handleGeneralError);
}



function displayMovies(data) {
    const movies = data.results;
    const {
        id: elementId,
        name,
        type
    } = this;

    const section = document.createElement('section');
    section.setAttribute('class', 'section');
    section.setAttribute('id', elementId);

    for (let i = 0; i < movies.length; i++) {
        const {
            poster_path,
            title,
            overview,
            id
        } = movies[i];
        const imageUrl = MOVIE_DB_IMAGE_ENDPOINT + poster_path;

        const movie = {
            imageUrl,
            title,
            id,
            overview
        };

        const displayMovies = movieTemplate(movie);
        section.appendChild(displayMovies);
    }

    const mainTemplate = displayMovieContainer(section);
    if (type === 'search') {
        console.log('Searching Mode');
        moviesContainer.firstChild = section;
    } else {
        moviesContainer.appendChild(mainTemplate);
    }
}


function createNavigationTags() {
    const previous = document.createElement('a');
    previous.setAttribute('class', 'arrow_btn prev');
    previous.innerHTML = '‹';
    const next = document.createElement('a');
    next.setAttribute('class', 'arrow_btn next');
    next.innerHTML = '›';

    return {
        previous,
        next
    }
}

function displayMovieContainer(section) {
    const movies = document.createElement('div');
    movies.setAttribute('class', 'movies');

    const template = `
        <div class="content">
            <p id="content-close">X</p>
        </div>
    `;

    const {
        previous,
        next
    } = createNavigationTags(section);
    section.insertBefore(previous, section.firstChild);
    section.insertBefore(next, section.nextSibling);

    movies.innerHTML = template;
    movies.insertBefore(section, movies.firstChild);
    return movies;
}

// Initialize the search
searchUpcomingMovies();
getTopRatedMovies();
searchPopularMovie();
getTrendingMovies();
searchMovie('Furious');



// Click on any movies
// Event Delegation
document.onclick = function (event) {
    console.log('Event: ', event);
    const {
        tagName,
        id,
        className
    } = event.target;
    if (tagName.toLowerCase() === 'img') {
        const section = event.target.parentElement.parentElement;
        const content = section.nextElementSibling;
        content.classList.add('content-display');
        const movieId = event.target.dataset.movieId;
        getVideosByMovie(movieId, content);

    }

    if (id === 'content-close') {
        const content = event.target.parentElement;
        content.classList.remove('content-display');
    }

    if (className.includes('prev')) {
        prev(event);
    }

    if (className.includes('next')) {
        next(event);
    }
}



const next = (event) => {
    const section = event.target.parentElement;
    const {
        scrollLeft,
        scrollWidth,
        clientWidth
    } = section;

    if (clientWidth + scrollLeft === scrollWidth) {
        section.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    } else {
        section.scroll({
            top: 0,
            left: scrollLeft + clientWidth,
            behavior: 'smooth'
        });
    }
}


const prev = (event) => {
    const section = event.target.parentElement;
    const {
        scrollLeft,
        scrollWidth,
        clientWidth
    } = section;

    if (scrollLeft === 0) {
        section.scroll({
            left: scrollWidth,
            behavior: 'smooth'
        });
    } else {
        section.scroll({
            left: scrollLeft - clientWidth,
            behavior: 'smooth'
        });
    }
}



/*

Embeded YouTube Link: http://www.youtube.com/embed/9SA7FaKxZVI

TODO:
    - Get recommended movie
    - Get similar movies

Example:
<iframe src="http://www.youtube.com/embed/9SA7FaKxZVI"
   width="560" height="315" frameborder="0" allowfullscreen></iframe>

*/