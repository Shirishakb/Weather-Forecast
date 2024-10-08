import dotenv from 'dotenv';
import fetch from 'node-fetch'; 

dotenv.config();

// Interface for Coordinates
interface Coordinates {
  lat: number;
  lon: number;
}

// Interface for the weather response from OpenWeather API
interface WeatherApiResponse {
  coord: Coordinates;
  weather: { description: string; icon: string }[];
  main: { temp: number; feels_like: number; humidity: number };
  wind: { speed: number };
  dt: number;
  list: Array<{
    dt: number;
    main: { temp: number; feels_like: number; humidity: number };
    weather: { description: string; icon: string }[];
    wind: { speed: number };
  }>;
}

// Class to hold weather data
class Weather {
  city!: string;
  date!: string;
  description!: string;
  temp!: number;
  feelsLike!: number;
  humidity!: number;
  windSpeed!: number;
  uvIndex!: number;
  sunrise!: string;
  sunset!: string;
  icon!: string;
}

// WeatherService class to handle fetching weather data
class WeatherService {
  private baseURL = 'https://api.openweathermap.org/data/2.5/';
  private apiKey = process.env.API_KEY; // Ensure your .env file contains the API_KEY
  private cityName = '';

  // Fetch location data by city name
  private async fetchLocationData(query: string): Promise<WeatherApiResponse> {
    const url = `${this.baseURL}weather?q=${query}&appid=${this.apiKey}&units=metric`;
    console.log(`Fetching location data from: ${url}`);

    const response = await fetch(url);
    const data = (await response.json()) as WeatherApiResponse;

    //console.log('Location Data:', JSON.stringify(data, null, 2)); // Log the entire location data for debugging

    if (!response.ok) {
      throw new Error('Error fetching location data');
    }

    return data;
  }

  // Destructure coordinates from location data
  private destructureLocationData(locationData: WeatherApiResponse): Coordinates {
    console.log('Destructuring location data:', locationData); // Debugging
    return {
      lat: locationData.coord.lat,
      lon: locationData.coord.lon,
    };
  }

  // Build URL for weather data using coordinates
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // Fetch coordinates by city name
  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(this.cityName);
    if (!locationData.coord) {
      throw new Error('Invalid location data, missing coordinates');
    }
    return this.destructureLocationData(locationData);
  }

  // Fetch weather data using coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<WeatherApiResponse> {
    const url = this.buildWeatherQuery(coordinates);
    console.log(`Fetching weather data from: ${url}`);

    const response = await fetch(url);
    const data = (await response.json()) as WeatherApiResponse;
    
    // Log raw weather data for debugging
    console.log('Raw weather data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Error fetching weather data:', data);
      throw new Error('Error fetching weather data');
    }

    if (!data.list || !Array.isArray(data.list) || data.list.length === 0) {
      throw new Error('Invalid response structure: missing forecast data');
    }

    return data;
  }

  // Parse current weather data from the forecast API
  private parseCurrentWeather(response: WeatherApiResponse): Weather {
    const weather = new Weather();
    console.log('Parsing current weather data:', response);

    // Using the first entry for the "current" weather data
    const currentWeather = response.list[0];

    if (!currentWeather) {
      throw new Error('Invalid weather data structure: missing current weather data');
    }

    weather.city = this.cityName;
    weather.date = new Date(currentWeather.dt * 1000).toLocaleDateString(); // Format the date
    weather.description = currentWeather.weather[0]?.description || 'No description available';
    
    // Ensure temperature values are defined
    weather.temp = currentWeather.main.temp !== undefined ? currentWeather.main.temp : -999; // Set a sentinel value for debugging
    weather.feelsLike = currentWeather.main.feels_like !== undefined ? currentWeather.main.feels_like : -999;
    weather.humidity = currentWeather.main.humidity !== undefined ? currentWeather.main.humidity : -999;
    weather.windSpeed = currentWeather.wind.speed !== undefined ? currentWeather.wind.speed : -999;
    
    weather.uvIndex = 0; // UV Index not available in forecast
    weather.sunrise = 'Not available'; // Sunrise/sunset not available in forecast
    weather.sunset = 'Not available';
    weather.icon = currentWeather.weather[0]?.icon || '01d'; // Default icon if missing

    // Log temperature for debugging
    console.log('Parsed current weather temp:', weather.temp); // Debug temperature

    return weather;
  }

  // Build forecast array from weather data
  private buildForecastArray(weatherData: WeatherApiResponse['list']): Weather[] {
    if (!Array.isArray(weatherData)) {
      throw new Error('Invalid forecast data: expected an array');
    }

    // Exclude the first entry (which is current weather) and build a forecast array
    return weatherData.slice(1).map((data) => {
      const weather = new Weather();
      weather.city = ''; // City name isn't needed for forecast items
      weather.date = new Date(data.dt * 1000).toLocaleDateString(); // Format the date
      weather.description = data.weather?.[0]?.description || 'No description';
      
      // Ensure temperature values are defined
      weather.temp = data.main.temp !== undefined ? data.main.temp : -999; // Set a sentinel value for debugging
      weather.feelsLike = data.main.feels_like !== undefined ? data.main.feels_like : -999;
      weather.humidity = data.main.humidity !== undefined ? data.main.humidity : -999;
      weather.windSpeed = data.wind.speed !== undefined ? data.wind.speed : -999;
      
      weather.uvIndex = 0; // UV Index not available in forecast
      weather.sunrise = 'Not available';
      weather.sunset = 'Not available';
      weather.icon = data.weather?.[0]?.icon || '01d'; // Default icon if missing

      return weather;
    });
  }

  // Fetch and return weather data for a city
  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.cityName = city;

    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      console.log('Fetched coordinates:', coordinates);

      const weatherData = await this.fetchWeatherData(coordinates);
      console.log('Fetched weather data:', weatherData);

      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = this.buildForecastArray(weatherData.list);

      return [currentWeather, ...forecast];
    } catch (error) {
      console.error('Error in getWeatherForCity:', (error as Error).message);
      throw error; // Rethrow the error after logging it
    }
  }
}

export default new WeatherService();
