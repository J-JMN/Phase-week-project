// DOM Elements
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

// State
let movies = [];
let filteredMovies = [];
let currentTheme = localStorage.getItem('theme') || 'light';
const API_URL = 'http://localhost:3000/movies';

// Initialize the app
document.addEventListener('DOMContentLoaded', initializeApp);

// Event Listeners
searchForm.addEventListener('submit', handleSearch);
yearFilter.addEventListener('change', filterMovies);
typeFilter.addEventListener('change', filterMovies);
themeBtn.addEventListener('click', toggleTheme);
viewFavoritesBtn.addEventListener('click', viewFavorites);
resetFiltersBtn.addEventListener('click', resetFilters);

// Initialize application
async function initializeApp() {
    // Set initial theme
    setInitialTheme();
    
    // Load movies
    try {
        showLoading();
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        movies = await response.json();
        filteredMovies = [...movies];
        
        // Initialize with all movies
        displayMovies(filteredMovies);
        updateResultsCount(filteredMovies.length);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError("Failed to load movies. Please make sure json-server is running.");
    } finally {
        hideLoading();
    }
}

// Set initial theme from localStorage
function setInitialTheme() {
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        themeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

// Handle search form submission
async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    try {
        showLoading();
        
        if (!searchTerm) {
            // If search is empty, reset to all movies
            filteredMovies = [...movies];
        } else {
            // Filter movies based on search term
            filteredMovies = movies.filter(movie => 
                movie.Title.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply any existing filters
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


// Filter movies based on selected filters
function filterMovies() {
    applyFilters();
    displayMovies(filteredMovies);
    updateResultsCount(filteredMovies.length);
}

// Apply year and type filters to the current movie list
function applyFilters() {
    const year = yearFilter.value;
    const type = typeFilter.value;
    
    filteredMovies = [...movies];
    
    // Apply search filter if there's a search term
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        filteredMovies = filteredMovies.filter(movie => 
            movie.Title.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply year filter
    if (year) {
        filteredMovies = filteredMovies.filter(movie => {
            const movieYear = movie.Year.includes('-') 
                ? movie.Year.split('-')[0] 
                : movie.Year;
            return movieYear.startsWith(year);
        });
    }
    
    // Apply type filter
    if (type) {
        filteredMovies = filteredMovies.filter(movie => movie.Type === type);
    }
}

