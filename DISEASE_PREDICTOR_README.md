# Disease Predictor Setup Guide

## Overview
The Disease Predictor is a machine learning-powered application that provides predictions for:
- **Diabetes** - Based on medical parameters like glucose levels, BMI, age, etc.
- **Heart Disease** - Using cardiovascular health indicators
- **Parkinson's Disease** - Based on voice and movement patterns

## Integration with HealthAI React App

The Disease Predictor runs as a separate Streamlit server and is embedded in the React application via iframe.

## Quick Start (Recommended)

### Method 1: Batch File (Windows)
1. Double-click `start-disease-predictor.bat` in the project root
2. Wait for the server to start (you'll see "Local URL: http://localhost:8505")
3. Open your React app and navigate to Disease Predictor
4. The app will automatically detect and embed the Streamlit interface

### Method 2: Manual Terminal
```bash
# Open a new terminal/command prompt
cd "Disease ML Model/multiple-disease-prediction-streamlit-app"
streamlit run app.py --server.port 8505 --server.headless true
```

### Method 3: Node.js Manager (Advanced)
```bash
# Start the server
node streamlit-manager.js start

# Check status
node streamlit-manager.js status

# Stop the server
node streamlit-manager.js stop
```

## Troubleshooting

### "localhost refused to load" Error
This means the Streamlit server isn't running. Follow these steps:

1. **Check if server is running:**
   - Open http://localhost:8505 in your browser
   - If it loads, the server is running - refresh the React app
   - If it doesn't load, start the server using one of the methods above

2. **Port conflicts:**
   - Make sure nothing else is using port 8505
   - You can change the port in the commands above if needed

3. **Python/Dependencies issues:**
   - Ensure Python 3.7+ is installed
   - Required packages: streamlit, scikit-learn, numpy
   - The batch file will automatically install missing packages

### React App Integration Issues
- The React component automatically checks server status every 10 seconds
- Click "Check Status" button to manually verify connection
- Use "Open Standalone" to test the Streamlit app directly

## File Structure
```
Disease ML Model/
└── multiple-disease-prediction-streamlit-app/
    ├── app.py                 # Main Streamlit application
    ├── saved_models/          # Trained ML models (.sav files)
    ├── dataset/              # Training datasets
    └── requirements.txt      # Python dependencies
```

## Technical Details

### ML Models
- **Diabetes Model**: Trained on Pima Indians Diabetes dataset
- **Heart Disease Model**: Based on Cleveland Heart Disease dataset
- **Parkinson's Model**: Uses voice recording features

### Streamlit Configuration
- **Port**: 8505 (configurable)
- **Mode**: Headless (no browser auto-open)
- **Theme**: Default Streamlit theme

### React Integration
- **Component**: `src/pages/DiseasePredictor.tsx`
- **Connection Check**: Automatic every 10 seconds
- **Fallback**: Direct link to standalone app
- **Error Handling**: Graceful degradation when server unavailable

## Development

### Adding New Models
1. Train your model and save as `.sav` file
2. Add model loading in `app.py`
3. Create prediction interface in Streamlit
4. Update the sidebar navigation

### Customizing the Interface
- Edit `app.py` for Streamlit UI changes
- Modify `DiseasePredictor.tsx` for React integration changes
- Update `streamlit-manager.js` for server management

## Important Notes

⚠️ **Medical Disclaimer**: The predictions are for educational purposes only and should not replace professional medical advice, diagnosis, or treatment.

🔒 **Data Privacy**: All predictions are processed locally. No data is sent to external servers.

📊 **Accuracy**: Model accuracy varies. Always consult healthcare professionals for medical decisions.

## Support
If you encounter issues:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure the Streamlit server is running on the correct port
4. Check browser console for any CORS or network errors