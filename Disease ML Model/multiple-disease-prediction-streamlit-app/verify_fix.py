import pickle
import numpy as np

model = pickle.load(open('saved_models/heart_disease_model.sav', 'rb'))
scaler = pickle.load(open('saved_models/heart_scaler.sav', 'rb'))

# User's exact values
x = np.array([[67, 1, 0, 160, 286, 1, 1, 108, 1, 3.5, 1, 2, 3]])

# WITHOUT scaler (the bug)
pred_raw = model.predict(x)
dec_raw = model.decision_function(x)
print("=== WITHOUT SCALER (BUG) ===")
print(f"Prediction: {pred_raw[0]} -> {'HEART DISEASE' if pred_raw[0]==1 else 'NO DISEASE'}")
print(f"Decision: {dec_raw[0]:.6f}")

# WITH scaler (the fix)
x_scaled = scaler.transform(x)
pred_scaled = model.predict(x_scaled)
dec_scaled = model.decision_function(x_scaled)
print()
print("=== WITH SCALER (FIXED) ===")
print(f"Prediction: {pred_scaled[0]} -> {'HEART DISEASE' if pred_scaled[0]==1 else 'NO DISEASE'}")
print(f"Decision: {dec_scaled[0]:.6f}")
