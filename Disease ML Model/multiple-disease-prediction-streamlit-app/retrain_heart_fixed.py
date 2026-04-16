"""
Retrain heart disease model with CORRECTED target labels.
In the original dataset: target=1 means HEALTHY, target=0 means DISEASE.
We flip it so target=1 = DISEASE, target=0 = HEALTHY (standard convention).
"""
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Load dataset
df = pd.read_csv('dataset/heart.csv')
X = df.drop('target', axis=1)
y_original = df['target']

# FLIP the target: 0->1 (disease), 1->0 (healthy)
y = 1 - y_original

print(f"Dataset: {X.shape[0]} samples, {X.shape[1]} features")
print(f"Original target: 0={(y_original==0).sum()}, 1={(y_original==1).sum()}")
print(f"Corrected target: 0(healthy)={( y==0).sum()}, 1(disease)={(y==1).sum()}")

# Verify correction makes medical sense
print("\n=== VERIFICATION (corrected target) ===")
print(f"ca=0 (no blockage) -> mean disease: {y[X.ca==0].mean():.2f} (should be low)")
print(f"ca=3 (3 blocked)   -> mean disease: {y[X.ca==3].mean():.2f} (should be high)")
print(f"exang=1 (angina)   -> mean disease: {y[X.exang==1].mean():.2f} (should be high)")
print(f"thal=3 (rev defect) -> mean disease: {y[X.thal==3].mean():.2f} (should be high)")

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=2, stratify=y
)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train SVC with linear kernel (same as original)
model = SVC(kernel='linear', C=1.0, random_state=2)
model.fit(X_train_scaled, y_train)

# Evaluate
train_acc = accuracy_score(y_train, model.predict(X_train_scaled))
test_acc = accuracy_score(y_test, model.predict(X_test_scaled))
cv_scores = cross_val_score(model, scaler.transform(X), y, cv=5, scoring='accuracy')

print(f"\n=== MODEL PERFORMANCE ===")
print(f"Train accuracy: {train_acc*100:.1f}%")
print(f"Test accuracy:  {test_acc*100:.1f}%")
print(f"CV accuracy:    {cv_scores.mean()*100:.1f}% (+/- {cv_scores.std()*100:.1f}%)")

print(f"\nTest Classification Report:")
y_pred_test = model.predict(X_test_scaled)
print(classification_report(y_test, y_pred_test, target_names=['Healthy', 'Disease']))

# Test user's values
print("="*60)
user_input = np.array([[67, 1, 0, 160, 286, 1, 1, 108, 1, 3.5, 1, 2, 3]])
user_scaled = scaler.transform(user_input)
user_pred = model.predict(user_scaled)
user_dec = model.decision_function(user_scaled)

result = "HEART DISEASE DETECTED" if user_pred[0] == 1 else "NO DISEASE"
print(f"User [67,1,0,160,286,1,1,108,1,3.5,1,2,3]:")
print(f"  Prediction: {user_pred[0]} -> {result}")
print(f"  Decision:   {user_dec[0]:.6f}")

# Save
pickle.dump(model, open('saved_models/heart_disease_model.sav', 'wb'))
pickle.dump(scaler, open('saved_models/heart_scaler.sav', 'wb'))
print(f"\nModel saved! (target=1 now correctly means DISEASE)")
