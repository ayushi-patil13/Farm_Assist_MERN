const axios = require("axios");

exports.getWeather = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    const response = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude,
          longitude,
          daily: [
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
            "precipitation_sum",
            "windspeed_10m_max"
          ].join(","),
          current_weather: true,
          timezone: "auto"
        }
      }
    );

    const data = response.data;

    // Generate alerts
    const alerts = generateAlerts(data);

    // Generate farming advice
    const advice = generateFarmingAdvice(data);

    res.json({
      current: data.current_weather,
      daily: data.daily,
      alerts,
      advice
    });

  } catch (error) {
    res.status(500).json({ message: "Weather fetch failed" });
  }
};

function generateAlerts(data) {
  const alerts = [];

  const rainProb = data.daily.precipitation_probability_max[0];
  const windSpeed = data.daily.windspeed_10m_max[0];

  if (rainProb > 70) {
    alerts.push({
      type: "warning",
      title: "Heavy Rainfall Warning",
      description: "High rainfall expected. Avoid irrigation and spraying."
    });
  }

  if (windSpeed > 25) {
    alerts.push({
      type: "advisory",
      title: "Strong Wind Advisory",
      description: "Avoid pesticide spraying due to strong winds."
    });
  }

  return alerts;
}

function generateFarmingAdvice(data) {
  const advice = [];

  const rainProb = data.daily.precipitation_probability_max[0];
  const tempMax = data.daily.temperature_2m_max[0];

  if (rainProb > 60) {
    advice.push({
      text: "No irrigation needed - rainfall expected"
    });
  }

  if (tempMax > 35) {
    advice.push({
      text: "High temperature expected. Ensure crop mulching and irrigation."
    });
  }

  if (rainProb < 20) {
    advice.push({
      text: "Good weather for harvesting."
    });
  }

  return advice;
}