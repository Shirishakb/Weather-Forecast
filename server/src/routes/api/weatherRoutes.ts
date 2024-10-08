
/*
get, POST

/api/weather/
/api/weather/history


*/

import { Router } from 'express';
const router = Router();
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';
// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
    // TODO: GET weather data from city name
    const city = req.body.city || req.body.cityName;

    try {
        const weather = await WeatherService.getWeatherForCity(city);
       res.json(weather);
        // TODO: save city to search history
        HistoryService.addCity(city);
    }
    catch (error: any) {
        console.log('error: ', error);
        res.status(500).json({ message: error.toString() });
    }

});
// TODO: GET search history
router.get('/history', async (_req, res) => {
    try {
        const history = await HistoryService.getCities();
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ message: Error });
    }
});
// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await HistoryService.removeCity(id);
        res.json({ message: 'City deleted' });
    }
    catch (error) {
        res.status(500).json({ message: Error });
    }
});
export default router;