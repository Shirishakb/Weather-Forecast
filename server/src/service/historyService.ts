// City class with name and id properties
class City {
    name: string;
    id: string;
  
    constructor(name: string, id: string) {
      this.name = name;
      this.id = id;
    }
  }
  
  // HistoryService class
  class HistoryService {
    // Read method to fetch cities from the search history
    async read(): Promise<City[]> {
      const response = await fetch('/api/history');
      return await response.json();
    }
  
    // Write method to save updated cities to the search history
    async write(cities: City[]): Promise<void> {
      await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cities),
      });
    }
  
    // Get cities from the search history
    async getCities(): Promise<City[]> {
      return await this.read();
    }
  
    // Add a new city to the search history
    async addCity(cityName: string): Promise<void> {
      const cities = await this.getCities();
      const newCity = new City(cityName, (cities.length + 1).toString()); // Simple ID generation
      cities.push(newCity);
      await this.write(cities);
    }
  
    // Remove a city from the search history
    async removeCity(id: string): Promise<void> {
      const cities = await this.getCities();
      const updatedCities = cities.filter((city: City) => city.id !== id);
      await this.write(updatedCities);
    }
  }
  
  export default new HistoryService();
  