import dotenv from 'dotenv';
dotenv.config();
// TODO: Define a class for the Weather object
class Weather {
    constructor(city, date, description, temp, humidity, wind, uvIndex, icon) {
        this.city = city;
        this.date = date;
        this.description = description;
        this.temp = temp;
        this.humidity = humidity;
        this.wind = wind;
        this.uvIndex = uvIndex;
        this.icon = icon;
    }
}
// TODO: Complete the WeatherService class
class WeatherService {
    constructor() {
        this.baseURL = 'https://api.openweathermap.org/data/2.5/';
        this.apiKey = process.env.WEATHER_API_KEY || '';
        this.cityName = '';
    }
    // TODO: Create fetchLocationData method
    async fetchLocationData(query) {
        const response = await fetch(`${this.baseURL}weather?q=${query}&appid=${this.apiKey}`);
        return await response.json();
    }
    // TODO: Create destructureLocationData method
    destructureLocationData(locationData) {
        return {
            lat: locationData.coord.lat,
            lon: locationData.coord.lon,
        };
    }
    // TODO: Create fetchAndDestructureLocationData method
    async fetchAndDestructureLocationData() {
        const locationData = await this.fetchLocationData(this.cityName);
        return this.destructureLocationData(locationData);
    }
    // TODO: Create buildWeatherQuery method
    buildWeatherQuery(coordinates) {
        return `${this.baseURL}onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&appid=${this.apiKey}`;
    }
    // TODO: Create fetchWeatherData method
    async fetchWeatherData(coordinates) {
        const response = await fetch(this.buildWeatherQuery(coordinates));
        return await response.json();
    }
    // TODO: Build parseCurrentWeather method
    parseCurrentWeather(response) {
        const { name } = response;
        const { dt, weather, main, wind, uvi } = response.current;
        return new Weather(name, new Date(dt * 1000).toLocaleDateString(), weather[0].description, main.temp, main.humidity, wind.speed, uvi, weather[0].icon);
    }
    // TODO: Complete buildForecastArray method
    buildForecastArray(currentWeather, weatherData) {
        return weatherData.slice(1, 6).map((day) => {
            const { dt, weather, temp } = day;
            return new Weather(currentWeather.city, new Date(dt * 1000).toLocaleDateString(), weather[0].description, temp.day, temp.humidity, day.wind_speed, day.uvi, weather[0].icon);
        });
    }
    // TODO: Complete getWeatherForCity method
    async getWeatherForCity(city) {
        this.cityName = city;
        const coordinates = await this.fetchAndDestructureLocationData();
        const weatherData = await this.fetchWeatherData(coordinates);
        const currentWeather = this.parseCurrentWeather(weatherData);
        const forecastArray = this.buildForecastArray(currentWeather, weatherData.daily);
        return { currentWeather, forecastArray };
    }
}
export default new WeatherService();

