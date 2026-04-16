"""
FarmAssist - Fertilizer Recommendation Model
=============================================
Dataset : Fertilizer__1_.csv  (97 crops × ideal N, P, K, pH)

Logic:
  1. Load each crop's ideal N, P, K, pH from dataset.
  2. Simulate farmers with varying actual soil readings.
  3. Compute deficits  (ideal − actual).
  4. Label the fertilizer based on which nutrient is most deficient.
  5. Train a Random Forest on [crop, actual_N, actual_P, actual_K,
     actual_pH, deficit_N, deficit_P, deficit_K] → fertilizer.

Fertilizer classes
  • Urea   – mainly Nitrogen-deficient soils
  • DAP    – mainly Phosphorus-deficient soils
  • MOP    – mainly Potassium-deficient soils
  • Lime   – soil too acidic (pH too low)
  • Sulfur – soil too alkaline (pH too high)
  • No Fertilizer Needed – soil already meets crop requirements
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os

# ──────────────────────────────────────────────
# 1. Load crop ideal requirements
# ──────────────────────────────────────────────
df = pd.read_csv("Fertilizer__1_.csv")
crop_ideals = df.groupby("Crop")[["N", "P", "K", "pH"]].mean().reset_index()
print(f"✅ Loaded ideal requirements for {len(crop_ideals)} crops")

# ──────────────────────────────────────────────
# 2. Fertilizer labelling rule
# ──────────────────────────────────────────────
def assign_fertilizer(deficit_n, deficit_p, deficit_k, deficit_ph):
    """Return fertilizer name based on nutrient deficit."""
    # pH correction takes priority
    if deficit_ph > 0.8:    return "Lime"
    if deficit_ph < -0.5:   return "Sulfur"
    # No significant deficit → no action needed
    if deficit_n <= 5 and deficit_p <= 5 and deficit_k <= 5:
        return "No Fertilizer Needed"
    # Biggest deficit determines fertilizer
    winner = max({"Urea": deficit_n, "DAP": deficit_p, "MOP": deficit_k},
                 key=lambda k: {"Urea": deficit_n, "DAP": deficit_p, "MOP": deficit_k}[k])
    return winner

# ──────────────────────────────────────────────
# 3. Generate synthetic training data
# ──────────────────────────────────────────────
np.random.seed(42)
rows = []
for _, crop_row in crop_ideals.iterrows():
    crop = crop_row["Crop"]
    ideal_n, ideal_p = crop_row["N"], crop_row["P"]
    ideal_k, ideal_ph = crop_row["K"], crop_row["pH"]

    for _ in range(80):          # 80 synthetic farmers per crop
        actual_n  = max(0,   ideal_n  + np.random.uniform(-70, 25))
        actual_p  = max(0,   ideal_p  + np.random.uniform(-60, 25))
        actual_k  = max(0,   ideal_k  + np.random.uniform(-70, 25))
        actual_ph = max(3.0, min(8.5, ideal_ph + np.random.uniform(-1.5, 1.2)))

        deficit_n  = ideal_n  - actual_n
        deficit_p  = ideal_p  - actual_p
        deficit_k  = ideal_k  - actual_k
        deficit_ph = ideal_ph - actual_ph

        rows.append({
            "crop":      crop,
            "actual_n":  round(actual_n, 2),
            "actual_p":  round(actual_p, 2),
            "actual_k":  round(actual_k, 2),
            "actual_ph": round(actual_ph, 2),
            "deficit_n": round(deficit_n, 2),
            "deficit_p": round(deficit_p, 2),
            "deficit_k": round(deficit_k, 2),
            "fertilizer": assign_fertilizer(deficit_n, deficit_p, deficit_k, deficit_ph),
        })

train_df = pd.DataFrame(rows)
print(f"✅ Training data: {train_df.shape[0]} rows")
print(train_df["fertilizer"].value_counts())

# ──────────────────────────────────────────────
# 4. Encode & scale
# ──────────────────────────────────────────────
le_crop = LabelEncoder()
le_fert = LabelEncoder()
train_df["crop_enc"] = le_crop.fit_transform(train_df["crop"])
train_df["fert_enc"] = le_fert.fit_transform(train_df["fertilizer"])

FEATURES = ["crop_enc", "actual_n", "actual_p", "actual_k",
            "actual_ph", "deficit_n", "deficit_p", "deficit_k"]
X = train_df[FEATURES]
y = train_df["fert_enc"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc  = scaler.transform(X_test)

# ──────────────────────────────────────────────
# 5. Train
# ──────────────────────────────────────────────
model = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1)
model.fit(X_train_sc, y_train)

y_pred = model.predict(X_test_sc)
print(f"\n✅ Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(classification_report(y_test, y_pred, target_names=le_fert.classes_))

# ──────────────────────────────────────────────
# 6. Save artifacts
# ──────────────────────────────────────────────
crop_ideal_dict = (
    crop_ideals.set_index("Crop")[["N", "P", "K", "pH"]]
    .to_dict(orient="index")
)

pickle.dump(model,            open("fert_model.pkl", "wb"))
pickle.dump(le_crop,          open("le_crop.pkl",    "wb"))
pickle.dump(le_fert,          open("le_fert.pkl",    "wb"))
pickle.dump(scaler,           open("scaler.pkl",     "wb"))
pickle.dump(crop_ideal_dict,  open("crop_ideals.pkl","wb"))

print("\n✅ Saved: fert_model.pkl, le_crop.pkl, le_fert.pkl, scaler.pkl, crop_ideals.pkl")
print("Supported crops:", list(crop_ideal_dict.keys()))
