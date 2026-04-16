"""
FarmAssist — Disease Detection Service
Port: 8000
Approach: Multi-feature image analysis with rule-based scoring
          No GPU required. Works with OpenCV + NumPy only.
"""

import os
import json
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ─── Disease Knowledge Base ────────────────────────────────────────────────────
DISEASE_DB = {
    "Tomato___Late_blight": {
        "display": "Tomato Late Blight",
        "crop": "Tomato",
        "severity": "Severe",
        "confidence_base": 88,
        "treatment": "Apply Copper Oxychloride 50% WP @ 3g/litre immediately. Remove and destroy all infected plant parts. Avoid overhead irrigation. Re-apply every 7 days during humid conditions.",
        "prevention": [
            "Use certified disease-free seeds and transplants",
            "Apply preventive fungicide every 7-10 days during humid weather",
            "Maintain proper plant spacing (60cm) for air circulation",
            "Use drip irrigation — avoid wetting foliage",
            "Rotate crops — do not plant tomato/potato in same field for 3 years"
        ],
        "scores": {"dark": 3.0, "brown": 2.5, "low_green": 2.0, "high_edge": 1.5}
    },
    "Tomato___Early_blight": {
        "display": "Tomato Early Blight",
        "crop": "Tomato",
        "severity": "Moderate",
        "confidence_base": 82,
        "treatment": "Apply Mancozeb 75% WP @ 2.5g/litre or Chlorothalonil 75% WP @ 2g/litre. Remove and destroy infected lower leaves. Re-apply every 10-14 days.",
        "prevention": [
            "Mulch around plant base to prevent soil splash",
            "Water at base only — never overhead",
            "Remove infected plant debris from field promptly",
            "Apply copper spray preventively before the rainy season",
            "Use resistant varieties like Arka Rakshak"
        ],
        "scores": {"brown": 2.5, "dark": 1.5, "mid_green": 1.5, "high_edge": 1.0}
    },
    "Tomato___Bacterial_spot": {
        "display": "Tomato Bacterial Spot",
        "crop": "Tomato",
        "severity": "Moderate",
        "confidence_base": 78,
        "treatment": "Apply Copper Hydroxide or Streptomycin sulfate spray. Remove infected leaves. Avoid working with wet plants to prevent spread.",
        "prevention": [
            "Use disease-free transplants only",
            "Avoid overhead irrigation",
            "Disinfect tools between plants with 10% bleach solution",
            "Apply copper spray weekly during wet weather"
        ],
        "scores": {"brown": 2.0, "dark": 1.5, "mid_green": 1.0}
    },
    "Tomato___Leaf_Mold": {
        "display": "Tomato Leaf Mold",
        "crop": "Tomato",
        "severity": "Moderate",
        "confidence_base": 80,
        "treatment": "Apply Chlorothalonil 75% WP fungicide. Improve ventilation in greenhouse. Reduce humidity below 85%.",
        "prevention": [
            "Maintain greenhouse humidity below 85%",
            "Ensure good air circulation — prune lower leaves",
            "Avoid wetting leaves when watering",
            "Use resistant varieties"
        ],
        "scores": {"yellow": 1.5, "mid_green": 1.5, "low_dark": 1.0}
    },
    "Tomato___Yellow_Leaf_Curl_Virus": {
        "display": "Tomato Yellow Leaf Curl Virus",
        "crop": "Tomato",
        "severity": "Severe",
        "confidence_base": 85,
        "treatment": "No direct cure available. Remove infected plants immediately. Control whitefly vector with Imidacloprid 17.8% SL @ 0.5ml/litre or neem oil spray @ 5ml/litre.",
        "prevention": [
            "Plant virus-resistant varieties (TY-1, TY-2 gene varieties)",
            "Install yellow sticky traps (45 per acre) to monitor whitefly",
            "Apply neem oil spray @ 5ml/litre weekly to deter whiteflies",
            "Install insect-proof net houses for nursery production",
            "Eliminate weeds that serve as alternate whitefly hosts"
        ],
        "scores": {"yellow": 3.0, "low_dark": 2.0, "low_green": 1.5}
    },
    "Tomato___healthy": {
        "display": "Healthy Tomato",
        "crop": "Tomato",
        "severity": "None",
        "confidence_base": 92,
        "treatment": "No treatment needed. Your plant is healthy.",
        "prevention": [
            "Continue regular watering at base of plants (avoid wetting foliage)",
            "Monitor weekly for early signs of any disease",
            "Maintain balanced NPK fertilization",
            "Ensure 60cm spacing between plants for good air circulation"
        ],
        "scores": {"high_green": 4.0, "low_dark": 2.0, "low_brown": 1.5}
    },
    "Potato___Late_blight": {
        "display": "Potato Late Blight",
        "crop": "Potato",
        "severity": "Severe",
        "confidence_base": 87,
        "treatment": "Apply Metalaxyl + Mancozeb (Ridomil Gold MZ 68 WG @ 2.5g/litre) immediately. Destroy infected tubers — do not store. Apply every 7 days.",
        "prevention": [
            "Plant only certified, disease-free seed potatoes",
            "Apply protective fungicide before and during monsoon season",
            "Earth up (hill) soil around plants to protect tubers",
            "Avoid excessive nitrogen fertilizer",
            "Harvest promptly after vine death — do not delay"
        ],
        "scores": {"dark": 3.5, "brown": 2.0, "low_green": 2.5}
    },
    "Potato___Early_blight": {
        "display": "Potato Early Blight",
        "crop": "Potato",
        "severity": "Moderate",
        "confidence_base": 80,
        "treatment": "Apply Mancozeb 75% WP @ 2g/litre or Azoxystrobin 23% SC @ 1ml/litre. Remove infected lower leaves.",
        "prevention": [
            "Use resistant varieties (Kufri Jyoti, Kufri Bahar)",
            "Maintain balanced potassium fertilization (SOP @ 120 kg/ha)",
            "Practice 3-year crop rotation",
            "Remove and destroy plant debris after harvest"
        ],
        "scores": {"brown": 2.5, "dark": 1.5, "mid_green": 1.0}
    },
    "Potato___healthy": {
        "display": "Healthy Potato",
        "crop": "Potato",
        "severity": "None",
        "confidence_base": 90,
        "treatment": "No treatment needed.",
        "prevention": [
            "Continue regular earthing-up (hilling) to protect tubers",
            "Monitor weekly for Colorado potato beetle",
            "Maintain consistent soil moisture — avoid drought stress"
        ],
        "scores": {"high_green": 3.5, "low_dark": 2.0, "low_brown": 1.5}
    },
    "Corn_(maize)___Common_rust": {
        "display": "Maize Common Rust",
        "crop": "Maize",
        "severity": "Moderate",
        "confidence_base": 83,
        "treatment": "Apply Propiconazole 25% EC @ 1ml/litre or Trifloxystrobin 50% WG @ 0.5g/litre at first sign. Cover all leaf surfaces.",
        "prevention": [
            "Plant rust-resistant hybrid varieties (DKC 9144, P3396)",
            "Early planting to avoid peak rust infection season",
            "Scout fields weekly after tasseling stage",
            "Apply preventive fungicide at silking stage in high-risk areas"
        ],
        "scores": {"rust": 4.0, "mid_green": 1.5, "high_edge": 1.0}
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "display": "Maize Northern Leaf Blight",
        "crop": "Maize",
        "severity": "Moderate",
        "confidence_base": 81,
        "treatment": "Apply Tebuconazole 25.9% EC or Propiconazole 25% EC @ 1ml/litre. Remove and destroy infected crop debris after harvest.",
        "prevention": [
            "Plant resistant hybrids with Ht gene resistance",
            "Practice crop rotation with non-host crops (soybean, wheat)",
            "Deep tillage to bury infected debris",
            "Avoid dense planting — maintain 60-75cm row spacing"
        ],
        "scores": {"brown": 2.0, "dark": 1.5, "high_edge": 1.5, "mid_green": 1.0}
    },
    "Corn_(maize)___healthy": {
        "display": "Healthy Maize",
        "crop": "Maize",
        "severity": "None",
        "confidence_base": 91,
        "treatment": "No treatment needed.",
        "prevention": [
            "Continue regular scouting — walk through fields weekly",
            "Maintain optimal nitrogen levels (120-150 kg N/ha)",
            "Monitor for fall armyworm during vegetative stages"
        ],
        "scores": {"high_green": 4.0, "low_rust": 2.0, "low_dark": 2.0}
    },
    "Rice___Leaf_Blast": {
        "display": "Rice Leaf Blast",
        "crop": "Rice",
        "severity": "Severe",
        "confidence_base": 86,
        "treatment": "Apply Tricyclazole 75% WP @ 0.6g/litre or Isoprothiolane 40% EC @ 1.5ml/litre immediately. Drain field for 3-5 days. Reduce nitrogen application.",
        "prevention": [
            "Plant blast-resistant varieties (IR64, Samba Mahsuri, MTU1010)",
            "Avoid excess nitrogen fertilizer — split into 3 applications",
            "Maintain 5cm standing water in field",
            "Apply silicon fertilizer (SSP) to strengthen leaf cuticle",
            "Begin monitoring at 21 days after sowing (DAS)"
        ],
        "scores": {"dark": 2.0, "brown": 2.0, "mid_green": 1.5, "high_edge": 1.0}
    },
    "Rice___Brown_Spot": {
        "display": "Rice Brown Spot",
        "crop": "Rice",
        "severity": "Moderate",
        "confidence_base": 79,
        "treatment": "Apply Mancozeb 75% WP @ 2g/litre or Iprodione 50% WP @ 2g/litre. Improve potassium nutrition immediately.",
        "prevention": [
            "Treat seeds with Carbendazim 50% WP @ 2g/kg before sowing",
            "Apply balanced fertilization — especially potassium (MOP @ 60 kg/ha)",
            "Maintain proper water management (alternate wetting and drying)",
            "Remove and burn infected plant debris after harvest"
        ],
        "scores": {"brown": 3.0, "dark": 1.5, "mid_green": 1.0}
    },
    "Rice___healthy": {
        "display": "Healthy Rice",
        "crop": "Rice",
        "severity": "None",
        "confidence_base": 91,
        "treatment": "No treatment needed.",
        "prevention": [
            "Maintain 5cm standing water during vegetative stage",
            "Monitor weekly for stem borer egg masses",
            "Continue balanced fertilization schedule"
        ],
        "scores": {"high_green": 4.0, "low_dark": 2.0, "low_brown": 1.5}
    },
    "Wheat___Yellow_Rust": {
        "display": "Wheat Yellow Rust (Stripe Rust)",
        "crop": "Wheat",
        "severity": "Severe",
        "confidence_base": 85,
        "treatment": "Apply Propiconazole 25% EC @ 1ml/litre or Tebuconazole 25.9% EC @ 1ml/litre. Act WITHIN 48 HOURS of detection. Cover all leaves thoroughly.",
        "prevention": [
            "Plant resistant varieties (HD3086, PBW550, DBW17)",
            "Early planting (October 15 - November 5) to escape peak infection",
            "Scout fields from tillering stage onward",
            "Apply preventive fungicide if rust forecast indicates risk in your region"
        ],
        "scores": {"yellow": 4.0, "low_green": 1.5, "high_edge": 1.0}
    },
    "Wheat___healthy": {
        "display": "Healthy Wheat",
        "crop": "Wheat",
        "severity": "None",
        "confidence_base": 90,
        "treatment": "No treatment needed.",
        "prevention": [
            "Continue monitoring weekly — especially after rain",
            "Ensure adequate zinc nutrition (ZnSO4 @ 25 kg/ha)",
            "Scout for aphids during grain filling stage"
        ],
        "scores": {"high_green": 3.5, "low_yellow": 2.0, "low_dark": 1.5}
    },
    "Apple___Apple_scab": {
        "display": "Apple Scab",
        "crop": "Apple",
        "severity": "Moderate",
        "confidence_base": 82,
        "treatment": "Apply Captan 50% WP @ 3g/litre or Myclobutanil 10% WP @ 1g/litre. Prune and remove infected branches. Apply after every rain event.",
        "prevention": [
            "Apply dormant copper spray before bud break in spring",
            "Rake and destroy fallen leaves in autumn",
            "Prune trees for good air and light penetration",
            "Plant scab-resistant varieties (Gala, Fuji, Honeycrisp)"
        ],
        "scores": {"dark": 2.5, "brown": 2.0, "low_green": 1.5}
    },
    "Grape___Black_rot": {
        "display": "Grape Black Rot",
        "crop": "Grape",
        "severity": "Severe",
        "confidence_base": 84,
        "treatment": "Apply Mancozeb 75% WP @ 2.5g/litre or Myclobutanil 10% WP @ 1g/litre. Remove and destroy all mummified berries and infected canes immediately.",
        "prevention": [
            "Remove ALL mummified fruit from vines and ground before new season",
            "Prune vines to improve air circulation and light penetration",
            "Apply fungicide at bud break and every 10-14 days during season",
            "Avoid overhead irrigation — use drip or furrow"
        ],
        "scores": {"dark": 4.0, "low_green": 2.0, "high_edge": 1.5}
    },
    "Cotton___Leaf_Curl": {
        "display": "Cotton Leaf Curl Virus",
        "crop": "Cotton",
        "severity": "Severe",
        "confidence_base": 84,
        "treatment": "No direct curative treatment. Control whitefly vector: apply Imidacloprid 17.8% SL @ 0.5ml/litre or Thiamethoxam 25% WG @ 0.3g/litre. Remove and destroy infected plants.",
        "prevention": [
            "Plant virus-resistant cotton varieties (Bollgard II, NHH 44)",
            "Install yellow sticky traps @ 45 per acre for whitefly monitoring",
            "Apply neem oil spray @ 5ml/litre to repel whiteflies",
            "Remove and destroy volunteer cotton plants and alternate host weeds",
            "Early sowing (April-May) before peak whitefly season"
        ],
        "scores": {"mid_green": 2.0, "low_dark": 1.5, "yellow": 1.5}
    },
    "Groundnut___Early_Leaf_Spot": {
        "display": "Groundnut Early Leaf Spot",
        "crop": "Groundnut",
        "severity": "Moderate",
        "confidence_base": 79,
        "treatment": "Apply Chlorothalonil 75% WP @ 2g/litre or Mancozeb 75% WP @ 2.5g/litre. Begin spraying at 30 DAS. Repeat at 10-14 day intervals.",
        "prevention": [
            "Use certified disease-free seeds",
            "Rotate with non-legume crops (maize, sorghum) for 2 years",
            "Avoid dense planting — maintain 30cm plant spacing",
            "Remove and destroy infected plant debris after harvest",
            "Apply foliar spray of Carbendazim @ 1g/litre preventively"
        ],
        "scores": {"brown": 2.5, "dark": 1.5, "mid_green": 1.5, "high_edge": 1.0}
    },
}

