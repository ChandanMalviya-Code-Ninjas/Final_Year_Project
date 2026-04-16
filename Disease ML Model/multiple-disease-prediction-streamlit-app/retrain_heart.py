"""
Retrain heart disease model with SVC + StandardScaler for better accuracy.
"""
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report

df = pd.read_csv('dataset/heart.csv')
X = df.drop('target', axis=1)
y = df['target']

print(f"Dataset: {X.shape[0]} samples, {X.shape[1]} features")

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=2, stratify=y)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train SVC with linear kernel
model = SVC(kernel='linear', C=1.0, random_state=2)
model.fit(X_train_scaled, y_train)

# Evaluate
train_acc = accuracy_score(y_train, model.predict(X_train_scaled))
test_acc = accuracy_score(y_test, model.predict(X_test_scaled))

print(f"Train accuracy: {train_acc*100:.1f}%")
print(f"Test accuracy:  {test_acc*100:.1f}%")
print()
print("Test set classification report:")
print(classification_report(y_test, model.predict(X_test_scaled), target_names=['No Disease', 'Disease']))

# Full dataset
X_full_scaled = scaler.transform(X)
full_preds = model.predict(X_full_scaled)
full_acc = accuracy_score(y, full_preds)
fn = ((y==1) & (full_preds==0)).sum()
fp = ((y==0) & (full_preds==1)).sum()
print(f"Full dataset accuracy: {full_acc*100:.1f}%")
print(f"False negatives: {fn}")
print(f"False positives: {fp}")

# Cross validation
cv_scores = cross_val_score(model, scaler.transform(X), y, cv=5)
print(f"Cross-val accuracy: {cv_scores.mean()*100:.1f}% (+/- {cv_scores.std()*100:.1f}%)")

# Test user's values
print()
print("="*60)
user_input = np.array([[67, 1, 0, 160, 286, 1, 1, 108, 1, 3.5, 1, 2, 3]])
user_scaled = scaler.transform(user_input)
user_pred = model.predict(user_scaled)
user_dec = model.decision_function(user_scaled)
print(f"User values [67,1,0,160,286,1,1,108,1,3.5,1,2,3]:")
print(f"  Prediction: {user_pred[0]} ({'HEART DISEASE' if user_pred[0]==1 else 'NO DISEASE'})")
print(f"  Decision: {user_dec[0]:.6f}")

# Row 139 test
row139 = X.iloc[139:140]
row139_scaled = scaler.transform(row139)
pred139 = model.predict(row139_scaled)
dec139 = model.decision_function(row139_scaled)
print(f"Row 139 (actual=1): Prediction={pred139[0]}, Decision={dec139[0]:.4f}")

# Extract weights
print()
print("="*60)
print("MODEL WEIGHTS:")
print(f"scaler_mean = {scaler.mean_.tolist()}")
print(f"scaler_scale = {scaler.scale_.tolist()}")
print(f"coef = {model.coef_[0].tolist()}")
print(f"intercept = {model.intercept_[0]}")

# Save
pickle.dump(model, open('saved_models/heart_disease_model.sav', 'wb'))
pickle.dump(scaler, open('saved_models/heart_scaler.sav', 'wb'))
print("\nSaved!")
