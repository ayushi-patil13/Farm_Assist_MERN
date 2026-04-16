"""
FarmAssist - Crop Yield Prediction Flask API
=============================================
Port    : 5002
Endpoint: POST /predict

Request body (JSON):
{
  "crop":        "Rice",
  "soil":        "Loamy",
  "area":        2.5,           ← farmer's field area in acres
  "temperature": 28,            ← current temperature °C
  "nitrogen":    70,            ← actual soil N (kg/ha)
  "phosphorus":  35,            ← actual soil P (kg/ha)
  "potassium":   38,            ← actual soil K (kg/ha)
  "stage":       "Vegetative"   ← current crop growth stage
}

Response (JSON):
{
  "yield_per_acre": 1.23,       ← tons per acre
  "total_yield":    3.08,       ← tons for the full area
  "unit":           "tons",
  "crop":           "Rice",
  "area":           2.5,
  "stage":          "Vegetative"
}

Also:
  GET /crops  → list of all supported crop names
  GET /meta   → crops, soils, stages
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

BASE = os.path.dirname(__file__)

# ── Load artifacts ──
model    = pickle.load(open(os.path.join(BASE, "yield_model.pkl"), "rb"))
le_crop  = pickle.load(open(os.path.join(BASE, "le_crop.pkl"),     "rb"))
le_soil  = pickle.load(open(os.path.join(BASE, "le_soil.pkl"),     "rb"))
le_stage = pickle.load(open(os.path.join(BASE, "le_stage.pkl"),    "rb"))
scaler   = pickle.load(open(os.path.join(BASE, "scaler.pkl"),      "rb"))
meta     = pickle.load(open(os.path.join(BASE, "meta.pkl"),        "rb"))

# Build case-insensitive lookup maps
CROP_MAP  = {c.lower(): c for c in meta["crops"]}
SOIL_MAP  = {s.lower(): s for s in meta["soils"]}
STAGE_MAP = {s.lower(): s for s in meta["stages"]}


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        print("Incoming:", data)

        # ── Validate & normalise inputs ──
        crop_raw  = str(data.get("crop",  "")).strip()
        soil_raw  = str(data.get("soil",  "")).strip()
        stage_raw = str(data.get("stage", "")).strip()

        crop  = CROP_MAP.get(crop_raw.lower())
        soil  = SOIL_MAP.get(soil_raw.lower())
        stage = STAGE_MAP.get(stage_raw.lower())

        errors = []
        if not crop:
            errors.append(f"Crop '{crop_raw}' not supported. Options: {meta['crops']}")
        if not soil:
            errors.append(f"Soil '{soil_raw}' not supported. Options: {meta['soils']}")
        if not stage:
            errors.append(f"Stage '{stage_raw}' not supported. Options: {meta['stages']}")
        if errors:
            return jsonify({"error": "; ".join(errors)}), 400

        area  = float(data.get("area",        1.0))
        temp  = float(data.get("temperature", 25.0))
        n     = float(data.get("nitrogen",    50.0))
        p     = float(data.get("phosphorus",  30.0))
        k     = float(data.get("potassium",   30.0))

        # ── Encode ──
        crop_enc  = le_crop.transform([crop])[0]
        soil_enc  = le_soil.transform([soil])[0]
        stage_enc = le_stage.transform([stage])[0]

        # ── Feature vector ──
        features = np.array([[crop_enc, soil_enc, area, temp, n, p, k, stage_enc]])
        features_sc = scaler.transform(features)

        # ── Predict ──
        yield_per_acre = float(model.predict(features_sc)[0])
        yield_per_acre = max(0.0, round(yield_per_acre, 2))
        total_yield    = round(yield_per_acre * area, 2)

        return jsonify({
            "yield_per_acre": yield_per_acre,
            "total_yield":    total_yield,
            "unit":           "tons",
            "crop":           crop,
            "area":           area,
            "stage":          stage,
        })

    except Exception as e:
        print("ML Error:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/crops", methods=["GET"])
def list_crops():
    return jsonify({"crops": meta["crops"]})


@app.route("/meta", methods=["GET"])
def get_meta():
    return jsonify({
        "crops":  meta["crops"],
        "soils":  meta["soils"],
        "stages": meta["stages"],
    })


if __name__ == "__main__":
    app.run(port=5002, debug=True)