# ─── Feature Extraction ────────────────────────────────────────────────────────
def extract_color_features(img_bgr):
    """Extract color-based features from plant leaf image."""
    img = cv2.resize(img_bgr, (224, 224))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    total = 224 * 224

    green  = cv2.inRange(hsv, np.array([35,40,40]),  np.array([90,255,255]))
    yellow = cv2.inRange(hsv, np.array([20,60,120]), np.array([38,255,255]))
    brown  = cv2.inRange(hsv, np.array([5,50,40]),   np.array([25,255,180]))
    rust   = cv2.inRange(hsv, np.array([5,100,80]),  np.array([22,255,220]))
    dark   = cv2.inRange(hsv, np.array([0,0,0]),     np.array([180,255,55]))

    edges = cv2.Canny(gray, 50, 150)

    return {
        "green_ratio":  np.sum(green>0)  / total,
        "yellow_ratio": np.sum(yellow>0) / total,
        "brown_ratio":  np.sum(brown>0)  / total,
        "rust_ratio":   np.sum(rust>0)   / total,
        "dark_ratio":   np.sum(dark>0)   / total,
        "edge_ratio":   np.sum(edges>0)  / total,
    }


# ─── Scoring Rules ─────────────────────────────────────────────────────────────
def score_disease(disease_key, features):
    """Score how well a disease matches the image features."""
    info = DISEASE_DB[disease_key]
    score_rules = info["scores"]
    score = 0.0

    g = features["green_ratio"]
    y = features["yellow_ratio"]
    b = features["brown_ratio"]
    r = features["rust_ratio"]
    d = features["dark_ratio"]
    e = features["edge_ratio"]

    # Positive signals
    if "high_green"  in score_rules and g > 0.55:
        score += score_rules["high_green"] * min(g / 0.55, 1.5)
    if "mid_green"   in score_rules and 0.25 < g < 0.65:
        score += score_rules["mid_green"]
    if "yellow"      in score_rules and y > 0.03:
        score += score_rules["yellow"] * min(y / 0.03, 2.0)
    if "brown"       in score_rules and b > 0.02:
        score += score_rules["brown"] * min(b / 0.02, 2.0)
    if "rust"        in score_rules and r > 0.03:
        score += score_rules["rust"] * min(r / 0.03, 2.0)
    if "dark"        in score_rules and d > 0.08:
        score += score_rules["dark"] * min(d / 0.08, 2.0)
    if "high_edge"   in score_rules and e > 0.08:
        score += score_rules["high_edge"]

    # Negative signals (penalties for contradicting features)
    if "low_green"   in score_rules and g > 0.55:
        score -= score_rules["low_green"] * (g - 0.55) * 5
    if "low_dark"    in score_rules and d > 0.15:
        score -= score_rules["low_dark"] * (d - 0.15) * 4
    if "low_brown"   in score_rules and b > 0.10:
        score -= score_rules["low_brown"] * (b - 0.10) * 4
    if "low_rust"    in score_rules and r > 0.05:
        score -= score_rules["low_rust"] * (r - 0.05) * 4
    if "low_yellow"  in score_rules and y > 0.08:
        score -= score_rules["low_yellow"] * (y - 0.08) * 4

    return max(score, 0.0)


