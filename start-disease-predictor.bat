@echo off
echo ============================================
echo    HealthAI - Disease Predictor Server
echo ============================================
echo.
echo Starting the Streamlit disease prediction app...
echo This will run on http://localhost:8505
echo.
echo Press Ctrl+C to stop the server
echo ============================================
echo.

cd /d "%~dp0Disease ML Model\multiple-disease-prediction-streamlit-app"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Checking dependencies...
python -c "import streamlit, sklearn, numpy" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install streamlit scikit-learn numpy
    if errorlevel 1 (
        echo ERROR: Failed to install required packages
        echo Please check your internet connection and try again
        pause
        exit /b 1
    )
)

echo.
echo Starting Streamlit server...
echo You can now use the Disease Predictor in your React app!
echo.
echo Local URL: http://localhost:8505
echo.

streamlit run app.py --server.port 8505 --server.headless true