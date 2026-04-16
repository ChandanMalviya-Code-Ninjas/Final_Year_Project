"""
One-time script to extract model weights/parameters from sklearn pickle files.
Outputs JSON that can be embedded in the Supabase Edge Function.
"""
import os
import pickle
import json
import numpy as np

working_dir = os.path.dirname(os.path.abspath(__file__))

def extract_model_info(model, name):
    """Extract key information from a sklearn model."""
    info = {
        "name": name,
        "type": type(model).__name__,
        "module": type(model).__module__,
    }
    
    # Check for common sklearn model attributes
    if hasattr(model, 'coef_'):
        info['coef'] = model.coef_.tolist()
    if hasattr(model, 'intercept_'):
        info['intercept'] = model.intercept_.tolist() if hasattr(model.intercept_, 'tolist') else float(model.intercept_)
    if hasattr(model, 'support_vectors_'):
        info['support_vectors'] = model.support_vectors_.tolist()
    if hasattr(model, 'dual_coef_'):
        info['dual_coef'] = model.dual_coef_.tolist()
    if hasattr(model, '_intercept_'):
        info['_intercept'] = model._intercept_.tolist()
    if hasattr(model, 'classes_'):
        info['classes'] = model.classes_.tolist()
    if hasattr(model, 'n_support_'):
        info['n_support'] = model.n_support_.tolist()
    if hasattr(model, 'gamma'):
        info['gamma'] = model.gamma if isinstance(model.gamma, (int, float)) else str(model.gamma)
    if hasattr(model, 'kernel'):
        info['kernel'] = model.kernel
    if hasattr(model, 'C'):
        info['C'] = model.C
    if hasattr(model, '_gamma'):
        info['_gamma'] = float(model._gamma)
    if hasattr(model, 'degree'):
        info['degree'] = model.degree
    if hasattr(model, 'coef0'):
        info['coef0'] = model.coef0
    
    # For scalers inside pipelines
    if hasattr(model, 'scale_'):
        info['scale'] = model.scale_.tolist()
    if hasattr(model, 'mean_'):
        info['mean'] = model.mean_.tolist()
        
    return info

# Load and inspect each model
models = {
    'diabetes': pickle.load(open(f'{working_dir}/saved_models/diabetes_model.sav', 'rb')),
    'heart': pickle.load(open(f'{working_dir}/saved_models/heart_disease_model.sav', 'rb')),
    'parkinsons': pickle.load(open(f'{working_dir}/saved_models/parkinsons_model.sav', 'rb')),
}

all_info = {}
for name, model in models.items():
    print(f"\n{'='*60}")
    print(f"Model: {name}")
    print(f"Type: {type(model).__name__}")
    print(f"Module: {type(model).__module__}")
    
    info = extract_model_info(model, name)
    all_info[name] = info
    
    # Print all attributes
    print(f"Attributes: {[a for a in dir(model) if not a.startswith('__')]}")
    
    if hasattr(model, 'kernel'):
        print(f"Kernel: {model.kernel}")
    if hasattr(model, 'coef_'):
        print(f"Coef shape: {model.coef_.shape}")
    if hasattr(model, 'intercept_'):
        print(f"Intercept: {model.intercept_}")
    if hasattr(model, 'support_vectors_'):
        print(f"Support vectors shape: {model.support_vectors_.shape}")
    if hasattr(model, 'dual_coef_'):
        print(f"Dual coef shape: {model.dual_coef_.shape}")
    if hasattr(model, 'classes_'):
        print(f"Classes: {model.classes_}")
    if hasattr(model, '_gamma'):
        print(f"Gamma (computed): {model._gamma}")

# Save to JSON
output_path = f'{working_dir}/model_weights.json'
with open(output_path, 'w') as f:
    json.dump(all_info, f, indent=2)

print(f"\n\nModel weights saved to: {output_path}")

# Also test predictions with known inputs to verify later
print("\n\n=== Testing predictions ===")

# Test diabetes model
diabetes_test = [6, 148, 72, 35, 0, 33.6, 0.627, 50]
diabetes_pred = models['diabetes'].predict([diabetes_test])
print(f"Diabetes test input: {diabetes_test}")
print(f"Diabetes prediction: {diabetes_pred[0]}")

# Test heart disease model  
heart_test = [63, 1, 3, 145, 233, 1, 0, 150, 0, 2.3, 0, 0, 1]
heart_pred = models['heart'].predict([heart_test])
print(f"Heart test input: {heart_test}")
print(f"Heart prediction: {heart_pred[0]}")

# Test parkinsons model
parkinsons_test = [119.992, 157.302, 74.997, 0.00784, 0.00007, 0.00370, 0.00554, 0.01109, 0.04374, 0.426, 0.02182, 0.03130, 0.02971, 0.06545, 0.02211, 21.033, 0.414783, 0.815285, -4.813031, 0.266482, 2.301442, 0.284654]
parkinsons_pred = models['parkinsons'].predict([parkinsons_test])
print(f"Parkinsons prediction: {parkinsons_pred[0]}")
