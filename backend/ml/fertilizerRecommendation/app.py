"""
FarmAssist - Fertilizer Recommendation Flask API
=================================================
Endpoint : POST /predict

Request body (JSON):
{
  "crop":      "Rice",      ← must match a crop name from Fertilizer__1_.csv
  "actual_n":  45,          ← farmer's actual soil Nitrogen   (kg/ha)
  "actual_p":  20,          ← farmer's actual soil Phosphorus (kg/ha)
  "actual_k":  30,          ← farmer's actual soil Potassium  (kg/ha)
  "actual_ph": 5.2          ← farmer's actual soil pH
}

Response (JSON):
{
  "fertilizer":   "Urea",
  "ideal":        { "N": 80, "P": 40, "K": 40, "pH": 5.5 },
  "deficits":     { "N": 35, "P": 20, "K": 10, "pH": 0.3 },
  "advice":       "Your soil is low in Nitrogen. Apply Urea."
}
"""

from flask import Flask, request, jsonify
import pickle
import numpy as np
import os

app = Flask(__name__)

# ── Load artifacts ──
BASE = os.path.dirname(__file__)
model       = pickle.load(open(os.path.join(BASE, "fert_model.pkl"),  "rb"))
le_crop     = pickle.load(open(os.path.join(BASE, "le_crop.pkl"),     "rb"))
le_fert     = pickle.load(open(os.path.join(BASE, "le_fert.pkl"),     "rb"))
scaler      = pickle.load(open(os.path.join(BASE, "scaler.pkl"),      "rb"))
crop_ideals = pickle.load(open(os.path.join(BASE, "crop_ideals.pkl"), "rb"))

# Normalise crop names for lookup (strip + title-case)
CROP_MAP = {k.strip().lower(): k for k in crop_ideals}

ADVICE = {
    "Urea":   "Your soil is low in Nitrogen. Apply Urea to boost crop growth.",
    "DAP":    "Your soil is low in Phosphorus. Apply DAP (Di-Ammonium Phosphate).",
    "MOP":    "Your soil is low in Potassium. Apply MOP (Muriate of Potash).",
    "Lime":   "Your soil pH is too low (acidic). Apply agricultural Lime to raise pH.",
    "Sulfur": "Your soil pH is too high (alkaline). Apply Sulfur to lower pH.",
    "No Fertilizer Needed": "Your soil nutrient levels are adequate for this crop. No fertilizer required right now.",
}


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        print("Incoming:", data)

        # ── 1. Validate crop ──
        crop_raw = str(data.get("crop", "")).strip()
        crop_key = crop_raw.lower()
        if crop_key not in CROP_MAP:
            return jsonify({
                "error": f"Crop '{crop_raw}' not found. Supported crops: {list(crop_ideals.keys())}"
            }), 400

        crop_name = CROP_MAP[crop_key]
        ideal = crop_ideals[crop_name]          # { N, P, K, pH }

        # ── 2. Parse soil values ──
        actual_n  = float(data.get("actual_n",  0))
        actual_p  = float(data.get("actual_p",  0))
        actual_k  = float(data.get("actual_k",  0))
        actual_ph = float(data.get("actual_ph", 7.0))

        # ── 3. Compute deficits ──
        deficit_n  = ideal["N"]   - actual_n
        deficit_p  = ideal["P"]   - actual_p
        deficit_k  = ideal["K"]   - actual_k
        deficit_ph = ideal["pH"]  - actual_ph

        # ── 4. Encode crop ──
        if crop_name not in le_crop.classes_:
            return jsonify({"error": f"Crop '{crop_name}' not in encoder."}), 400
        crop_enc = le_crop.transform([crop_name])[0]

        # ── 5. Build feature vector & predict ──
        features = np.array([[
            crop_enc, actual_n, actual_p, actual_k, actual_ph,
            deficit_n, deficit_p, deficit_k
        ]])
        features_sc  = scaler.transform(features)
        pred_enc     = model.predict(features_sc)[0]
        fertilizer   = le_fert.inverse_transform([pred_enc])[0]

        return jsonify({
            "fertilizer": fertilizer,
            "ideal":   {"N": ideal["N"], "P": ideal["P"],
                        "K": ideal["K"], "pH": ideal["pH"]},
            "deficits": {"N":  round(deficit_n,  2),
                         "P":  round(deficit_p,  2),
                         "K":  round(deficit_k,  2),
                         "pH": round(deficit_ph, 2)},
            "advice":  ADVICE.get(fertilizer, ""),
        })

    except Exception as e:
        print("ML Error:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/crops", methods=["GET"])
def list_crops():
    """Return all supported crop names (useful for frontend dropdown)."""
    return jsonify({"crops": list(crop_ideals.keys())})


if __name__ == "__main__":
    app.run(port=5001, debug=True)