# ─── Main Detection Function ───────────────────────────────────────────────────
def detect_disease(img_bgr):
    """Run disease detection and return structured result."""
    features = extract_color_features(img_bgr)

    # Score all diseases
    scored = {k: score_disease(k, features) for k in DISEASE_DB}

    # Sort by score descending
    sorted_diseases = sorted(scored.items(), key=lambda x: x[1], reverse=True)

    top_key, top_score = sorted_diseases[0]

    # If no strong signal, lean toward healthy
    if top_score < 1.0:
        # Default to a healthy result with low confidence
        top_key = "Tomato___healthy" if features["green_ratio"] > 0.4 else sorted_diseases[0][0]
        confidence = 55 + int(features["green_ratio"] * 30)
    else:
        # Scale confidence: score 1→60%, score 8→95%
        raw_conf = DISEASE_DB[top_key]["confidence_base"]
        scaled = min(98, raw_conf + int((top_score - 1) * 3))
        confidence = scaled

    info = DISEASE_DB[top_key]

    # Build top-3 alternatives
    alternatives = []
    for k, s in sorted_diseases[1:4]:
        if s > 0.3:
            alternatives.append({
                "disease": DISEASE_DB[k]["display"],
                "crop": DISEASE_DB[k]["crop"],
                "confidence": max(10, confidence - 20 - len(alternatives) * 8)
            })

    return {
        "disease":     info["display"],
        "crop":        info["crop"],
        "severity":    info["severity"],
        "confidence":  confidence,
        "treatment":   info["treatment"],
        "prevention":  info["prevention"],
        "alternatives": alternatives,
        "features_detected": {
            "green_coverage":  f"{features['green_ratio']*100:.1f}%",
            "disease_lesions": f"{(features['brown_ratio']+features['dark_ratio'])*100:.1f}%",
            "yellow_patches":  f"{features['yellow_ratio']*100:.1f}%",
            "rust_spots":      f"{features['rust_ratio']*100:.1f}%",
        }
    }


