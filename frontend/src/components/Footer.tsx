import React from 'react';
import { useIonRouter } from '@ionic/react';
import './Footer.css';

const Footer: React.FC = () => {
  const router = useIonRouter();

  const tabButtons = [
    { icon: '🏠', label: 'Home', url: '/home' },
    { icon: '📅', label: 'Add Crop', url: '/add-crop' },
    { icon: '👥', label: 'Community', url: '/community' },
    { icon: '❤️', label: 'Profile', url: '/profile' },
  ];

  const handleFeature = (url: string) => {
    router.push(url, 'forward');
  };

  return (
    <footer className="footerContainer">
      <div className="tabBar">
        {tabButtons.map((tab, index) => (
          <div
            key={index}
            className={`tabButton ${
              router.routeInfo.pathname === tab.url ? 'active' : ''
            }`}
            onClick={() => handleFeature(tab.url)}
          >
            <div className="tabIcon">{tab.icon}</div>
            <div className="tabLabel">{tab.label}</div>
          </div>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
