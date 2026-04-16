"""
Retrain heart disease model with multiple algorithms and pick the best one.
The current linear SVM misclassifies high-risk patients because it can't
capture non-linear feature interactions (e.g. cp=0 + ca=2 + thal=3).
"""
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Load dataset
df = pd.read_csv('dataset/heart.csv')
X = df.drop('target', axis=1)
y = df['target']

print(f"Dataset: {X.shape[0]} samples, {X.shape[1]} features")
print(f"Class distribution: {y.value_counts().to_dict()}")
print(f"Features: {X.columns.tolist()}")

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=2, stratify=y
)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# User's test case
user_input = np.array([[67, 1, 0, 160, 286, 1, 1, 108, 1, 3.5, 1, 2, 3]])
user_scaled = scaler.transform(user_input)

print("\n" + "="*70)
print("COMPARING MODELS")
print("="*70)

models = {
    'Linear SVM (current)': SVC(kernel='linear', C=1.0, random_state=2),
    'RBF SVM': SVC(kernel='rbf', C=10.0, gamma='scale', random_state=2),
    'Random Forest': RandomForestClassifier(
        n_estimators=200, max_depth=10, min_samples_split=5,
        min_samples_leaf=2, random_state=2
    ),
    'Gradient Boosting': GradientBoostingClassifier(
        n_estimators=200, max_depth=4, learning_rate=0.1, random_state=2
    ),
    'Logistic Regression': LogisticRegression(max_iter=1000, C=1.0, random_state=2),
}

best_model = None
best_name = None
best_cv = 0

for name, model in models.items():
    print(f"\n--- {name} ---")
    
    # Use scaled data for SVM/LR, raw for tree-based
    if 'Forest' in name or 'Boosting' in name:
        model.fit(X_train, y_train)
        train_acc = accuracy_score(y_train, model.predict(X_train))
        test_acc = accuracy_score(y_test, model.predict(X_test))
        cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
        user_pred = model.predict(user_input)
    else:
        model.fit(X_train_scaled, y_train)
        train_acc = accuracy_score(y_train, model.predict(X_train_scaled))
        test_acc = accuracy_score(y_test, model.predict(X_test_scaled))
        cv_scores = cross_val_score(model, scaler.transform(X), y, cv=5, scoring='accuracy')
        user_pred = model.predict(user_scaled)
    
    print(f"  Train acc: {train_acc*100:.1f}%")
    print(f"  Test acc:  {test_acc*100:.1f}%")
    print(f"  CV acc:    {cv_scores.mean()*100:.1f}% (+/- {cv_scores.std()*100:.1f}%)")
    user_label = "HEART DISEASE" if user_pred[0] == 1 else "NO DISEASE"
    print(f"  User case: {user_pred[0]} -> {user_label}")
    
    if cv_scores.mean() > best_cv:
        best_cv = cv_scores.mean()
        best_model = model
        best_name = name

print("\n" + "="*70)
print(f"BEST MODEL: {best_name} (CV acc: {best_cv*100:.1f}%)")
print("="*70)

# Retrain best model on full training data and evaluate
if 'Forest' in best_name or 'Boosting' in best_name:
    # Tree-based models don't need scaling
    best_model.fit(X_train, y_train)
    y_pred_test = best_model.predict(X_test)
    y_pred_full = best_model.predict(X)
    user_pred = best_model.predict(user_input)
    needs_scaler = False
else:
    best_model.fit(X_train_scaled, y_train)
    y_pred_test = best_model.predict(X_test_scaled)
    y_pred_full = best_model.predict(scaler.transform(X))
    user_pred = best_model.predict(user_scaled)
    needs_scaler = True

print(f"\nTest Classification Report:")
print(classification_report(y_test, y_pred_test, target_names=['No Disease', 'Disease']))

print(f"Confusion Matrix (test):")
print(confusion_matrix(y_test, y_pred_test))

fn = ((y == 1) & (y_pred_full == 0)).sum()
fp = ((y == 0) & (y_pred_full == 1)).sum()
print(f"\nFull dataset - False negatives: {fn}, False positives: {fp}")

user_label = "HEART DISEASE" if user_pred[0] == 1 else "NO DISEASE"
print(f"\nUser [67,1,0,160,286,1,1,108,1,3.5,1,2,3] -> {user_pred[0]} ({user_label})")

# If tree-based won, also show feature importances
if hasattr(best_model, 'feature_importances_'):
    print(f"\nFeature Importances:")
    features = X.columns.tolist()
    importances = best_model.feature_importances_
    for f, imp in sorted(zip(features, importances), key=lambda x: -x[1]):
        print(f"  {f:15s}: {imp:.4f}")

# Save
print("\n" + "="*70)
print("SAVING MODEL...")
pickle.dump(best_model, open('saved_models/heart_disease_model.sav', 'wb'))
if needs_scaler:
    pickle.dump(scaler, open('saved_models/heart_scaler.sav', 'wb'))
    print(f"Saved model (needs scaler): saved_models/heart_disease_model.sav")
    print(f"Saved scaler: saved_models/heart_scaler.sav")
else:
    print(f"Saved model (NO scaler needed): saved_models/heart_disease_model.sav")
    print(f"NOTE: This model does NOT need StandardScaler preprocessing!")

# Save a flag file so app.py knows which type of model is saved
with open('saved_models/heart_model_info.txt', 'w') as f:
    f.write(f"model_type={type(best_model).__name__}\n")
    f.write(f"needs_scaler={'yes' if needs_scaler else 'no'}\n")
    f.write(f"best_name={best_name}\n")
    f.write(f"cv_accuracy={best_cv*100:.1f}\n")

print("\nDone!")
