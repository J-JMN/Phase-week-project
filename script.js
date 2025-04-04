const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const loadingElement = document.getElementById('loading');
const yearFilter = document.getElementById('year-filter');
const typeFilter = document.getElementById('type-filter');
const themeBtn = document.getElementById('theme-btn');
const viewFavoritesBtn = document.getElementById('view-favorites');
const resetFiltersBtn = document.getElementById('reset-filters');
const resultsCount = document.getElementById('results-count');

let movies = [];
let filteredMovies = [];
let currentTheme = localStorage.getItem('theme') || 'light';
const API_URL = 'http://localhost:3000/movies';

document.addEventListener('DOMContentLoaded', initializeApp);

searchForm.addEventListener('submit', handleSearch);
yearFilter.addEventListener('change', filterMovies);
typeFilter.addEventListener('change', filterMovies);
themeBtn.addEventListener('click', toggleTheme);
viewFavoritesBtn.addEventListener('click', viewFavorites);
resetFiltersBtn.addEventListener('click', resetFilters);

async function initializeApp() {
    setInitialTheme();
    
    try {
        showLoading();
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        movies = await response.json();
        filteredMovies = [...movies];
        
        displayMovies(filteredMovies);
        updateResultsCount(filteredMovies.length);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError("Failed to load movies. Please make sure json-server is running.");
    } finally {
        hideLoading();
    }
}

function setInitialTheme() {
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        themeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    try {
        showLoading();
        
        if (!searchTerm) {
            filteredMovies = [...movies];
        } else {
            filteredMovies = movies.filter(movie => 
                movie.Title.toLowerCase().includes(searchTerm)
            );
        }
        
        applyFilters();
        
        if (filteredMovies.length === 0) {
            showNoResults();
        } else {
            displayMovies(filteredMovies);
        }
        
        updateResultsCount(filteredMovies.length);
        
    } catch (error) {
        console.error('Error searching movies:', error);
        showError("Error searching movies. Please try again.");
    } finally {
        hideLoading();
    }
}

function filterMovies() {
    applyFilters();
    displayMovies(filteredMovies);
    updateResultsCount(filteredMovies.length);
}

function applyFilters() {
    const year = yearFilter.value;
    const type = typeFilter.value;
    
    filteredMovies = [...movies];
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        filteredMovies = filteredMovies.filter(movie => 
            movie.Title.toLowerCase().includes(searchTerm)
        );
    }
    
    if (year) {
        filteredMovies = filteredMovies.filter(movie => {
            const movieYear = movie.Year.includes('-') 
                ? movie.Year.split('-')[0] 
                : movie.Year;
            return movieYear.startsWith(year);
        });
    }
    
    if (type) {
        filteredMovies = filteredMovies.filter(movie => movie.Type === type);
    }
}

function displayMovies(moviesToDisplay) {
    if (!moviesToDisplay || moviesToDisplay.length === 0) {
        showNoResults();
        return;
    }
    
    resultsContainer.innerHTML = moviesToDisplay.map(movie => `
        <div class="movie-card" data-id="${movie.imdbID}">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" 
                 alt="${movie.Title}" 
                 class="movie-poster"
                 onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">Year: ${movie.Year}</p>
                <p class="movie-type">Type: ${movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}</p>
                <button class="favorite-btn ${movie.isFavorite ? 'favorited' : ''}" 
                        data-id="${movie.imdbID}">
                    <i class="${movie.isFavorite ? 'fas' : 'far'} fa-heart"></i> 
                    ${movie.isFavorite ? 'Favorited' : 'Favorite'}
                </button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);
    });
}

async function toggleFavorite(e) {
    const btn = e.currentTarget;
    const imdbID = btn.dataset.id;
    const movie = movies.find(m => m.imdbID === imdbID);
    
    try {
        movie.isFavorite = !movie.isFavorite;
        
        if (movie.isFavorite) {
            btn.classList.add('favorited');
            btn.innerHTML = '<i class="fas fa-heart"></i> Favorited';
        } else {
            btn.classList.remove('favorited');
            btn.innerHTML = '<i class="far fa-heart"></i> Favorite';
        }
        
        await fetch(`${API_URL}/${imdbID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isFavorite: movie.isFavorite }),
        });
        
    } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Failed to update favorite status. Please try again.');
    }
}

function viewFavorites() {
    const favoriteMovies = movies.filter(movie => movie.isFavorite);
    
    if (favoriteMovies.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>You haven't favorited any movies yet.</p>
            </div>
        `;
        updateResultsCount(0);
    } else {
        filteredMovies = favoriteMovies;
        displayMovies(filteredMovies);
        updateResultsCount(filteredMovies.length);
    }
    
    searchInput.value = '';
    yearFilter.value = '';
    typeFilter.value = '';
}

function resetFilters() {
    searchInput.value = '';
    yearFilter.value = '';
    typeFilter.value = '';
    filteredMovies = [...movies];
    displayMovies(filteredMovies);
    updateResultsCount(filteredMovies.length);
}

function toggleTheme() {
    if (currentTheme === 'light') {
        document.body.classList.add('dark-mode');
        currentTheme = 'dark';
        themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        currentTheme = 'light';
        themeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
    
    localStorage.setItem('theme', currentTheme);
}


function updateResultsCount(count) {
    resultsCount.textContent = `Showing ${count} ${count === 1 ? 'result' : 'results'}`;
}


function showLoading() {
    loadingElement.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    resultsCount.textContent = '';
}

function hideLoading() {
    loadingElement.classList.add('hidden');
}


function showNoResults() {
    resultsContainer.innerHTML = `
        <div class="no-results">
            <p>No movies found matching your criteria. Try a different search.</p>
        </div>
    `;
}

function showError(message) {
    resultsContainer.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            ${currentTheme === 'light' ? '<p>Run: <code>npx json-server --watch db.json</code></p>' : ''}
        </div>
    `;
    resultsCount.textContent = '';
}