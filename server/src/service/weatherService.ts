import dotenv from 'dotenv';
dotenv.config();

// Interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Class for the Weather object
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
}

// WeatherService class
class WeatherService {
  private baseURL = 'https://api.openweathermap.org/data/2.5/';
  private apiKey = process.env.API_KEY;
  private cityName = '';

  // Fetch location data based on city name
  private async fetchLocationData(query: string) {
    const url = `${this.baseURL}weather?q=${query}&appid=${this.apiKey}`;
    console.log(`Fetching location data from: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('fetchLocationData response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Error fetching location data');
    }

    return data; // Ensure this contains the necessary fields
  }

  // Destructure coordinates from location data
  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.coord.lat,
      lon: locationData.coord.lon,
    };
  }

  // Build weather query using coordinates (uses the onecall endpoint)
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&appid=${this.apiKey}&units=metric`;
  }

  // Fetch and destructure location data
  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData(this.cityName);
    if (!locationData.coord) {
      throw new Error('Invalid location data, missing coordinates');
    }
    return this.destructureLocationData(locationData);
  }

  // Fetch weather data using coordinates
  private async fetchWeatherData(coordinates: Coordinates) {
    const url = this.buildWeatherQuery(coordinates);
    const response = await fetch(url);
    const data = await response.json();
    console.log('fetchWeatherData response line:74 :', data);
    if (!response.ok || !data.current) {
      throw new Error('Error fetching weather data or invalid response structure');
    }

    return data;
  }

  // Parse current weather data
  private parseCurrentWeather(response: any): Weather {
    const weather = new Weather();

    console.log('Parsing current weather data:', response);

    if (!response.current) {
      throw new Error('Invalid weather data structure: missing current weather data');
    }

    weather.city = this.cityName; // Use city name provided earlier
    weather.date = new Date(response.current.dt * 1000).toISOString();
    weather.description = response.current.weather[0]?.description || 'No description available';
    weather.temp = response.current.temp;
    weather.feelsLike = response.current.feels_like;
    weather.humidity = response.current.humidity;
    weather.windSpeed = response.current.wind_speed;
    weather.uvIndex = response.current.uvi || 0; // Default to 0 if not present
    weather.sunrise = new Date(response.current.sunrise * 1000).toISOString();
    weather.sunset = new Date(response.current.sunset * 1000).toISOString();

    return weather;
  }

  // Build forecast array from daily weather data
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    if (!Array.isArray(weatherData)) {
      throw new Error('Invalid forecast data: expected an array');
    }

    return weatherData.map((data) => {
      const weather = new Weather();
      weather.city = currentWeather.city;
      weather.date = new Date(data.dt * 1000).toISOString();
      weather.description = data.weather?.[0]?.description || 'No description';
      weather.temp = data.temp?.day || 0;
      weather.feelsLike = data.feels_like?.day || 0;
      weather.humidity = data.humidity || 0;
      weather.windSpeed = data.wind_speed || 0;
      weather.uvIndex = data.uvi || 0;
      weather.sunrise = data.sunrise ? new Date(data.sunrise * 1000).toISOString() : 'Invalid Date';
      weather.sunset = data.sunset ? new Date(data.sunset * 1000).toISOString() : 'Invalid Date';
      return weather;
    });
  }

  // Get weather data for the city
  async getWeatherForCity(city: string) {
    this.cityName = city;

    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      console.log('Fetched coordinates:', coordinates);

      const weatherData = await this.fetchWeatherData(coordinates);
      console.log('weatherData:', weatherData);

      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = this.buildForecastArray(currentWeather, weatherData.daily);

      return [currentWeather, ...forecast];
    } catch (error) {
      console.error('Error in getWeatherForCity:', error);
      throw error;
    }
  }
}

export default new WeatherService();
