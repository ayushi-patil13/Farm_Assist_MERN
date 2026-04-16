import React, { useRef } from 'react';
import { useIonRouter } from '@ionic/react';
import './DiseaseDetection.css';
import Footer from '../../components/Footer';
import { useHistory } from "react-router-dom";

const DiseaseDetection: React.FC = () => {
  const history = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useIonRouter();

  const handleBack = () => {
    router.goBack();
  };

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleUploadFromGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];
    if (!file) return;

    const imagePreview = URL.createObjectURL(file); // ⭐ create preview

    const formData = new FormData();
    formData.append("image", file);

    try {

      const res = await fetch("http://localhost:5000/api/disease/detect", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      console.log("Prediction:", data);

      history.push({
        pathname: "/disease-result",
        state: {
          ...data,
          image: imagePreview // ⭐ pass image
        }
      });

    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to detect disease. Please try again.");
    }
  };


  const photographyTips = [
    'Take photo in good natural light',
    'Focus on the affected area',
    'Avoid blurry images',
    'Include both healthy and diseased parts'
  ];

  return (
    <div className="disease-detection-container">

      <header className="disease-header">
        <button className="back-button" onClick={handleBack}>
          <span className="back-icon">←</span>
        </button>
        <h1 className="disease-title">Crop Disease Detection</h1>
      </header>

      <main className="disease-content">
        <div className="upload-section">

          <div className="camera-icon-wrapper">
            <div className="camera-icon">📷</div>
          </div>

          <h2 className="upload-title">Upload Crop Image</h2>
          <p className="upload-subtitle">
            Take a clear photo of the affected plant part for accurate diagnosis
          </p>

          <div className="action-buttons">
            <button className="take-photo-button" onClick={handleTakePhoto}>
              <span className="button-icon">📷</span>
              Take Photo
            </button>

            <button className="upload-gallery-button" onClick={handleUploadFromGallery}>
              <span className="button-icon">⬆️</span>
              Upload from Gallery
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="tips-section">
          <div className="tips-header">
            <span className="tips-icon">📸</span>
            <span className="tips-title">Photography Tips</span>
          </div>

          <ul className="tips-list">
            {photographyTips.map((tip, index) => (
              <li key={index} className="tip-item">
                {tip}
              </li>
            ))}
          </ul>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default DiseaseDetection;