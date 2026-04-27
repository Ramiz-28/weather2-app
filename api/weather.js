export default async function handler(req, res) {
  const { city } = req.query;

  const API_KEY = process.env.WEATHER_KEY;

  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );

    const weather = await weatherRes.json();
    const forecast = await forecastRes.json();

    res.status(200).json({ weather, forecast });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather" });
  }
}