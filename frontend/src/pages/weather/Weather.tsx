import React, { useState, useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import './Weather.css';
import Footer from '../../components/Footer';
import API from '../../services/api';

interface WeatherResponse {
  current: {
    temperature: number;
    windspeed_10m: number;
    weathercode: number;
    relative_humidity_2m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
  };
  alerts: {
    type: string;
    title: string;
    description: string;
  }[];
  advice: {
    text: string;
  }[];
}

interface ProfileResponse {
  profile: {
    district: string;
    state: string;
  };
}

const WeatherForecast: React.FC = () => {
  const router = useIonRouter();
  const [view, setView] = useState<'list' | 'detailed'>('detailed');
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [locationName, setLocationName] = useState<string>("Loading...");

  const handleBack = () => {
    router.push('/home', 'back');
  };

  const getCondition = (code: number): string => {
    if (code === 0) return "Sunny";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 67) return "Rainy";
    if (code <= 99) return "Thunderstorm";
    return "Cloudy";
  };

  const getIcon = (condition: string): string => {
    switch (condition) {
      case "Sunny": return "☀";
      case "Rainy": return "🌧";
      case "Thunderstorm": return "⛈";
      case "Partly Cloudy": return "⛅";
      default: return "☁";
    }
  };

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      const res = await API.get<WeatherResponse>("/weather", {
        params: { latitude: lat, longitude: lon }
      });
      setWeatherData(res.data);
    };

    const fetchProfileLocation = async () => {
      try {
        const res = await API.get<ProfileResponse>("/profile");

        const { district, state } = res.data.profile;

        setLocationName(`${district}, ${state}`);
      } catch (error) {
        setLocationName("Location unavailable");
      }
    };

  fetchProfileLocation();


    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeather(19.0760, 72.8777)
    );
  }, []);

  if (!weatherData) return <div className="appContainer">Loading...</div>;

  const currentCondition = getCondition(weatherData.current.weathercode);

  return (
    <div className='appContainer'>
      <div className='pageWrapper'>

        {/* HEADER */}
        <header className='weatherHeader'>
          <div className='weatherHeaderContent'>
            <button className='backButton' onClick={handleBack}>←</button>
            <div className='headerText'>
              <h1 className='weatherTitle'>Weather Forecast</h1>
              <p className='weatherLocation'>{locationName}</p>
            </div>
          </div>
        </header>

        <main className='mainContent'>

          {view === 'detailed' ? (
            <div className='detailedView'>

              {/* CURRENT WEATHER */}
              <div className='currentWeatherSection'>
                <div className='currentTemp'>
                  {weatherData.current.temperature}°C
                </div>
                <div className='currentCondition'>
                  {currentCondition}
                </div>

                <div className='weatherStats'>
                  <div className='weatherStatCard'>
                    <div className='statLabel'>Humidity</div>
                    <div className='statValue'>
                      {weatherData?.current?.relative_humidity_2m ?? 0}%
                    </div>
                  </div>

                  <div className='weatherStatCard'>
                    <div className='statLabel'>Wind</div>
                    <div className='statValue'>
                      {weatherData?.current?.windspeed_10m ?? 0} km/h
                    </div>
                  </div>

                  <div className='weatherStatCard'>
                    <div className='statLabel'>Rain</div>
                    <div className='statValue'>
                      {weatherData?.daily?.precipitation_probability_max?.[0] ?? 0}%
                    </div>
                  </div>
                </div>
              </div>

              <div className='contentWrapper'>

                {/* ALERTS */}
                {weatherData.alerts.map((alert, i) => (
                  <div key={i}
                    className='alertCard'
                    style={{
                      backgroundColor:
                        alert.type === "warning"
                          ? "#FFEBEE"
                          : alert.type === "advisory"
                            ? "#E3F2FD"
                            : "#F5F5F5"
                    }}>
                    <div className='alertContent'>
                      <div className='alertTitle'>{alert.title}</div>
                      <div className='alertDescription'>{alert.description}</div>
                    </div>
                  </div>
                ))}

                {/* FARMING ADVICE */}
                <h2 className='sectionTitle'>Farming Advice</h2>

                {weatherData.advice.map((item, i) => (
                  <div key={i}
                    className='adviceCard'
                    style={{ backgroundColor: "#E8F5E9" }}>
                    <div className='adviceText'>{item.text}</div>
                  </div>
                ))}

                <button
                  className='viewToggleButton'
                  onClick={() => setView('list')}
                >
                  View 7-Day Forecast →
                </button>

              </div>
            </div>
          ) : (

            <div className='listView'>
              <div className='contentWrapper'>
                <h2 className='sectionTitle'>7-Day Forecast</h2>

                <div className='forecastList'>
                  {weatherData.daily.time.slice(0, 7).map((date, index) => {
                    const condition = currentCondition;

                    return (
                      <div key={index} className='forecastCard'>
                        <div className='forecastLeft'>
                          <div className='forecastIcon'>
                            {getIcon(condition)}
                          </div>
                          <div className='forecastInfo'>
                            <div className='forecastDay'>
                              {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className='forecastCondition'>
                              {condition}
                            </div>
                          </div>
                        </div>

                        <div className='forecastRight'>
                          <div className='forecastStat'>
                            💧 {weatherData.daily.precipitation_probability_max[index]}%
                          </div>
                          <div className='forecastTemp'>
                            {weatherData.daily.temperature_2m_max[index]}°
                            <span className='tempLow'>
                              {weatherData.daily.temperature_2m_min[index]}°
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  className='viewToggleButton'
                  onClick={() => setView('detailed')}
                >
                  ← View Detailed Weather
                </button>

              </div>
            </div>

          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default WeatherForecast;