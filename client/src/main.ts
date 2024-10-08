import './styles/jass.css';

// Constants for API endpoints
const API_BASE_URL = '/api/weather';

// Type definitions for weather and history items
interface Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  temp: number;
  windSpeed: number;
  humidity: number;
}

interface SearchHistoryItem {
  id: string;
  name: string;
}

// DOM Elements
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById('history') as HTMLDivElement;
const heading = document.getElementById('search-title') as HTMLHeadingElement;
const weatherIcon = document.getElementById('weather-img') as HTMLImageElement;
const tempEl = document.getElementById('temp') as HTMLParagraphElement;
const windEl = document.getElementById('wind') as HTMLParagraphElement;
const humidityEl = document.getElementById('humidity') as HTMLParagraphElement;

/* API Calls */
const fetchWeather = async (cityName: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cityName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error fetching weather: ${errorData.message}`);
    }

    const weatherData: Weather[] = await response.json();
    console.log('weatherData: ', weatherData);

    renderCurrentWeather(weatherData[0]);
    renderForecast(weatherData.slice(1));
  } catch (error) {
    console.error('Error fetching weather:', error);
    alert('Failed to fetch weather data. Please try again.');
  }
};

const fetchSearchHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error fetching search history: ${errorData.message}`);
    }

    return response.json(); // Return the JSON directly
  } catch (error) {
    console.error('Error fetching search history:', error);
    alert('Failed to fetch search history. Please try again.');
  }
};

const deleteCityFromHistory = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/history/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error deleting city: ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error deleting city from history:', error);
    alert('Failed to delete city from history. Please try again.');
  }
};

/* Render Functions */
const renderCurrentWeather = (currentWeather: Weather): void => {
  const { city, date, icon, iconDescription, temp, windSpeed, humidity } = currentWeather;

  // Format the date
  const formattedDate = formatDate(date);

  heading.textContent = `${city} (${formattedDate})`;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');

  tempEl.textContent = `Temp: ${temp}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  todayContainer.innerHTML = ''; // Clear previous data
  todayContainer.append(heading, weatherIcon, tempEl, windEl, humidityEl);
};

const renderForecast = (forecast: Weather[]): void => {
  const headingCol = document.createElement('div');
  const heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  forecastContainer.innerHTML = ''; // Clear previous forecast
  forecastContainer.append(headingCol);

  forecast.forEach(renderForecastCard);
};

const renderForecastCard = (forecast: Weather) => {
  const { date, icon, iconDescription, temp, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

  // Format the date for forecast
  const formattedDate = formatDate(date);

  // Set content for elements
  cardTitle.textContent = formattedDate;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${temp} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastContainer.append(col);
};

const renderSearchHistory = async (searchHistory: Promise<SearchHistoryItem[]>) => {
  const historyList = await searchHistory;

  searchHistoryContainer.innerHTML = ''; // Clear previous history

  if (!historyList.length) {
    searchHistoryContainer.innerHTML = '<p class="text-center">No Previous Search History</p>';
    return;
  }

  historyList.reverse().forEach(city => {
    const historyItem = buildHistoryListItem(city);
    searchHistoryContainer.append(historyItem);
  });
};

/* Helper Functions */
const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add('forecast-card', 'card', 'text-white', 'bg-primary', 'h-100');
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl };
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'today forecast');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city;

  return btn;
};

const handleDeleteHistoryClick = async (event: Event): Promise<void> => {
  const target = event.target as HTMLButtonElement;
  const city: SearchHistoryItem = JSON.parse(target.dataset.city || '{}');
  await deleteCityFromHistory(city.id);
  const searchHistory = fetchSearchHistory();
  renderSearchHistory(searchHistory);
};

const createDeleteButton = () => {
  const delBtnEl = document.createElement('button');
  delBtnEl.setAttribute('type', 'button');
  delBtnEl.classList.add('fas', 'fa-trash-alt', 'delete-city', 'btn', 'btn-danger', 'col-2');
  delBtnEl.addEventListener('click', handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = () => {
  const div = document.createElement('div');
  div.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  return div;
};

const buildHistoryListItem = (city: SearchHistoryItem) => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

/* Date Formatting Helper Function */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  return date.toLocaleString('en-US', options);
};

/* Event Handlers */
const handleSearchFormSubmit = (event: Event): void => {
  event.preventDefault();

  if (!searchInput.value) {
    alert('City cannot be blank');
    return; // Stop execution if no input
  }

  const search: string = searchInput.value.trim();
  fetchWeather(search).then(() => {
    searchInput.value = '';
    const searchHistory = fetchSearchHistory();
    renderSearchHistory(searchHistory);
  });
};

// Add event listener to the search form
searchForm.addEventListener('submit', handleSearchFormSubmit);
