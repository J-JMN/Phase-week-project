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

