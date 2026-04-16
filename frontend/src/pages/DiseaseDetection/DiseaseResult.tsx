import React from "react";
import { useLocation, useHistory } from "react-router-dom";

const DiseaseResult: React.FC = () => {

  const location: any = useLocation();
  const history = useHistory();
  const data = location.state || {};

  const image = data.image || null; // ⭐ receive image

  const preventionList: string[] = data.prevention || [];
  const treatment: string = data.treatment || "Not available";

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low":
        return "#4CAF50";
      case "Moderate":
        return "#FF9800";
      case "Severe":
        return "#F44336";
      default:
        return "#777";
    }
  };

  return (
    <div style={styles.page}>

      <button
        style={styles.backBtn}
        onClick={() => history.push("/disease-detection")}
      >
        ← Back
      </button>

      <div style={styles.card}>

        <h2 style={styles.title}>🌿 Disease Detection Result</h2>

        {/* ⭐ Uploaded Image */}
        {image && (
          <div style={styles.imageContainer}>
            <img src={image} alt="Uploaded Crop" style={styles.image}/>
          </div>
        )}

        <div style={styles.infoSection}>
          <p><b>Disease:</b> {data?.disease || "Not detected"}</p>

          <p>
            <b>Severity:</b>
            <span
              style={{
                ...styles.severityBadge,
                backgroundColor: getSeverityColor(data?.severity)
              }}
            >
              {data?.severity || "N/A"}
            </span>
          </p>

          <p><b>Confidence:</b> {data?.confidence ? `${data.confidence}%` : "N/A"}</p>
        </div>

        <div style={styles.sectionCard}>
          <h3>🛡 Preventive Measures</h3>

          {preventionList.length === 0 ? (
            <p>No preventive measures available</p>
          ) : (
            <ul>
              {preventionList.map((p: string, i: number) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}
        </div>

        <div style={styles.sectionCard}>
          <h3>💊 Treatment</h3>
          <p>{treatment}</p>
        </div>

      </div>
    </div>
  );
};

export default DiseaseResult;

const styles: any = {

  page: {
    height: "100%",
    minHeight: "100vh",
    background: "#f5f5f5",
    padding: "20px",
    fontFamily: "Arial",
    overflowY: "scroll"
  },

  card: {
    width: "100%",
    maxWidth: "650px",
    background: "#fff",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    margin: "80px auto"
  },

  title: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#333",
    fontSize: "24px"
  },

  imageContainer: {
    textAlign: "center",
    marginBottom: "20px"
  },

  image: {
    width: "100%",
    maxWidth: "280px",
    height: "auto",
    borderRadius: "12px",
    border: "3px solid #eee",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },

  infoSection: {
    fontSize: "16px",
    lineHeight: "1.8",
    marginBottom: "20px",
    textAlign: "left"
  },

  severityBadge: {
    marginLeft: "10px",
    padding: "5px 12px",
    borderRadius: "20px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "bold"
  },

  sectionCard: {
    marginTop: "20px",
    background: "#fafafa",
    padding: "18px",
    borderRadius: "10px",
    border: "1px solid #eee"
  },

  backBtn: {
    position: "fixed",
    top: "20px",
    left: "20px",
    background: "#F44336",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: 10
  }

};