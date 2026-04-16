import pickle, numpy as np

hm = pickle.load(open('saved_models/heart_disease_model.sav', 'rb'))

# User's exact values
x = [67, 1, 0, 160, 286, 1, 1, 108, 1, 3.5, 1, 2, 3]
pred = hm.predict([x])
decision = np.dot(hm.coef_[0], x) + hm.intercept_[0]
sigmoid = 1 / (1 + np.exp(-decision))
print(f"Input: {x}")
print(f"sklearn prediction: {pred[0]}")
print(f"Decision: {decision:.6f}")
print(f"Sigmoid: {sigmoid:.6f}")
if pred[0] == 1:
    print("Result: HEART DISEASE DETECTED")
else:
    print("Result: NO HEART DISEASE")

print()

# Feature contribution breakdown
features = ['age','sex','cp','trestbps','chol','fbs','restecg','thalach','exang','oldpeak','slope','ca','thal']
print("Feature contribution breakdown:")
for i, (name, val) in enumerate(zip(features, x)):
    contrib = hm.coef_[0][i] * val
    print(f"  {name:20s} = {val:8.1f} * coef={hm.coef_[0][i]:12.8f} => {contrib:10.6f}")
print(f"  intercept = {hm.intercept_[0]:.10f}")
print(f"  total decision = {decision:.6f}")
print(f"  sigmoid = {sigmoid:.6f}")

# JS version check
print("\n--- JS dot product check ---")
js_coef = [0.00972776579660922, -1.292456817552437, 0.8890580225917815, -0.012082450410371509, -0.0025807626939402793, -0.07412427998260032, 0.5778499209037506, 0.03402739086100445, -0.9024949094037096, -0.49204990894668654, 0.2423381728516691, -0.7937811940253837, -1.1603417451590055]
js_intercept = -5.154394848665909e-05
js_decision = js_intercept
for c, v in zip(js_coef, x):
    js_decision += c * v
js_sigmoid = 1 / (1 + np.exp(-js_decision))
print(f"JS decision: {js_decision:.6f}")
print(f"JS sigmoid: {js_sigmoid:.6f}")
print(f"JS prediction: {1 if js_sigmoid >= 0.5 else 0}")
print(f"Match sklearn? coefs match: {np.allclose(js_coef, hm.coef_[0])}")
