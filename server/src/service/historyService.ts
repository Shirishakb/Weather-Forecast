import * as fs from 'fs';

// City class with name and id properties
class City {
    name: string;
    id: string;

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
    }
}

// HistoryService class to manage the city search history
class HistoryService {
    // Read method that reads from the searchHistory.json file
    private async read(): Promise<City[]> {
        try {
            const data = await fs.promises.readFile('searchHistory.json', 'utf-8');
            return JSON.parse(data) as City[];
        } catch (error) {
            console.error('Error reading file:', error);
            return []; // Return an empty array if there's an error
        }
    }

    // Write method that writes the updated cities array to the searchHistory.json file
    private async write(cities: City[]): Promise<void> {
        await fs.promises.writeFile('searchHistory.json', JSON.stringify(cities, null, 2));
    }

    // Get cities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
    async getCities(): Promise<City[]> {
        return await this.read();
    }

    // Add city method that adds a city to the searchHistory.json file
    async addCity(cityName: string): Promise<void> {
        const cities = await this.getCities();
        const newCity = new City(cityName, (cities.length + 1).toString());
        cities.push(newCity);
        await this.write(cities);
    }

    // Remove city method that removes a city from the searchHistory.json file
    async removeCity(id: string): Promise<void> {
        const cities = await this.getCities();
        const index = cities.findIndex((city: City) => city.id === id);
        if (index === -1) {
            throw new Error('City not found');
        }
        cities.splice(index, 1);
        await this.write(cities);
    }
}

export default new HistoryService();
