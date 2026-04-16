import React, { useState, useMemo, useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import './GovernmentSchemes.css';
import Footer from '../../components/Footer';
import API from '../../services/api';


interface Scheme {
  _id: string;
  name: string;
  fullName: string;
  description: string;
  amount?: string;
  badge: string;
  badgeColor: string;
  eligibility: string[];
  benefits: string[];
  timing?: string;
  applyButton: boolean;
  icon: string;
  iconColor: string;
  category: string;
  type: string;
}

const GovernmentSchemes: React.FC = () => {
  const router = useIonRouter();

  const [activeTab, setActiveTab] = useState('All Schemes');
  const [searchQuery, setSearchQuery] = useState('');
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [activeSchemes, setActiveSchemes] = useState<any[]>([]);

  const handleBack = () => {
    router.goBack();
  };

  // ✅ Fetch all schemes
  useEffect(() => {
    fetchSchemes();
    fetchUserSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const res = await API.get<Scheme[]>('/schemes');
      setAllSchemes(res.data);
    } catch (err) {
      console.log('Error fetching schemes', err);
    }
  };

  // ✅ Fetch user applied schemes
  const fetchUserSchemes = async () => {
    try {
      const res = await API.get<any[]>('/schemes/my');
      const formatted = res.data.map((item: any) => ({
        name: item.scheme.name,
        amount: item.scheme.amount || 'Applied',
        color: '#D1FAE5'
      }));
      setActiveSchemes(formatted);
    } catch (err) {
      console.log('Error fetching user schemes', err);
    }
  };

  // ✅ Apply for scheme
  // const handleApply = async (schemeId: string) => {
  //   try {
  //     await API.post('/schemes/apply', { schemeId });
  //     alert('Application submitted successfully!');
  //     fetchUserSchemes();
  //   } catch (err: any) {
  //     alert(err.response?.data?.message || 'Already applied or error occurred');
  //   }
  // };

  const tabs = ['All Schemes', 'Eligible for You', 'Subsidies'];

  // ✅ Filtering logic (UNCHANGED STRUCTURE)
  const filteredSchemes = useMemo(() => {
    let filtered = allSchemes;

    if (activeTab === 'Eligible for You') {
      filtered = filtered.filter(
        (scheme: any) =>
          scheme.category === 'eligible' || scheme.badge === 'Eligible'
      );
    } else if (activeTab === 'Subsidies') {
      filtered = filtered.filter(
        (scheme: any) =>
          scheme.type === 'subsidy' || scheme.badge === 'Subsidy'
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((scheme: any) =>
        scheme.name?.toLowerCase().includes(query) ||
        scheme.fullName?.toLowerCase().includes(query) ||
        scheme.description?.toLowerCase().includes(query) ||
        scheme.eligibility?.some((item: string) =>
          item.toLowerCase().includes(query)
        ) ||
        scheme.benefits?.some((item: string) =>
          item.toLowerCase().includes(query)
        )
      );
    }

    return filtered;
  }, [activeTab, searchQuery, allSchemes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const applyScheme = async (schemeId: string, applyLink: string) => {
    try {
      await API.post("/schemes/apply", { schemeId });
    } catch (err) {
      console.log("Scheme may already be applied");
    }

    // Always redirect
    window.open(applyLink, "_blank");
  };
  
  return (
    <div className="schemes-container">
      {/* Header */}
      <header className="schemes-header">
        <button className="back-button" onClick={handleBack}>
          <span className="back-icon">←</span>
        </button>
        <h1 className="schemes-title">Government Schemes</h1>
      </header>

      <main className="schemes-content">
        {/* Search */}
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search schemes..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button className="clear-search" onClick={clearSearch}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="schemes-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button-scheme ${
                activeTab === tab ? 'tab-active-scheme' : ''
              }`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {searchQuery && (
          <div className="results-count">
            Found {filteredSchemes.length} scheme
            {filteredSchemes.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Schemes List */}
        <div className="schemes-list">
          {filteredSchemes.length > 0 ? (
            filteredSchemes.map((scheme: any) => (
              <div key={scheme._id} className="scheme-card">
                <div className="scheme-header-row">
                  <div className="scheme-name-row">
                    <h3 className="scheme-name">{scheme.name}</h3>
                    <span
                      className="scheme-badge"
                      style={{ backgroundColor: scheme.badgeColor }}
                    >
                      {scheme.badge}
                    </span>
                  </div>
                  <div className="scheme-icon-wrapper">
                    <span
                      className="scheme-icon"
                      style={{ color: scheme.iconColor }}
                    >
                      {scheme.icon}
                    </span>
                  </div>
                </div>

                <div className="scheme-full-name">{scheme.fullName}</div>
                <div className="scheme-description">
                  {scheme.description}
                </div>

                {scheme.amount && (
                  <div className="scheme-amount-box">
                    {scheme.amount}
                  </div>
                )}

                <div className="scheme-section">
                  <div className="scheme-section-title">
                    Eligibility Criteria:
                  </div>
                  <ul className="scheme-list">
                    {scheme.eligibility?.map((item: string, index: number) => (
                      <li key={index} className="scheme-list-item">
                        <span className="check-icon-small">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {scheme.benefits && (
                  <div className="scheme-section">
                    <div className="scheme-section-title">
                      Key Benefits:
                    </div>
                    <ul className="scheme-benefits-list">
                      {scheme.benefits.map(
                        (benefit: string, index: number) => (
                          <li key={index} className="scheme-benefit-item">
                            • {benefit}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {scheme.timing && (
                  <div className="scheme-timing">
                    <span className="timing-icon">⏰</span>
                    {scheme.timing}
                  </div>
                )}

                {scheme.applyButton && (
                  <button
                    className="apply-button"
                    onClick={() => applyScheme(scheme._id, scheme.applyLink)}
                    >
                    Apply Now
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <div className="no-results-title">No schemes found</div>
              <div className="no-results-text">
                {searchQuery
                  ? `No results for "${searchQuery}". Try different keywords.`
                  : 'No schemes available in this category.'}
              </div>
            </div>
          )}
        </div>

        <div style={{ height: '100px' }}></div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GovernmentSchemes;