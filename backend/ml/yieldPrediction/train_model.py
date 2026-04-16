"""
FarmAssist - Crop Yield Prediction Model
=========================================
Task   : REGRESSION  → predict yield_per_acre (tons/acre)
Model  : Random Forest Regressor
Inputs : crop, soilType, area(acres), temperature(°C),
         nitrogen, phosphorus, potassium, currentStage

Inspired by:
  ShubhamKJ123/Crop-Yield-Prediction-using-Machine-Learning-Algorithms
  (adapted from classification → regression, Tkinter → Flask API,
   dummy data → agronomically-grounded synthetic data)
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import pickle

# ──────────────────────────────────────────────
# 1. Crop knowledge base
# ──────────────────────────────────────────────
# Base yield per acre (tons) at optimal conditions
CROP_BASE_YIELD = {
    "Rice": 2.5, "Wheat": 1.8, "Maize": 2.2, "Soyabean": 1.2,
    "Jowar": 1.0, "Bajra": 0.9, "Cotton": 0.5, "Sugarcane": 30.0,
    "Potato": 12.0, "Onion": 8.0, "Tomato": 15.0, "Chili": 3.5,
    "Groundnut": 1.5, "Sunflower": 1.2, "Turmeric": 5.0,
    "Banana": 20.0, "Mango": 5.0, "Grapes": 8.0,
    "Pomegranate": 5.0, "Lemon": 4.0,
}

# Optimal (N, P, K kg/ha, temp_min °C, temp_max °C)
CROP_OPTIMAL = {
    "Rice":        (80, 40, 40, 22, 32),
    "Wheat":       (60, 40, 30, 10, 22),
    "Maize":       (80, 40, 20, 20, 30),
    "Soyabean":    (20, 60, 40, 20, 28),
    "Jowar":       (60, 30, 20, 25, 35),
    "Bajra":       (50, 25, 20, 28, 38),
    "Cotton":      (80, 40, 40, 25, 35),
    "Sugarcane":  (120, 60, 60, 24, 35),
    "Potato":     (120, 60, 80, 15, 25),
    "Onion":       (80, 50, 60, 18, 28),
    "Tomato":     (100, 50, 50, 18, 28),
    "Chili":       (60, 40, 30, 22, 32),
    "Groundnut":   (20, 50, 30, 24, 32),
    "Sunflower":   (60, 40, 40, 20, 30),
    "Turmeric":    (80, 40, 40, 20, 30),
    "Banana":     (100, 60,100, 24, 34),
    "Mango":       (60, 40, 60, 24, 36),
    "Grapes":      (40, 40, 60, 15, 28),
    "Pomegranate": (40, 30, 40, 20, 36),
    "Lemon":       (60, 40, 40, 20, 34),
}

SOIL_MULT = {
    "Loamy": 1.15, "Clay": 1.05, "Sandy": 0.80,
    "Silty": 1.10, "Black": 1.20, "Red": 0.90,
}

STAGE_MULT = {
    "Sowing": 0.02, "Germination": 0.12,
    "Vegetative": 0.45, "Flowering": 0.72, "Maturation": 1.0,
}


# ──────────────────────────────────────────────
# 2. Yield formula
# ──────────────────────────────────────────────
def compute_yield_per_acre(crop, soil, temp, n, p, k, stage):
    base = CROP_BASE_YIELD[crop]
    opt_n, opt_p, opt_k, t_min, t_max = CROP_OPTIMAL[crop]

    # Nutrient score (penalise deficiency)
    n_score = min(1.0, n / opt_n)
    p_score = min(1.0, p / opt_p)
    k_score = min(1.0, k / opt_k)
    nutrient_score = n_score * 0.4 + p_score * 0.3 + k_score * 0.3

    # Temperature score (parabolic, peaks at mid-optimal)
    t_mid   = (t_min + t_max) / 2
    t_range = (t_max - t_min) / 2
    temp_score = max(0.0, 1.0 - ((temp - t_mid) / t_range) ** 2)

    ypa = (base
           * SOIL_MULT[soil]
           * STAGE_MULT[stage]
           * (0.5 + 0.5 * nutrient_score)
           * (0.6 + 0.4 * temp_score))
    return round(ypa, 4)


# ──────────────────────────────────────────────
# 3. Generate synthetic training data
# ──────────────────────────────────────────────
np.random.seed(42)
rows = []
crops  = list(CROP_BASE_YIELD.keys())
soils  = list(SOIL_MULT.keys())
stages = list(STAGE_MULT.keys())

for crop in crops:
    opt_n, opt_p, opt_k, t_min, t_max = CROP_OPTIMAL[crop]
    for _ in range(200):
        soil  = np.random.choice(soils)
        stage = np.random.choice(stages)
        area  = round(np.random.uniform(0.5, 20.0), 2)
        temp  = round(np.random.uniform(t_min - 8, t_max + 8), 1)
        n     = round(max(10, opt_n + np.random.uniform(-50, 30)), 1)
        p     = round(max(5,  opt_p + np.random.uniform(-30, 20)), 1)
        k     = round(max(5,  opt_k + np.random.uniform(-30, 20)), 1)

        ypa = compute_yield_per_acre(crop, soil, temp, n, p, k, stage)
        rows.append({
            "crop": crop, "soil": soil, "area": area,
            "temperature": temp, "nitrogen": n,
            "phosphorus": p, "potassium": k,
            "stage": stage, "yield_per_acre": ypa,
        })

df = pd.DataFrame(rows)
print(f"✅ Training data: {df.shape[0]} rows, {df['crop'].nunique()} crops")


# ──────────────────────────────────────────────
# 4. Encode & scale
# ──────────────────────────────────────────────
le_crop  = LabelEncoder()
le_soil  = LabelEncoder()
le_stage = LabelEncoder()
df["crop_enc"]  = le_crop.fit_transform(df["crop"])
df["soil_enc"]  = le_soil.fit_transform(df["soil"])
df["stage_enc"] = le_stage.fit_transform(df["stage"])

FEATURES = ["crop_enc", "soil_enc", "area", "temperature",
            "nitrogen", "phosphorus", "potassium", "stage_enc"]
X = df[FEATURES]
y = df["yield_per_acre"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)


# ──────────────────────────────────────────────
# 5. Train
# ──────────────────────────────────────────────
model = RandomForestRegressor(n_estimators=300, random_state=42, n_jobs=-1)
model.fit(X_train_sc, y_train)

y_pred = model.predict(X_test_sc)
r2   = r2_score(y_test, y_pred)
mae  = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f"\n📊 Model Performance:")
print(f"   R²  : {r2:.4f}  (1.0 = perfect)")
print(f"   MAE : {mae:.4f} tons/acre")
print(f"   RMSE: {rmse:.4f} tons/acre")


# ──────────────────────────────────────────────
# 6. Save artifacts
# ──────────────────────────────────────────────
meta = {
    "crops":  sorted(crops),
    "soils":  sorted(soils),
    "stages": list(STAGE_MULT.keys()),
    "crop_base_yield": CROP_BASE_YIELD,
    "crop_optimal": CROP_OPTIMAL,
}

pickle.dump(model,    open("yield_model.pkl", "wb"))
pickle.dump(le_crop,  open("le_crop.pkl",     "wb"))
pickle.dump(le_soil,  open("le_soil.pkl",     "wb"))
pickle.dump(le_stage, open("le_stage.pkl",    "wb"))
pickle.dump(scaler,   open("scaler.pkl",      "wb"))
pickle.dump(meta,     open("meta.pkl",        "wb"))

print("\n✅ Saved: yield_model.pkl, le_crop.pkl, le_soil.pkl,")
print("         le_stage.pkl, scaler.pkl, meta.pkl")
print(f"\nSupported crops : {sorted(crops)}")
print(f"Supported soils : {sorted(soils)}")
print(f"Supported stages: {list(STAGE_MULT.keys())}")
