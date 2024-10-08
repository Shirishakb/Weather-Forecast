import { Router, Request, Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  const city = req.body.city || req.body.cityName; // Use city or cityName for consistency

  if (!city) {
    return res.status(400).json({ message: 'City name is required' });
  }

  try {
    // GET weather data from city name
    const weather = await WeatherService.getWeatherForCity(city);

    // Save city to search history
    try {
      await HistoryService.addCity(city);
    } catch (historyError) {
      console.error('Error saving city to history:', historyError);
    }

    return res.json(weather); // Send the weather data as a response
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'An unexpected error occurred';
    console.error('Error fetching weather data:', errorMessage);
    return res.status(500).json({ message: errorMessage });
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities();
    return res.json(history); // Send the search history
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'An unexpected error occurred';
    console.error('Error fetching history:', errorMessage);
    return res.status(500).json({ message: errorMessage });
  }
});

// DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  try {
    await HistoryService.removeCity(id.toString()); // Remove city from history using ID
    return res.json({ message: 'City deleted' });
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'An unexpected error occurred';
    console.error('Error deleting city from history:', errorMessage);
    return res.status(500).json({ message: errorMessage });
  }
});

export default router;
