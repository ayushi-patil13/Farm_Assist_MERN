import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, useIonRouter } from "@ionic/react"; 
import './FertilizerPrediction.css';
import Footer from '../../components/Footer';


interface Fertilizer {
  fertilizer: string;
  type: 'Chemical' | 'Organic';
  dosage: string;
  stage: string;
  timing: string;
  benefits: string[];
  caution?: string;
  advice?: string;
}

const FertilizerRecommendation: React.FC = () => {
  const router = useIonRouter();

  const [crops, setCrops] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');

  const [selectedStage, setSelectedStage] = useState<string>('Vegetative');

  const [n, setN] = useState<string>('');
  const [p, setP] = useState<string>('');
  const [k, setK] = useState<string>('');
  const [ph, setPh] = useState<string>('');

  const [searchResults, setSearchResults] = useState<Fertilizer[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // ✅ GET CROPS FROM ML BACKEND
  useEffect(() => {
    fetch('http://localhost:5000/api/fertilizers/crops', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const cropList = data.crops || [];
        setCrops(cropList);

        if (cropList.length > 0) {
          setSelectedCrop(cropList[0]);
        }
      })
      .catch(err => console.error("Crop fetch error:", err));
  }, []);

  // ✅ SEARCH API
  const handleSearch = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/fertilizers/recommend',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            crop: selectedCrop,
            actual_n: Number(n),
            actual_p: Number(p),
            actual_k: Number(k),
            actual_ph: Number(ph)
          })
        }
      );

      const data = await response.json();
      console.log("API RESPONSE:", data);

      // 🔥 FIX: map ML response properly
      const result: Fertilizer[] = [
        {
          fertilizer: data.fertilizer,
          type: "Chemical",
          dosage: "Apply as per soil deficiency",
          stage: selectedStage,
          timing: "As recommended",
          benefits: [data.advice],
          caution: "",
          advice: data.advice
        }
      ];

      setSearchResults(result);
      setHasSearched(true);

    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const filteredFertilizers =
    selectedFilter === 'All'
      ? searchResults
      : searchResults.filter(item => item.type === selectedFilter);

  const handleBack = () => {
    router.push('/home', 'back');
  };

  return (
    <IonPage>
          <IonContent fullscreen>
    <div className='appContainer'>
      <div className='pageWrapper'>

        {/* HEADER */}
        <header className='fertilizerHeader'>
          <div className='fertilizerHeaderContent'>
            <button className='backButton' onClick={handleBack}>←</button>
            <h1 className='fertilizerTitle'>Fertilizer Recommendation</h1>
          </div>
        </header>

        <main className='mainContent'>
          <div className='contentWrapper'>

            {/* CROP + STAGE */}
            <div className='filtersSection'>
              <div className='filterRow'>

                {/* CROPS DROPDOWN */}
                <div className='filterItem'>
                  <label>Crop</label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className='customSelect'
                  >
                    {crops.map((crop) => (
                      <option key={crop} value={crop}>
                        {crop}
                      </option>
                    ))}
                  </select>
                </div>

                {/* STAGE */}
                <div className='filterItem'>
                  <label>Stage</label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className='customSelect'
                  >
                    <option value="Basal">Basal</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Reproductive">Reproductive</option>
                  </select>
                </div>

                <button className='searchButton' onClick={handleSearch}>
                  🔍
                </button>
              </div>

              {/* SOIL INPUTS */}
              <div className='filterRow' style={{ marginTop: 10 }}>
                <input placeholder="N" value={n} onChange={e => setN(e.target.value)} className="customSelect" />
                <input placeholder="P" value={p} onChange={e => setP(e.target.value)} className="customSelect" />
                <input placeholder="K" value={k} onChange={e => setK(e.target.value)} className="customSelect" />
                <input placeholder="pH" value={ph} onChange={e => setPh(e.target.value)} className="customSelect" />
              </div>

              {/* FILTERS */}
              <div className='chipContainer'>
                {['All', 'Organic', 'Chemical'].map(type => (
                  <button
                    key={type}
                    className={`filterChip ${selectedFilter === type ? 'active' : ''}`}
                    onClick={() => setSelectedFilter(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* RESULTS */}
            {!hasSearched ? (
              <div className='emptyState'>
                <div className='emptyIcon'>🌱</div>
                <h3>Enter soil values & get recommendation</h3>
              </div>
            ) : filteredFertilizers.length > 0 ? (
              <div className='fertilizerList'>
                <h2>Recommended Fertilizer</h2>

                {filteredFertilizers.map((f, i) => (
                  <div key={i} className='fertilizerCard'>
                    <h3>{f.fertilizer}</h3>

                    <p><b>Type:</b> {f.type}</p>
                    <p><b>Stage:</b> {f.stage}</p>
                    <p><b>Dosage:</b> {f.dosage}</p>
                    <p><b>Timing:</b> {f.timing}</p>

                    {f.advice && (
                      <p style={{ color: 'green' }}>
                        <b>Advice:</b> {f.advice}
                      </p>
                    )}

                    <ul>
                      {f.benefits?.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>

                    {f.caution && (
                      <p style={{ color: 'red' }}>{f.caution}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className='emptyState'>
                <div className='emptyIcon'>❌</div>
                <h3>No results found</h3>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
    </IonContent>
    </IonPage>
  );
};

export default FertilizerRecommendation;