# ─── Routes ────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "FarmAssist Disease Detection", "diseases": len(DISEASE_DB)})


@app.route("/api/disease/detect", methods=["POST"])
def detect():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No image file provided. Send as multipart/form-data with key 'file'"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        # Read image from upload
        file_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Invalid or corrupted image file"}), 400

        # Validate minimum size
        h, w = img.shape[:2]
        if h < 50 or w < 50:
            return jsonify({"error": "Image too small — minimum 50x50 pixels required"}), 400

        result = detect_disease(img)
        return jsonify(result)

    except Exception as e:
        print(f"Detection error: {e}")
        return jsonify({"error": f"Detection failed: {str(e)}"}), 500


@app.route("/api/disease/diseases", methods=["GET"])
def list_diseases():
    """List all supported diseases."""
    diseases = [
        {"key": k, "display": v["display"], "crop": v["crop"], "severity": v["severity"]}
        for k, v in DISEASE_DB.items()
    ]
    crops = sorted(set(d["crop"] for d in diseases))
    return jsonify({"total": len(diseases), "crops_supported": crops, "diseases": diseases})


if __name__ == "__main__":
    print("FarmAssist Disease Detection Service starting on port 8000")
    print(f"Loaded {len(DISEASE_DB)} diseases across multiple crops")
    app.run(host="0.0.0.0", port=8000, debug=False)
