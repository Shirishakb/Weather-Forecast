// TODO: Define a City class with name and id properties
class City {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}
// TODO: Complete the HistoryService class
class HistoryService {
    // TODO: Define a read method that reads from the searchHistory.json file
    async read() {
        const response = await fetch('/api/history');
        return await response.json();
    }
    // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
    async write(cities) {
        await fetch('/api/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cities),
        });
    }
    // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
    async getCities() {
        return await this.read();
    }
    // TODO: Define an addCity method that adds a city to the searchHistory.json file
    async addCity(cityName) {
        const cities = await this.getCities();
        const newCity = new City(cityName, (cities.length + 1).toString()); // or however you generate IDs
        cities.push(newCity);
        await this.write(cities);
    }
    // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
    async removeCity(id) {
        const cities = await this.getCities();
        const updatedCities = cities.filter((city) => city.id !== id);
        await this.write(updatedCities);
    }
}
export default new HistoryService();