import React, { useEffect, useState } from 'react';
import './Home.css';
import Footer from '../components/Footer';
import { IonPage, IonContent, useIonRouter } from "@ionic/react"; 

const Home: React.FC = () => {
  const router = useIonRouter();
  const [cropCount, setCropCount]     = useState<number>(0);
  const [temperature, setTemperature] = useState<string>('--');
  const [weatherDesc, setWeatherDesc] = useState<string>('Fetching weather...');
  const [humidity, setHumidity]       = useState<string>('--');
  const [windSpeed, setWindSpeed]     = useState<string>('--');
  const [rainChance, setRainChance]   = useState<string>('--');
  const [location, setLocation]       = useState<string>('Your location');
  const [userName, setUserName]       = useState<string>('Farmer');

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetIcon = hour < 12 ? '🌤️' : hour < 17 ? '☀️' : '🌙';
  const today    = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
    fetchCrops();
    fetchWeather();
  }, []);

  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/crops/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setCropCount(data.length);
    } catch (e) {
      console.error('fetchCrops:', e);
    }
  };

  const fetchWeather = async () => {
    if (!navigator.geolocation) { setTemperature('N/A'); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res  = await fetch(`http://localhost:5000/api/weather?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}`);
          const data = await res.json();
          setTemperature(data.current.temperature + '°C');
          setHumidity((data.current.humidity ?? '--') + '%');
          setWindSpeed((data.current.windspeed ?? '--') + ' km/h');
          const rain = data.daily?.precipitation_probability_max?.[0] ?? 0;
          setRainChance(rain + '%');
          if (rain > 70)      setWeatherDesc('Heavy rain expected — check irrigation');
          else if (rain > 40) setWeatherDesc('Chance of rain today');
          else                setWeatherDesc('Clear skies — good day to spray');
          if (data.location) setLocation(data.location);
        } catch { setTemperature('N/A'); setWeatherDesc('Unavailable'); }
      },
      () => { setTemperature('N/A'); setWeatherDesc('Location denied'); }
    );
  };

  const features = [
    { icon: '🌱', title: 'Crop Calendar',     sub: 'Sowing & harvest timeline',  color: '#16A34A', bg: '#DCFCE7', url: '/crop-calendar'      },
    { icon: '💧', title: 'Fertilizer Guide',  sub: 'Right nutrients, right time', color: '#2563EB', bg: '#DBEAFE', url: '/fertilizer'         },
    { icon: '📸', title: 'Disease Detection', sub: 'AI scan & diagnose',          color: '#DC2626', bg: '#FEE2E2', url: '/disease-detection'  },
    { icon: '🌤️', title: 'Weather',           sub: 'Forecast & farm alerts',     color: '#0284C7', bg: '#E0F2FE', url: '/weather'            },
    { icon: '📈', title: 'Yield Prediction',  sub: 'Monitor crop growth',         color: '#7C3AED', bg: '#EDE9FE', url: '/yeild-prediction'   },
    { icon: '💰', title: 'Market Prices',     sub: 'Live mandi rates',            color: '#CA8A04', bg: '#FEF9C3', url: '/market-price'       },
    { icon: '📋', title: 'Gov. Schemes',      sub: 'Subsidies & loans',           color: '#7C3AED', bg: '#EDE9FE', url: '/gov-schemes'        },
    { icon: '🛒', title: 'Buy & Sell',        sub: 'Farmer marketplace',          color: '#0D9488', bg: '#CCFBF1', url: '/buy-sell'           },
    { icon: '👥', title: 'Community',         sub: 'Ask experts & farmers',       color: '#E11D48', bg: '#FFE4E6', url: '/community'          },
  ];

  const quickLinks = [
    { label: '🌱 Crop Calendar', url: '/crop-calendar' },
    { label: '📸 Disease Scan',  url: '/disease-detection' },
    { label: '💧 Fertilizer',   url: '/fertilizer' },
    { label: '💰 Market Prices', url: '/market-price' },
  ];

  const alerts = [
    { icon: '🌧️', text: 'Heavy rain expected tomorrow — check irrigation', time: '2 hours ago', bg: '#DBEAFE' },
    { icon: '📢', text: 'New PM-KISAN installment available to claim',      time: '1 day ago',   bg: '#DCFCE7' },
    { icon: '📈', text: 'Wheat prices up 5% in nearby mandi today',         time: '2 days ago',  bg: '#FEF9C3' },
  ];

  return (
     <IonPage>
          <IonContent fullscreen>
          <div className="h-root">

      {/* ── TOPBAR ── */}
      <nav className="h-topbar">
        <div className="h-brand">
          <div className="h-brand-leaf">🌾</div>
          <span className="h-brand-name">FarmAssist</span>
        </div>
        <div className="h-topbar-right">
          <span className="h-topbar-date">{today}</span>
          <div className="h-avatar">{userName.charAt(0).toUpperCase()}</div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="h-hero">
        <div className="h-hero-inner">
          <div className="h-hero-left">
            <div className="h-greeting-row">
              <span className="h-greet-icon">{greetIcon}</span>
              <span className="h-greet-tag">{greeting}</span>
            </div>
            <h1 className="h-hero-title">
              Welcome back,<br /><em>{userName}!</em>
            </h1>
            <p className="h-hero-sub">
              Your crops are growing well. Stay on top of your farm activities.
            </p>
          </div>

          <div className="h-stat-pills">
            <div className="h-stat-pill">
              <span className="h-stat-icon">🌱</span>
              <div>
                <div className="h-stat-val">{cropCount}</div>
                <div className="h-stat-lbl">Active Crops</div>
              </div>
            </div>
            <div className="h-stat-pill">
              <span className="h-stat-icon">🌡️</span>
              <div>
                <div className="h-stat-val">{temperature}</div>
                <div className="h-stat-lbl">Local Temp</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="h-body">

        {/* ── LEFT ── */}
        <div className="h-left">

          {/* Quick strip */}
          <div className="h-quick-strip">
            {quickLinks.map((q, i) => (
              <button key={i} className="h-quick-btn" onClick={() => router.push(q.url, 'forward')}>
                {q.label}
              </button>
            ))}
          </div>

          <div className="h-sec-label">All Features</div>

          <div className="h-feat-grid">
            {features.map((f, i) => (
              <button
                key={i}
                className="h-feat-card"
                style={{ '--feat-color': f.color, '--feat-bg': f.bg } as React.CSSProperties}
                onClick={() => router.push(f.url, 'forward')}
              >
                <div className="h-feat-top">
                  <div className="h-feat-icon">{f.icon}</div>
                  <span className="h-feat-arrow">↗</span>
                </div>
                <div className="h-feat-title">{f.title}</div>
                <div className="h-feat-sub">{f.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="h-sidebar">

          {/* Weather card */}
          <div className="h-weather-card">
            <div className="h-weather-loc">📍 {location}</div>
            <div className="h-weather-temp">{temperature}</div>
            <div className="h-weather-desc">{weatherDesc}</div>
            <div className="h-weather-row">
              <div className="h-weather-item"><strong>{humidity}</strong>Humidity</div>
              <div className="h-weather-item"><strong>{windSpeed}</strong>Wind</div>
              <div className="h-weather-item"><strong>{rainChance}</strong>Rain</div>
            </div>
          </div>

          {/* Alerts */}
          <div className="h-alerts-panel">
            <div className="h-alerts-header">
              <span className="h-alerts-title">Recent Alerts</span>
              <span className="h-alerts-badge">{alerts.length} new</span>
            </div>
            {alerts.map((a, i) => (
              <div key={i} className="h-alert-row">
                <div className="h-alert-icon-wrap" style={{ background: a.bg }}>{a.icon}</div>
                <div className="h-alert-body">
                  <p className="h-alert-text">{a.text}</p>
                  <p className="h-alert-time">{a.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="h-summary-card">
            <p className="h-summary-title">Farm Summary</p>
            <div className="h-summary-row"><span className="h-sum-key">Active crops</span><span className="h-sum-val">{cropCount}</span></div>
            <div className="h-summary-divider" />
            <div className="h-summary-row"><span className="h-sum-key">Today's temp</span><span className="h-sum-val">{temperature}</span></div>
            <div className="h-summary-divider" />
            <div className="h-summary-row"><span className="h-sum-key">Conditions</span><span className="h-sum-val h-sum-green">{weatherDesc.split('—')[0].trim()}</span></div>
            <button className="h-cta-btn" onClick={() => router.push('/add-crop', 'forward')}>
              + Add New Crop
            </button>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
    </IonContent>
    </IonPage>
  );
};

export default Home;
